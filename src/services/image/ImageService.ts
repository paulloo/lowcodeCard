import type { UploadResponse } from '../upload/UploadService';
import { UploadService } from '../upload/UploadService';

export class ImageService {
  private static instance: ImageService;
  private uploadService: UploadService;

  private constructor() {
    this.uploadService = new UploadService();
  }

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  // 检查图片URL是否有效
  private async isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && contentType?.startsWith('image/');
    } catch {
      return false;
    }
  }

  // 从URL获取图片数据
  private async fetchImageAsBlob(url: string): Promise<Blob | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  }

  // 从HTML中提取所有图片URL
  private extractImagesFromHTML(html: string): string[] {
    const urls: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith('{{')) {
        urls.push(match[1]);
      }
    }

    // 提取背景图片URL
    const bgRegex = /background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)/g;
    while ((match = bgRegex.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith('{{')) {
        urls.push(match[1]);
      }
    }

    return [...new Set(urls)]; // 去重
  }

  // 处理模板中的图片
  public async processTemplateImages(template: {
    html: string;
    css: string;
  }): Promise<{ html: string; css: string; errors: string[] }> {
    const errors: string[] = [];
    let { html, css } = template;
    
    // 提取所有图片URL
    const htmlUrls = this.extractImagesFromHTML(html);
    const cssUrls = this.extractImagesFromHTML(css);
    const allUrls = [...new Set([...htmlUrls, ...cssUrls])];

    // 处理每个URL
    for (const url of allUrls) {
      try {
        // 跳过已经在我们图床上的图片
        if (url.includes('our-image-server.com')) continue;

        // 验证图片
        const isValid = await this.isImageValid(url);
        if (!isValid) {
          errors.push(`无效的图片URL: ${url}`);
          continue;
        }

        // 获取图片数据
        const imageBlob = await this.fetchImageAsBlob(url);
        if (!imageBlob) {
          errors.push(`无法下载图片: ${url}`);
          continue;
        }

        // 上传到我们的图床
        const uploadResult = await this.uploadService.uploadImage(imageBlob);
        if (!uploadResult.success) {
          errors.push(`图片上传失败: ${url}`);
          continue;
        }

        // 替换URL
        const newUrl = uploadResult.url;
        html = html.replace(new RegExp(url, 'g'), newUrl);
        css = css.replace(new RegExp(url, 'g'), newUrl);

      } catch (error) {
        errors.push(`处理图片时出错 ${url}: ${error.message}`);
      }
    }

    return { html, css, errors };
  }

  // 验证并优化单个图片URL
  public async validateAndOptimizeImageUrl(url: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      // 跳过模板变量
      if (url.includes('{{')) {
        return { success: true, url };
      }

      // 跳过已经在我们图床上的图片
      if (url.includes('our-image-server.com')) {
        return { success: true, url };
      }

      // 验证图片
      const isValid = await this.isImageValid(url);
      if (!isValid) {
        return { 
          success: false, 
          error: '无效的图片URL' 
        };
      }

      // 获取图片数据
      const imageBlob = await this.fetchImageAsBlob(url);
      if (!imageBlob) {
        return { 
          success: false, 
          error: '无法下载图片' 
        };
      }

      // 上传到我们的图床
      const uploadResult = await this.uploadService.uploadImage(imageBlob);
      if (!uploadResult.success) {
        return { 
          success: false, 
          error: '图片上传失败' 
        };
      }

      return { 
        success: true, 
        url: uploadResult.url 
      };

    } catch (error) {
      return { 
        success: false, 
        error: `处理图片时出错: ${error.message}` 
      };
    }
  }
} 