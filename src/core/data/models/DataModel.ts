export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';

export interface FieldDefinition {
  name: string;
  type: DataType;
  required?: boolean;
  defaultValue?: any;
  validators?: Validator[];
  description?: string;
  metadata?: Record<string, any>;
}

export interface ModelDefinition {
  id: string;
  name: string;
  version: string;
  fields: FieldDefinition[];
  indexes?: string[];
  relations?: ModelRelation[];
  metadata?: Record<string, any>;
}

export interface ModelRelation {
  field: string;
  model: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  foreignKey: string;
  cascade?: boolean;
}

export class DataModel {
  private definition: ModelDefinition;
  private validator: ModelValidator;

  constructor(definition: ModelDefinition) {
    this.definition = definition;
    this.validator = new ModelValidator(definition);
  }

  // 验证数据
  validate(data: Record<string, any>): ValidationResult {
    return this.validator.validate(data);
  }

  // 创建实例
  createInstance(data: Record<string, any>): Record<string, any> {
    const validated = this.validate(data);
    if (!validated.isValid) {
      throw new Error(`Invalid data: ${validated.errors.join(', ')}`);
    }

    // 应用默认值
    const instance = { ...data };
    for (const field of this.definition.fields) {
      if (instance[field.name] === undefined && field.defaultValue !== undefined) {
        instance[field.name] = field.defaultValue;
      }
    }

    return instance;
  }

  // 获取字段定义
  getField(name: string): FieldDefinition | undefined {
    return this.definition.fields.find(f => f.name === name);
  }

  // 获取模型定义
  getDefinition(): ModelDefinition {
    return { ...this.definition };
  }
} 