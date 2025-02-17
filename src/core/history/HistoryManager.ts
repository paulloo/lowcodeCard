interface HistoryState<T> {
  data: T;
  timestamp: number;
  description?: string;
}

export class HistoryManager<T> {
  private states: HistoryState<T>[];
  private currentIndex: number;
  private maxStates: number;

  constructor(initialState: T, maxStates = 50) {
    this.states = [{
      data: initialState,
      timestamp: Date.now()
    }];
    this.currentIndex = 0;
    this.maxStates = maxStates;
  }

  // 添加新状态
  push(state: T, description?: string): void {
    // 如果不在最新状态，清除之后的历史
    if (this.currentIndex < this.states.length - 1) {
      this.states = this.states.slice(0, this.currentIndex + 1);
    }

    // 添加新状态
    this.states.push({
      data: state,
      timestamp: Date.now(),
      description
    });

    // 限制历史记录数量
    if (this.states.length > this.maxStates) {
      this.states = this.states.slice(-this.maxStates);
    }

    this.currentIndex = this.states.length - 1;
  }

  // 撤销
  undo(): T | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.states[this.currentIndex].data;
    }
    return null;
  }

  // 重做
  redo(): T | null {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      return this.states[this.currentIndex].data;
    }
    return null;
  }

  // 获取当前状态
  current(): T {
    return this.states[this.currentIndex].data;
  }

  // 获取历史记录
  getHistory(): HistoryState<T>[] {
    return this.states;
  }

  // 清空历史
  clear(initialState: T): void {
    this.states = [{
      data: initialState,
      timestamp: Date.now()
    }];
    this.currentIndex = 0;
  }
} 