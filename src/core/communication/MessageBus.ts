type MessageHandler = (message: any, sender: string) => void;

export class MessageBus {
  private channels: Map<string, Set<MessageHandler>>;
  private componentChannels: Map<string, Set<string>>;

  constructor() {
    this.channels = new Map();
    this.componentChannels = new Map();
  }

  // 订阅频道
  subscribe(componentId: string, channel: string, handler: MessageHandler): () => void {
    // 注册频道处理器
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(handler);

    // 记录组件订阅
    if (!this.componentChannels.has(componentId)) {
      this.componentChannels.set(componentId, new Set());
    }
    this.componentChannels.get(componentId)!.add(channel);

    return () => this.unsubscribe(componentId, channel, handler);
  }

  // 取消订阅
  unsubscribe(componentId: string, channel: string, handler: MessageHandler): void {
    this.channels.get(channel)?.delete(handler);
    this.componentChannels.get(componentId)?.delete(channel);
  }

  // 发送消息
  publish(sender: string, channel: string, message: any): void {
    this.channels.get(channel)?.forEach(handler => {
      try {
        handler(message, sender);
      } catch (error) {
        console.error(`Error handling message in channel ${channel}:`, error);
      }
    });
  }

  // 清理组件的所有订阅
  cleanupComponent(componentId: string): void {
    const channels = this.componentChannels.get(componentId);
    if (channels) {
      channels.forEach(channel => {
        const handlers = this.channels.get(channel);
        if (handlers) {
          handlers.forEach(handler => {
            this.unsubscribe(componentId, channel, handler);
          });
        }
      });
      this.componentChannels.delete(componentId);
    }
  }
} 