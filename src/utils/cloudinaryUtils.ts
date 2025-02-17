interface CloudinaryConfig {
  cloudName: string;
}

const config: CloudinaryConfig = {
  cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
};

if (!config.cloudName) {
  throw new Error('Missing required Cloudinary configuration');
}

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  preserveAnimations?: boolean;
}

export function optimizeImageUrl(url: string, options: OptimizeOptions = {}) {
  if (!url.includes('cloudinary')) return url;

  const {
    width = 800,
    height = 800,
    quality = 85,
    preserveAnimations = true
  } = options;

  // 从 URL 中提取基本路径和文件名
  const baseUrl = url.split('/upload/')[0] + '/upload/';
  const fileName = url.split('/upload/')[1];

  // 构建转换参数
  const transforms = [
    'c_fill',  // 裁剪模式
    `w_${width}`,
    `h_${height}`,
    `q_${quality}`,
    preserveAnimations ? 'fl_awebp,fl_animated' : 'fl_awebp', // 保留动画并转换为 WebP
    'f_auto',  // 自动选择最佳格式
  ].join(',');

  return `${baseUrl}${transforms}/${fileName}`;
}

export async function uploadImage(file: File) {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持 JPG、PNG、GIF 和 WebP 格式的图片');
  }

  // 检查文件大小
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('图片大小不能超过 10MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error || '上传失败，请稍后重试');
    }

    return data.secure_url;
  } catch (error) {
    const message = error instanceof Error ? error.message : '网络错误，请检查网络连接';
    throw new Error(message);
  }
} 