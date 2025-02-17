import html2canvas from 'html2canvas';

export async function generateCardImage(element: HTMLElement) {
  // 1. 创建克隆元素，保持原始样式
  const clone = element.cloneNode(true) as HTMLElement;
  const elementStyles = window.getComputedStyle(element);
  
  // 2. 设置克隆元素的基础样式
  Object.assign(clone.style, {
    position: 'fixed',
    left: '-9999px',
    width: elementStyles.width,
    height: elementStyles.height,
    transform: 'none',
    transformOrigin: '0 0'
  });
  
  document.body.appendChild(clone);

  try {
    // 3. 处理所有图片
    const images = Array.from(clone.getElementsByTagName('img'));
    await Promise.all(images.map(loadAndProcessImage));

    // 4. 生成图片
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
      imageTimeout: 30000,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.firstChild as HTMLElement;
        preserveStyles(clonedElement);
      }
    });

    return canvas.toDataURL('image/png');
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
}

// 加载和处理单个图片
async function loadAndProcessImage(img: HTMLImageElement): Promise<void> {
  // 1. 加载图片获取原始尺寸
  const originalImage = new Image();
  originalImage.crossOrigin = 'anonymous';
  
  await new Promise<void>((resolve, reject) => {
    originalImage.onload = () => resolve();
    originalImage.onerror = reject;
    originalImage.src = img.src;
  });

  // 2. 获取容器和样式
  const container = img.parentElement;
  if (!container) return;

  const containerStyles = window.getComputedStyle(container);
  const imgStyles = window.getComputedStyle(img);

  // 3. 确保容器样式正确
  Object.assign(container.style, {
    position: 'relative',
    overflow: 'hidden',
    display: 'block',
    width: containerStyles.width,
    height: containerStyles.height
  });

  // 4. 计算图片尺寸和位置
  const containerWidth = parseFloat(containerStyles.width);
  const containerHeight = parseFloat(containerStyles.height);
  const imgRatio = originalImage.width / originalImage.height;
  const containerRatio = containerWidth / containerHeight;

  // 5. 设置图片基础样式
  Object.assign(img.style, {
    position: 'absolute',
    margin: '0',
    padding: '0',
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'cover'
  });

  // 6. 根据比例设置图片尺寸和位置
  if (imgRatio > containerRatio) {
    // 图片更宽，以高度为基准
    const width = containerHeight * imgRatio;
    const left = (containerWidth - width) / 2;
    
    Object.assign(img.style, {
      top: '0',
      left: `${left}px`,
      width: `${width}px`,
      height: '100%'
    });
  } else {
    // 图片更高，以宽度为基准
    const height = containerWidth / imgRatio;
    const top = (containerHeight - height) / 2;
    
    Object.assign(img.style, {
      top: `${top}px`,
      left: '0',
      width: '100%',
      height: `${height}px`
    });
  }

  // 7. 复制其他重要样式
  ['border-radius', 'filter', 'opacity'].forEach(prop => {
    const value = imgStyles.getPropertyValue(prop);
    if (value && value !== 'none') {
      img.style.setProperty(prop, value, 'important');
    }
  });
}

// 保持特殊样式
function preserveStyles(element: HTMLElement) {
  element.querySelectorAll('*').forEach(el => {
    if (!(el instanceof HTMLElement)) return;

    const computedStyle = window.getComputedStyle(el);
    
    // 1. 处理变换和效果
    const styleProps = [
      'transform',
      'transform-origin',
      'clip-path',
      '-webkit-clip-path',
      'filter',
      'backdrop-filter',
      'box-shadow',
      'opacity',
      'border-radius'
    ];
    
    styleProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none') {
        el.style.setProperty(prop, value, 'important');
      }
    });

    // 2. 处理图片元素
    if (el.tagName === 'IMG') {
      const container = el.parentElement;
      if (!container) return;

      // 确保容器样式
      Object.assign(container.style, {
        position: 'relative',
        overflow: 'hidden',
        display: 'block'
      });

      // 获取原始样式
      const originalTransform = computedStyle.transform;
      const originalWidth = computedStyle.width;
      const originalHeight = computedStyle.height;

      // 设置图片样式，保持原始变换
      Object.assign(el.style, {
        position: 'absolute',
        objectFit: 'cover',
        width: originalWidth,
        height: originalHeight,
        transform: originalTransform
      });
    }

    // 3. 处理背景
    if (computedStyle.background !== 'none') {
      el.style.setProperty('background', computedStyle.background, 'important');
    }

    // 4. 处理边框
    ['border', 'border-radius'].forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none') {
        el.style.setProperty(prop, value, 'important');
      }
    });
  });
}

// 优化 GIF 生成时的图片处理
export async function optimizeImageForGif(element: HTMLElement) {
  const canvas = await html2canvas(element, {
    scale: 1,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: null,
    imageTimeout: 0,
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.body.firstChild as HTMLElement;
      preserveStyles(clonedElement);
    }
  });

  return canvas;
}

export const downloadCard = (dataUrl: string, filename = 'valentine-card.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 