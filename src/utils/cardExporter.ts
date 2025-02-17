import type { ExportOptions } from '../components/ExportOptions';

interface GenerateProgress {
  onProgress?: (progress: number) => void;
}

export async function generateCardImage(
  element: HTMLElement,
  options: Partial<ExportOptions> & GenerateProgress = {}
): Promise<string> {
  const { default: html2canvas } = await import('html2canvas');
  const { onProgress } = options;
  onProgress?.(0.1); // 开始加载

  try {
    // 等待所有图片加载完成
    const images = element.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('图片加载超时'));
          }, 30000); // 30秒超时

          img.onload = () => {
            clearTimeout(timeout);
            resolve(undefined);
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('图片加载失败'));
          };
        });
      })
    );

    onProgress?.(0.3); // 图片加载完成

    // 克隆元素以避免修改原始DOM
    const clone = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.transform = 'none';
    clone.style.transition = 'none';

    try {
      const canvas = await html2canvas(clone, {
        scale: options.scale || 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.body.firstElementChild as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.transition = 'none';
          }
        }
      });

      onProgress?.(0.7); // 渲染完成

      if (options.format === 'jpg') {
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
      }

      onProgress?.(0.9); // 格式处理完成

      const result = canvas.toDataURL(
        options.format === 'jpg' ? 'image/jpeg' : 'image/png',
        options.quality ? options.quality / 100 : undefined
      );

      onProgress?.(1); // 完成
      return result;
    } finally {
      document.body.removeChild(clone);
    }
  } catch (error) {
    console.error('生成图片失败:', error);
    throw error;
  }
}

export async function generateAnimatedCard(
  element: HTMLElement,
  options: Partial<ExportOptions> & { onProgress?: (progress: number) => void } = {}
): Promise<string> {
  const { default: GIF } = await import('gif.js');

  const gif = new GIF({
    workers: 4,
    quality: 10,
    width: element.clientWidth * (options.scale || 2),
    height: element.clientHeight * (options.scale || 2),
    workerScript: '/gif.worker.js'
  });

  // 生成动画帧
  const frames = 30;
  for (let i = 0; i < frames; i++) {
    const progress = i / frames;
    options.onProgress?.(progress);

    // 更新动画状态
    element.style.setProperty('--animation-progress', progress.toString());
    
    const frame = await generateCardImage(element, {
      ...options,
      format: 'png'
    });

    const img = new Image();
    img.src = frame;
    await new Promise(resolve => { img.onload = resolve; });
    
    gif.addFrame(img, { delay: 50 });
  }

  // 生成GIF
  return new Promise((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      resolve(URL.createObjectURL(blob));
    });
    gif.on('error', reject);
    gif.render();
  });
}

export function downloadCard(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 