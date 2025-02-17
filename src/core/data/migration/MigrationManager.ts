export interface MigrationStep {
  id: string;
  version: string;
  description: string;
  up: (data: any) => Promise<any>;
  down: (data: any) => Promise<any>;
}

export class MigrationManager {
  private migrations: Map<string, MigrationStep>;
  private appliedMigrations: Set<string>;

  constructor() {
    this.migrations = new Map();
    this.appliedMigrations = new Set();
  }

  // 注册迁移步骤
  registerMigration(migration: MigrationStep): void {
    if (this.migrations.has(migration.id)) {
      throw new Error(`Migration ${migration.id} already exists`);
    }
    this.migrations.set(migration.id, migration);
  }

  // 执行迁移
  async migrate(data: any, targetVersion: string): Promise<any> {
    const steps = this.getMigrationPath(data.version, targetVersion);
    let currentData = data;

    for (const step of steps) {
      try {
        currentData = await step.up(currentData);
        this.appliedMigrations.add(step.id);
      } catch (error) {
        // 回滚已应用的迁移
        await this.rollback(currentData, data.version);
        throw error;
      }
    }

    return {
      ...currentData,
      version: targetVersion
    };
  }

  // 回滚迁移
  async rollback(data: any, targetVersion: string): Promise<any> {
    const steps = this.getMigrationPath(data.version, targetVersion).reverse();
    let currentData = data;

    for (const step of steps) {
      if (this.appliedMigrations.has(step.id)) {
        currentData = await step.down(currentData);
        this.appliedMigrations.delete(step.id);
      }
    }

    return {
      ...currentData,
      version: targetVersion
    };
  }

  private getMigrationPath(fromVersion: string, toVersion: string): MigrationStep[] {
    const steps: MigrationStep[] = [];
    const allMigrations = Array.from(this.migrations.values());
    
    // 根据版本号排序迁移步骤
    allMigrations.sort((a, b) => this.compareVersions(a.version, b.version));

    // 确定迁移方向
    const isUpgrade = this.compareVersions(toVersion, fromVersion) > 0;
    
    // 筛选需要执行的迁移步骤
    for (const migration of allMigrations) {
      if (isUpgrade) {
        if (this.compareVersions(migration.version, fromVersion) > 0 && 
            this.compareVersions(migration.version, toVersion) <= 0) {
          steps.push(migration);
        }
      } else {
        if (this.compareVersions(migration.version, fromVersion) <= 0 && 
            this.compareVersions(migration.version, toVersion) > 0) {
          steps.push(migration);
        }
      }
    }

    return isUpgrade ? steps : steps.reverse();
  }

  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA !== numB) return numA - numB;
    }
    
    return 0;
  }
} 