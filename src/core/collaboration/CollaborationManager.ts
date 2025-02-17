import { EventEmitter } from 'events';

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActive: Date;
}

export interface CollaborationOperation {
  type: 'insert' | 'delete' | 'update' | 'move';
  path: string[];
  value?: any;
  oldValue?: any;
  userId: string;
  timestamp: number;
}

export class CollaborationManager extends EventEmitter {
  private users: Map<string, CollaborationUser> = new Map();
  private operations: CollaborationOperation[] = [];
  private websocket: WebSocket;
  private documentId: string;
  private currentUser: CollaborationUser;

  constructor(documentId: string, currentUser: CollaborationUser, wsUrl: string) {
    super();
    this.documentId = documentId;
    this.currentUser = currentUser;
    this.websocket = new WebSocket(wsUrl);
    this.setupWebSocket();
  }

  // 应用操作
  applyOperation(operation: CollaborationOperation): void {
    this.operations.push(operation);
    this.broadcastOperation(operation);
    this.emit('operation', operation);
  }

  // 更新用户状态
  updateUserState(userId: string, state: Partial<CollaborationUser>): void {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, state, { lastActive: new Date() });
      this.emit('userUpdate', user);
    }
  }

  // 获取在线用户
  getOnlineUsers(): CollaborationUser[] {
    return Array.from(this.users.values());
  }

  // 获取操作历史
  getOperationHistory(): CollaborationOperation[] {
    return [...this.operations];
  }

  private setupWebSocket(): void {
    this.websocket.onopen = () => {
      this.sendJoinMessage();
    };

    this.websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.websocket.onclose = () => {
      this.handleDisconnect();
    };
  }

  private sendJoinMessage(): void {
    this.send({
      type: 'join',
      user: this.currentUser,
      documentId: this.documentId
    });
  }

  private broadcastOperation(operation: CollaborationOperation): void {
    this.send({
      type: 'operation',
      operation
    });
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'userJoin':
        this.handleUserJoin(message.user);
        break;
      case 'userLeave':
        this.handleUserLeave(message.userId);
        break;
      case 'operation':
        this.handleRemoteOperation(message.operation);
        break;
      case 'sync':
        this.handleSync(message.data);
        break;
    }
  }

  private handleUserJoin(user: CollaborationUser): void {
    this.users.set(user.id, user);
    this.emit('userJoin', user);
  }

  private handleUserLeave(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.emit('userLeave', user);
    }
  }

  private handleRemoteOperation(operation: CollaborationOperation): void {
    this.operations.push(operation);
    this.emit('operation', operation);
  }

  private handleSync(data: any): void {
    this.operations = data.operations;
    this.users = new Map(data.users.map((u: CollaborationUser) => [u.id, u]));
    this.emit('sync', data);
  }

  private handleDisconnect(): void {
    // 尝试重连
    setTimeout(() => {
      this.websocket = new WebSocket(this.websocket.url);
      this.setupWebSocket();
    }, 1000);
  }

  private send(data: any): void {
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    }
  }
} 