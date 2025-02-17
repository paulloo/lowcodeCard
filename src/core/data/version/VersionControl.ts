export interface Version {
  major: number;
  minor: number;
  patch: number;
  timestamp: number;
  hash: string;
}

export interface VersionedData<T> {
  version: Version;
  data: T;
  parent?: string; // 父版本hash
  metadata?: Record<string, any>;
}

export class VersionControl<T> {
  private versions: Map<string, VersionedData<T>>;
  private head: string | null;

  constructor() {
    this.versions = new Map();
    this.head = null;
  }

  // 创建新版本
  commit(data: T, type: 'major' | 'minor' | 'patch' = 'patch'): string {
    const currentVersion = this.getCurrentVersion();
    const newVersion = this.incrementVersion(currentVersion, type);
    const hash = this.generateHash(data, newVersion);

    this.versions.set(hash, {
      version: newVersion,
      data,
      parent: this.head
    });

    this.head = hash;
    return hash;
  }

  // 切换到指定版本
  checkout(hash: string): T {
    const version = this.versions.get(hash);
    if (!version) {
      throw new Error(`Version ${hash} not found`);
    }
    this.head = hash;
    return version.data;
  }

  // 获取版本历史
  getHistory(): VersionedData<T>[] {
    const history: VersionedData<T>[] = [];
    let current = this.head;

    while (current) {
      const version = this.versions.get(current);
      if (!version) break;
      
      history.push(version);
      current = version.parent;
    }

    return history;
  }

  // 比较版本差异
  diff(hashA: string, hashB: string): any {
    const versionA = this.versions.get(hashA);
    const versionB = this.versions.get(hashB);

    if (!versionA || !versionB) {
      throw new Error('Version not found');
    }

    return this.computeDiff(versionA.data, versionB.data);
  }

  private getCurrentVersion(): Version | null {
    if (!this.head) return null;
    return this.versions.get(this.head)?.version || null;
  }

  private incrementVersion(current: Version | null, type: 'major' | 'minor' | 'patch'): Version {
    const base = current || { major: 0, minor: 0, patch: 0, timestamp: 0, hash: '' };
    
    switch (type) {
      case 'major':
        return { ...base, major: base.major + 1, minor: 0, patch: 0, timestamp: Date.now(), hash: '' };
      case 'minor':
        return { ...base, minor: base.minor + 1, patch: 0, timestamp: Date.now(), hash: '' };
      case 'patch':
        return { ...base, patch: base.patch + 1, timestamp: Date.now(), hash: '' };
    }
  }

  private generateHash(data: T, version: Version): string {
    const content = JSON.stringify({ data, version });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private computeDiff(a: any, b: any): any {
    // 这里可以实现更复杂的差异比较算法
    // 简单实现仅作示例
    if (typeof a !== typeof b) return { from: a, to: b };
    if (typeof a !== 'object') return a === b ? undefined : { from: a, to: b };
    
    const diff: Record<string, any> = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    
    for (const key of keys) {
      const valueDiff = this.computeDiff(a[key], b[key]);
      if (valueDiff) diff[key] = valueDiff;
    }
    
    return Object.keys(diff).length ? diff : undefined;
  }
} 