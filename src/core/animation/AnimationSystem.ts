export type EasingFunction = (t: number) => number;
export type AnimationFrame = (progress: number) => void;

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: EasingFunction | keyof typeof EASING_FUNCTIONS;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

// 预定义缓动函数
export const EASING_FUNCTIONS = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // ... 更多缓动函数
};

export class Animation {
  private startTime: number = 0;
  private isRunning: boolean = false;
  private frameId: number | null = null;
  private currentIteration: number = 0;

  constructor(
    private frame: AnimationFrame,
    private options: AnimationOptions = {}
  ) {
    this.options = {
      duration: 1000,
      delay: 0,
      easing: 'linear',
      iterations: 1,
      direction: 'normal',
      ...options
    };
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = performance.now() + (this.options.delay || 0);
    this.options.onStart?.();
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsed = now - this.startTime;
    const duration = this.options.duration || 1000;

    if (elapsed < 0) {
      this.frameId = requestAnimationFrame(this.tick);
      return;
    }

    let progress = Math.min(elapsed / duration, 1);
    
    // 处理迭代
    if (this.options.iterations !== 1) {
      const totalDuration = duration * (this.options.iterations || 1);
      if (elapsed > totalDuration) {
        this.stop();
        this.options.onComplete?.();
        return;
      }

      this.currentIteration = Math.floor(elapsed / duration);
      progress = (elapsed % duration) / duration;
    }

    // 处理方向
    if (this.options.direction === 'reverse' || 
        (this.options.direction === 'alternate' && this.currentIteration % 2 === 1)) {
      progress = 1 - progress;
    }

    // 应用缓动函数
    const easing = typeof this.options.easing === 'string' 
      ? EASING_FUNCTIONS[this.options.easing]
      : this.options.easing || EASING_FUNCTIONS.linear;
    
    const easedProgress = easing(progress);

    // 执行动画帧
    this.frame(easedProgress);
    this.options.onUpdate?.(easedProgress);

    if (progress >= 1 && this.options.iterations === 1) {
      this.stop();
      this.options.onComplete?.();
      return;
    }

    this.frameId = requestAnimationFrame(this.tick);
  };
}

export class AnimationSystem {
  private animations: Map<string, Animation> = new Map();
  private isEnabled: boolean = true;

  // 创建新动画
  createAnimation(
    id: string,
    frame: AnimationFrame,
    options?: AnimationOptions
  ): Animation {
    const animation = new Animation(frame, options);
    this.animations.set(id, animation);
    return animation;
  }

  // 启动动画
  start(id: string): void {
    if (!this.isEnabled) return;
    this.animations.get(id)?.start();
  }

  // 停止动画
  stop(id: string): void {
    this.animations.get(id)?.stop();
  }

  // 停止所有动画
  stopAll(): void {
    this.animations.forEach(animation => animation.stop());
  }

  // 启用/禁用动画系统
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  // 清理资源
  cleanup(): void {
    this.stopAll();
    this.animations.clear();
  }
} 