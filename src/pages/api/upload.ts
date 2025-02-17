import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

// 确保环境变量存在
const requiredEnvVars = [
  'PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

export const POST: APIRoute = async ({ request }) => {
  console.log('收到上传请求');

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      console.error('无效的文件:', file);
      return new Response(
        JSON.stringify({ error: '请选择要上传的文件' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('文件信息:', {
      size: file.size,
      type: file.type
    });

    // 检查文件大小
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: '文件大小不能超过5MB' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: '只支持JPG、PNG、GIF、WEBP格式的图片' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 转换为 buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 上传到 Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'valentine-cards',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            { width: 1200, crop: 'limit' } // 限制最大宽度
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary上传错误:', error);
            reject(new Error(error.message || '上传到云存储失败'));
          } else {
            console.log('Cloudinary上传成功:', {
              publicId: result?.public_id,
              url: result?.secure_url,
              format: result?.format,
              size: result?.bytes
            });
            resolve(result);
          }
        }
      );

      // 添加错误处理
      uploadStream.on('error', (error) => {
        console.error('上传流错误:', error);
        reject(new Error('文件上传过程中出错'));
      });

      uploadStream.end(buffer);
    });

    if (!result?.secure_url) {
      throw new Error('上传成功但未获取到图片URL');
    }

    return new Response(
      JSON.stringify({
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('上传处理错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return new Response(
      JSON.stringify({ 
        error: '上传失败，请重试',
        details: errorMessage
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 