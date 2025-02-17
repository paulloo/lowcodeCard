export interface Version {
  major: number;
  minor: number;
  patch: number;
}

export interface VersionMetadata {
  version: Version;
  timestamp: number;
  changes: string[];
  author: string;
  compatibility?: {
    minVersion?: Version;
    maxVersion?: Version;
    dependencies?: Record<string, Version>;
  };
}

export class ComponentVersionManager {
  private versions: Map<string, VersionMetadata[]>;

  constructor() {
    this.versions = new Map();
  }

  // 添加新版本
  addVersion(componentId: string, metadata: VersionMetadata) {
    if (!this.versions.has(componentId)) {
      this.versions.set(componentId, []);
    }
    this.versions.get(componentId)!.push(metadata);
  }

  // 检查版本兼容性
  checkCompatibility(componentId: string, version: Version): boolean {
    const metadata = this.getVersionMetadata(componentId, version);
    if (!metadata?.compatibility) return true;

    const { minVersion, maxVersion } = metadata.compatibility;
    return this.isVersionInRange(version, minVersion, maxVersion);
  }

  // 获取最新版本
  getLatestVersion(componentId: string): Version | null {
    const versions = this.versions.get(componentId);
    if (!versions?.length) return null;
    return versions[versions.length - 1].version;
  }

  private isVersionInRange(version: Version, min?: Version, max?: Version): boolean {
    if (min && this.compareVersions(version, min) < 0) return false;
    if (max && this.compareVersions(version, max) > 0) return false;
    return true;
  }

  private compareVersions(a: Version, b: Version): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }
} 