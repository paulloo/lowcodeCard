export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  details?: {
    publicId?: string;
    format?: string;
    width?: number;
    height?: number;
  };
}

export class UploadService {
  private static instance: UploadService | null = null;

  private constructor() {}

  public static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  public async uploadImage(file: Blob): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('开始上传图片:', {
        fileSize: file.size,
        fileType: file.type
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('上传响应错误:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error || data.details || '上传失败');
      }

      if (!data.secure_url) {
        throw new Error('上传响应缺少图片URL');
      }

      return {
        success: true,
        url: data.secure_url,
        details: {
          publicId: data.public_id,
          format: data.format,
          width: data.width,
          height: data.height
        }
      };
    } catch (error) {
      console.error('上传过程错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      };
    }
  }
} 