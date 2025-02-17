export interface ExportOptions {
  format: 'png' | 'jpg' | 'gif';
  quality: number;
  scale: number;
  withAnimation?: boolean;
  filename?: string;
  onProgress?: (progress: number) => void;
} 