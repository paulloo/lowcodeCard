import type { 
  ComponentType, 
  EditorComponent, 
  TemplateField 
} from '../../types/editor';

export class ComponentConverter {
  static toEditor(field: TemplateField): EditorComponent {
    const converter = componentConverters[field.type];
    return converter ? converter.toEditor(field) : {
      ...field,
      hidden: false,
      style: {},
    };
  }

  static toField(component: EditorComponent): TemplateField {
    const converter = componentConverters[component.type];
    return converter ? converter.toField(component) : {
      ...component,
      required: component.required || false,
    };
  }
}

const componentConverters = {
  text: {
    toEditor: (field: TemplateField) => ({
      ...field,
      type: 'text',
      hidden: false,
      style: {},
      options: {
        ...field.options,
        multiline: field.options?.multiline || false,
      }
    }),
    toField: (component: EditorComponent) => ({
      ...component,
      type: 'text',
      required: true,
      options: {
        ...component.options,
        multiline: component.options?.multiline || false,
      }
    })
  },
  // ... 其他组件类型的转换器
}; 