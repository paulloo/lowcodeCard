type KeyCommand = string | string[]; // 支持组合键，如 'ctrl+s' 或 ['ctrl', 's']
type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  command: KeyCommand;
  handler: KeyHandler;
  description?: string;
  group?: string;
  disabled?: boolean;
}

export class KeyboardManager {
  private shortcuts: Map<string, ShortcutConfig>;
  private groups: Map<string, Set<string>>;
  private isEnabled: boolean = true;

  constructor() {
    this.shortcuts = new Map();
    this.groups = new Map();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  // 初始化
  initialize() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  // 注册快捷键
  register(id: string, config: ShortcutConfig): void {
    this.shortcuts.set(id, config);
    
    if (config.group) {
      if (!this.groups.has(config.group)) {
        this.groups.set(config.group, new Set());
      }
      this.groups.get(config.group)!.add(id);
    }
  }

  // 注销快捷键
  unregister(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut?.group) {
      this.groups.get(shortcut.group)?.delete(id);
    }
    this.shortcuts.delete(id);
  }

  // 启用/禁用快捷键
  enable(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.disabled = false;
    }
  }

  disable(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.disabled = true;
    }
  }

  // 启用/禁用组
  enableGroup(group: string): void {
    this.groups.get(group)?.forEach(id => this.enable(id));
  }

  disableGroup(group: string): void {
    this.groups.get(group)?.forEach(id => this.disable(id));
  }

  // 获取所有快捷键
  getShortcuts(): Map<string, ShortcutConfig> {
    return new Map(this.shortcuts);
  }

  // 清理
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts.clear();
    this.groups.clear();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const key = this.normalizeKey(event);
    
    for (const [id, config] of this.shortcuts) {
      if (config.disabled) continue;

      const command = Array.isArray(config.command) 
        ? config.command.join('+') 
        : config.command;

      if (key === command.toLowerCase()) {
        event.preventDefault();
        config.handler(event);
        break;
      }
    }
  }

  private normalizeKey(event: KeyboardEvent): string {
    const keys: string[] = [];
    
    if (event.ctrlKey) keys.push('ctrl');
    if (event.altKey) keys.push('alt');
    if (event.shiftKey) keys.push('shift');
    if (event.metaKey) keys.push('meta');
    
    if (event.key !== 'Control' && 
        event.key !== 'Alt' && 
        event.key !== 'Shift' && 
        event.key !== 'Meta') {
      keys.push(event.key.toLowerCase());
    }
    
    return keys.join('+');
  }
} 