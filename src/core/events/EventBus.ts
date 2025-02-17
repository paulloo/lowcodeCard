type EventHandler = (...args: any[]) => void;

export class EventBus {
  private events: Map<string, Set<EventHandler>>;
  private onceEvents: Map<string, Set<EventHandler>>;

  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  // 订阅事件
  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);

    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  // 一次性订阅
  once(event: string, handler: EventHandler): () => void {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }
    this.onceEvents.get(event)!.add(handler);

    return () => this.off(event, handler, true);
  }

  // 取消订阅
  off(event: string, handler: EventHandler, once = false): void {
    const events = once ? this.onceEvents : this.events;
    events.get(event)?.delete(handler);
  }

  // 触发事件
  emit(event: string, ...args: any[]): void {
    // 处理普通订阅
    this.events.get(event)?.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });

    // 处理一次性订阅
    this.onceEvents.get(event)?.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in once event handler for ${event}:`, error);
      }
    });
    this.onceEvents.delete(event);
  }

  // 清理所有订阅
  clear(): void {
    this.events.clear();
    this.onceEvents.clear();
  }
} 