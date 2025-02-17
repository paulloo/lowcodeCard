declare module 'gif.js-upgrade' {
  export interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
  }

  export default class GIF {
    constructor(options: GIFOptions);
    addFrame(canvas: HTMLCanvasElement, options?: { delay: number }): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    render(): void;
  }
} 