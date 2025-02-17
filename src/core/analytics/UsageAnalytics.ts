export interface AnalyticsEvent {
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  events: AnalyticsEvent[];
  metadata: Record<string, any>;
}

export interface AnalyticsOptions {
  enabled?: boolean;
  sessionTimeout?: number;
  batchSize?: number;
  reportingEndpoint?: string;
  reportingInterval?: number;
  sampling?: number;
  anonymizeIp?: boolean;
  userIdProvider?: () => string | undefined;
}

export class UsageAnalytics {
  private currentSession: UserSession;
  private options: Required<AnalyticsOptions>;
  private reportingTimer: number | null = null;
  private eventQueue: AnalyticsEvent[] = [];

  constructor(options: AnalyticsOptions = {}) {
    this.options = {
      enabled: true,
      sessionTimeout: 30 * 60 * 1000, // 30分钟
      batchSize: 50,
      reportingEndpoint: '',
      reportingInterval: 60 * 1000, // 1分钟
      sampling: 1, // 100%采样
      anonymizeIp: true,
      userIdProvider: () => undefined,
      ...options
    };

    this.currentSession = this.createNewSession();
    this.setupSessionTracking();
  }

  // 追踪事件
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      type: 'event',
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      userId: this.options.userIdProvider()
    };

    this.processEvent(event);
  }

  // 追踪页面访问
  trackPageView(
    path: string,
    title?: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent('pageview', path, title, undefined, metadata);
  }

  // 追踪用户行为
  trackUserAction(
    action: string,
    target?: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent('user_action', action, target, undefined, metadata);
  }

  // 开始分析
  start(): void {
    if (!this.options.enabled) return;

    this.reportingTimer = window.setInterval(
      () => this.reportEvents(),
      this.options.reportingInterval
    );
  }

  // 停止分析
  stop(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
      this.reportingTimer = null;
    }
  }

  private createNewSession(): UserSession {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      events: [],
      metadata: {}
    };
  }

  private setupSessionTracking(): void {
    // 监听用户活动
    ['click', 'mousemove', 'keypress'].forEach(eventType => {
      window.addEventListener(eventType, () => this.updateSessionActivity());
    });

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkSession();
      }
    });
  }

  private updateSessionActivity(): void {
    this.currentSession.lastActivity = Date.now();
  }

  private checkSession(): void {
    const now = Date.now();
    if (now - this.currentSession.lastActivity > this.options.sessionTimeout) {
      // 会话超时，创建新会话
      this.currentSession = this.createNewSession();
    }
  }

  private shouldTrack(): boolean {
    return this.options.enabled && Math.random() < this.options.sampling;
  }

  private processEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);
    this.currentSession.events.push(event);

    if (this.eventQueue.length >= this.options.batchSize) {
      this.reportEvents();
    }
  }

  private async reportEvents(): Promise<void> {
    if (!this.options.reportingEndpoint || this.eventQueue.length === 0) return;

    const eventsToReport = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(this.options.reportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.currentSession.id,
          events: eventsToReport,
          metadata: this.currentSession.metadata
        })
      });
    } catch (error) {
      // 报告失败，将事件放回队列
      this.eventQueue.unshift(...eventsToReport);
      console.error('Failed to report analytics events:', error);
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 