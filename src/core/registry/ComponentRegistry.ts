import type { ComponentType, ComponentDefinition } from '../../types/editor';
import { ComponentGroups } from '../../constants/componentConfig';

type GroupType = keyof typeof ComponentGroups;

class ComponentRegistry {
  private components = new Map<ComponentType, ComponentDefinition>();
  private groups = new Map<GroupType, ComponentType[]>();

  register(type: ComponentType, definition: ComponentDefinition) {
    this.components.set(type, definition);
    
    const group = (definition.group || 'Basic') as GroupType;
    if (!this.groups.has(group)) {
      this.groups.set(group, []);
    }
    this.groups.get(group)?.push(type);
  }

  get(type: ComponentType) {
    return this.components.get(type);
  }

  getByGroup(group: GroupType) {
    return this.groups.get(group)?.map(type => this.components.get(type)) || [];
  }

  getAllGroups() {
    return Array.from(this.groups.keys());
  }
}

export const componentRegistry = new ComponentRegistry(); 