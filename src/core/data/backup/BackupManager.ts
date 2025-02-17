export interface BackupMetadata {
  id: string;
  timestamp: number;
  version: string;
  description?: string;
  size: number;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
}

export interface BackupOptions {
  compress?: boolean;
  encrypt?: boolean;
  encryptionKey?: string;
  description?: string;
  includeMetadata?: boolean;
}

export class BackupManager {
  private storage: StorageAdapter;
  private backups: Map<string, BackupMetadata>;
  private maxBackups: number;

  constructor(storage: StorageAdapter, maxBackups: number = 10) {
    this.storage = storage;
    this.backups = new Map();
    this.maxBackups = maxBackups;
  }

  // 创建备份
  async createBackup(data: any, options: BackupOptions = {}): Promise<string> {
    // 生成备份ID
    const backupId = this.generateBackupId();
    
    // 准备备份数据
    let backupData = JSON.stringify(data);
    
    if (options.compress) {
      backupData = await this.compressData(backupData);
    }
    
    if (options.encrypt && options.encryptionKey) {
      backupData = await this.encryptData(backupData, options.encryptionKey);
    }

    // 创建元数据
    const metadata: BackupMetadata = {
      id: backupId,
      timestamp: Date.now(),
      version: data.version || '1.0.0',
      description: options.description,
      size: backupData.length,
      checksum: this.calculateChecksum(backupData),
      compressed: !!options.compress,
      encrypted: !!options.encrypt
    };

    // 保存备份和元数据
    await this.storage.save(`backup_${backupId}`, backupData);
    await this.storage.save(`backup_${backupId}_meta`, metadata);
    
    this.backups.set(backupId, metadata);
    
    // 清理旧备份
    await this.cleanupOldBackups();
    
    return backupId;
  }

  // 恢复备份
  async restoreBackup(backupId: string, options: { decryptionKey?: string } = {}): Promise<any> {
    const metadata = await this.storage.load(`backup_${backupId}_meta`);
    if (!metadata) {
      throw new Error(`Backup ${backupId} not found`);
    }

    let backupData = await this.storage.load(`backup_${backupId}`);
    
    // 验证数据完整性
    const checksum = this.calculateChecksum(backupData);
    if (checksum !== metadata.checksum) {
      throw new Error('Backup data is corrupted');
    }

    if (metadata.encrypted && !options.decryptionKey) {
      throw new Error('Decryption key is required');
    }

    if (metadata.encrypted && options.decryptionKey) {
      backupData = await this.decryptData(backupData, options.decryptionKey);
    }

    if (metadata.compressed) {
      backupData = await this.decompressData(backupData);
    }

    return JSON.parse(backupData);
  }

  // 获取备份列表
  getBackups(): BackupMetadata[] {
    return Array.from(this.backups.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // 删除备份
  async deleteBackup(backupId: string): Promise<void> {
    await this.storage.delete(`backup_${backupId}`);
    await this.storage.delete(`backup_${backupId}_meta`);
    this.backups.delete(backupId);
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = this.getBackups();
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      await Promise.all(toDelete.map(backup => this.deleteBackup(backup.id)));
    }
  }

  private generateBackupId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // 实现压缩、解压缩、加密、解密等辅助方法...
} 