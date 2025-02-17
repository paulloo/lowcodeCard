import GIF from 'gif.js-upgrade';
import html2canvas from 'html2canvas';

interface GifFrameInfo {
  url: string;
  delay: number;
}

interface GenerateOptions {
  onProgress?: (progress: number) => void;
  timeout?: number;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';  // 添加跨域支持
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function extractGifFrames(url: string): Promise<GifFrameInfo[]> {
  const frames: GifFrameInfo[] = [];
  const frameCount = 10; // 捕获10帧
  
  // 为每一帧生成一个唯一的URL
  for (let i = 0; i < frameCount; i++) {
    frames.push({
      url: `${url}#t=${i}`,  // 添加时间戳来强制浏览器重新加载图片
      delay: 100 // 假设每帧100ms
    });
  }
  
  return frames;
}

export async function generateAnimatedCard(
  element: HTMLElement, 
  frames = 30, 
  duration = 1000,
  options: GenerateOptions = {}
) {
  const { onProgress, timeout = 30000 } = options; // 默认30秒超时
  
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: element.offsetWidth,
    height: element.offsetHeight,
    workerScript: '/gif.worker.js'
  });

  // 添加进度监听
  gif.on('progress', (p: number) => {
    onProgress?.(p);
  });

  // 查找页面中的所有 GIF 图片
  const gifImages = element.querySelectorAll('img[src*=".gif"]');
  const gifFramesMap = new Map<string, GifFrameInfo[]>();

  try {
    // 提取所有 GIF 的帧
    for (const img of gifImages) {
      const frames = await extractGifFrames(img.src);
      gifFramesMap.set(img.src, frames);
    }

    // 生成多帧
    for (let i = 0; i < frames; i++) {
      onProgress?.((i / frames) * 0.5);

      // 更新 GIF 图片的当前帧
      await Promise.all(Array.from(gifImages).map(async (img) => {
        const frames = gifFramesMap.get(img.src);
        if (frames) {
          const frameIndex = i % frames.length;
          const frameUrl = frames[frameIndex].url;
          
          try {
            const corsUrl = frameUrl.replace('/upload/', '/upload/fl_keep_iptc/');
            const newImg = await loadImage(corsUrl);
            img.src = newImg.src;
          } catch (error) {
            console.error('Failed to load frame:', error);
          }
        }
      }));

      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await optimizeImageForGif(element);

      gif.addFrame(canvas, { 
        delay: duration / frames,
        copy: true
      });

      await new Promise(resolve => setTimeout(resolve, duration / frames));
    }

    return await new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('生成超时，请重试'));
      }, timeout);

      gif.on('finished', (blob: Blob) => {
        clearTimeout(timeoutId);
        resolve(URL.createObjectURL(blob));
      });

      gif.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });

      gif.render();
    });
  } catch (error) {
    throw new Error(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
} 