import { useState, useCallback } from 'react';
import type { ExportOptions } from '../types/export';
import { generateCardImage, downloadCard } from '../utils/cardExporter';

export function useCardExport() {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleExport = useCallback(async (
    container: HTMLElement,
    options: ExportOptions
  ) => {
    let progressTimer: number | undefined;
    
    try {
      setExporting(true);
      setExportProgress(0);
      setExportStatus('准备导出...');

      progressTimer = window.setInterval(() => {
        setExportProgress(prev => Math.min(prev + 0.1, 0.9));
      }, 500);

      const dataUrl = await generateCardImage(container, {
        ...options,
        onProgress: (progress: number) => {
          setExportProgress(progress);
          setExportStatus(
            progress < 0.5 ? '生成图片中...' : 
            progress < 0.8 ? '处理特效中...' : 
            '完成导出...'
          );
        }
      });

      setPreviewUrl(dataUrl);
      return dataUrl;
    } finally {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
      setExporting(false);
    }
  }, []);

  const handleDownload = useCallback((filename: string) => {
    if (!previewUrl) return;
    downloadCard(previewUrl, filename);
    setPreviewUrl(null);
  }, [previewUrl]);

  return {
    exporting,
    exportProgress,
    exportStatus,
    previewUrl,
    setPreviewUrl,
    handleExport,
    handleDownload
  };
} 