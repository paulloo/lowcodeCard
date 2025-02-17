declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string | null;
  }

  interface Html2Canvas {
    (element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  }

  const html2canvas: Html2Canvas;
  export default html2canvas;
} 