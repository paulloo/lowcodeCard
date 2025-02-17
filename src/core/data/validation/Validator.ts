export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  field?: string;
}

export interface Validator {
  validate(value: any, field: FieldDefinition): ValidationResult;
}

export class RequiredValidator implements Validator {
  validate(value: any, field: FieldDefinition): ValidationResult {
    const isValid = value !== undefined && value !== null && value !== '';
    return {
      isValid,
      errors: isValid ? [] : [`${field.name} is required`],
      field: field.name
    };
  }
}

export class TypeValidator implements Validator {
  validate(value: any, field: FieldDefinition): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, errors: [] };
    }

    let isValid = true;
    const errors: string[] = [];

    switch (field.type) {
      case 'string':
        isValid = typeof value === 'string';
        break;
      case 'number':
        isValid = typeof value === 'number' && !isNaN(value);
        break;
      case 'boolean':
        isValid = typeof value === 'boolean';
        break;
      case 'date':
        isValid = value instanceof Date && !isNaN(value.getTime());
        break;
      case 'array':
        isValid = Array.isArray(value);
        break;
      case 'object':
        isValid = typeof value === 'object' && !Array.isArray(value) && value !== null;
        break;
    }

    if (!isValid) {
      errors.push(`${field.name} must be of type ${field.type}`);
    }

    return {
      isValid,
      errors,
      field: field.name
    };
  }
}

export class ModelValidator {
  private validators: Map<string, Validator[]>;

  constructor(definition: ModelDefinition) {
    this.validators = new Map();
    this.initializeValidators(definition);
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: string[] = [];

    for (const [fieldName, fieldValidators] of this.validators) {
      const field = data[fieldName];
      
      for (const validator of fieldValidators) {
        const result = validator.validate(field, { name: fieldName } as FieldDefinition);
        if (!result.isValid) {
          errors.push(...result.errors);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private initializeValidators(definition: ModelDefinition) {
    for (const field of definition.fields) {
      const fieldValidators: Validator[] = [];

      // 添加必需验证器
      if (field.required) {
        fieldValidators.push(new RequiredValidator());
      }

      // 添加类型验证器
      fieldValidators.push(new TypeValidator());

      // 添加自定义验证器
      if (field.validators) {
        fieldValidators.push(...field.validators);
      }

      this.validators.set(field.name, fieldValidators);
    }
  }
} 