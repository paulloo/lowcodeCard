type Listener<T> = (state: T) => void;
type Selector<T, R> = (state: T) => R;
type Reducer<T> = (state: T) => T;

export class StateManager<T extends object> {
  private state: T;
  private listeners: Set<Listener<T>>;
  private selectors: Map<Selector<T, any>, Set<Listener<any>>>;

  constructor(initialState: T) {
    this.state = initialState;
    this.listeners = new Set();
    this.selectors = new Map();
  }

  // 获取状态
  getState(): Readonly<T> {
    return Object.freeze({ ...this.state });
  }

  // 更新状态
  setState(reducer: Reducer<T>): void {
    const newState = reducer(this.state);
    if (newState === this.state) return;

    this.state = newState;
    this.notifyListeners();
  }

  // 订阅状态变化
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 使用选择器订阅
  select<R>(selector: Selector<T, R>, listener: Listener<R>): () => void {
    if (!this.selectors.has(selector)) {
      this.selectors.set(selector, new Set());
    }
    this.selectors.get(selector)!.add(listener);

    // 立即触发一次
    listener(selector(this.state));

    return () => this.selectors.get(selector)?.delete(listener);
  }

  private notifyListeners(): void {
    // 通知普通监听器
    this.listeners.forEach(listener => listener(this.state));

    // 通知选择器监听器
    this.selectors.forEach((listeners, selector) => {
      const selectedValue = selector(this.state);
      listeners.forEach(listener => listener(selectedValue));
    });
  }
} 