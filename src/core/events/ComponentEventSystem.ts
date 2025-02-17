type EventHandler = (event: any) => void;

export class ComponentEventSystem {
  private eventMap: Map<string, Set<EventHandler>>;
  private instanceEventMap: Map<string, Map<string, Set<EventHandler>>>;

  constructor() {
    this.eventMap = new Map();
    this.instanceEventMap = new Map();
  }

  // 全局事件监听
  on(eventName: string, handler: EventHandler) {
    if (!this.eventMap.has(eventName)) {
      this.eventMap.set(eventName, new Set());
    }
    this.eventMap.get(eventName)!.add(handler);
  }

  // 实例事件监听
  onInstance(instanceId: string, eventName: string, handler: EventHandler) {
    if (!this.instanceEventMap.has(instanceId)) {
      this.instanceEventMap.set(instanceId, new Map());
    }
    
    const instanceEvents = this.instanceEventMap.get(instanceId)!;
    if (!instanceEvents.has(eventName)) {
      instanceEvents.set(eventName, new Set());
    }
    
    instanceEvents.get(eventName)!.add(handler);
  }

  // 触发事件
  emit(eventName: string, event: any) {
    // 触发全局事件
    const handlers = this.eventMap.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }

    // 触发实例事件
    if (event.instanceId) {
      const instanceEvents = this.instanceEventMap.get(event.instanceId);
      if (instanceEvents) {
        const instanceHandlers = instanceEvents.get(eventName);
        if (instanceHandlers) {
          instanceHandlers.forEach(handler => handler(event));
        }
      }
    }
  }
} 