export interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async save(key: string, data: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async load(key: string): Promise<any> {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

export class DataPersistenceManager {
  private adapter: StorageAdapter;
  private cache: Map<string, any>;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
    this.cache = new Map();
  }

  async save(key: string, data: any): Promise<void> {
    await this.adapter.save(key, data);
    this.cache.set(key, data);
  }

  async load(key: string): Promise<any> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const data = await this.adapter.load(key);
    if (data) {
      this.cache.set(key, data);
    }
    return data;
  }

  async delete(key: string): Promise<void> {
    await this.adapter.delete(key);
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
    this.cache.clear();
  }

  // 批量操作
  async bulkSave(items: Record<string, any>): Promise<void> {
    const operations = Object.entries(items).map(([key, data]) => 
      this.save(key, data)
    );
    await Promise.all(operations);
  }

  // 缓存控制
  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(key: string): void {
    this.cache.delete(key);
  }
} 