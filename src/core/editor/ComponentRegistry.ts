import type { ComponentType, EditorComponent, TemplateField } from '../../types/editor';

interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  defaultOptions: Record<string, any>;
  toEditor: (field: TemplateField) => EditorComponent;
  toField: (component: EditorComponent) => TemplateField;
}

class ComponentRegistry {
  private components = new Map<ComponentType, ComponentDefinition>();

  register(type: ComponentType, definition: ComponentDefinition) {
    this.components.set(type, definition);
  }

  get(type: ComponentType) {
    return this.components.get(type);
  }

  getAll() {
    return Array.from(this.components.values());
  }
}

export const componentRegistry = new ComponentRegistry(); 