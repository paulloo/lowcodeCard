import type { EditorComponent } from '../types/editor';
import type { TemplateField } from '../types/template';

/**
 * 根据 ID 查找组件
 */
export function findComponentById(components: EditorComponent[], id: string): EditorComponent | null {
  // 先在当前层级查找
  const component = components.find(c => c.id === id);
  if (component) return component;

  // 递归查找子组件
  for (const comp of components) {
    if (comp.children) {
      const found = findComponentById(comp.children, id);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 更新组件属性
 */
export function updateComponent(
  components: EditorComponent[],
  id: string,
  updates: Partial<EditorComponent>
): EditorComponent[] {
  return components.map(component => {
    if (component.id === id) {
      return { ...component, ...updates };
    }
    if (component.children) {
      return {
        ...component,
        children: updateComponent(component.children, id, updates)
      };
    }
    return component;
  });
}

/**
 * 移动组件位置
 */
export function moveComponent(
  components: EditorComponent[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside' = 'before'
): EditorComponent[] {
  // 找到源组件
  const source = findComponentById(components, sourceId);
  if (!source) return components;

  const result: EditorComponent[] = [];
  let handled = false;

  for (const component of components) {
    if (component.id === targetId) {
      // 根据位置插入源组件
      if (position === 'before' && !handled) {
        result.push(source);
        handled = true;
      }
      result.push(component);
      if (position === 'after' && !handled) {
        result.push(source);
        handled = true;
      }
      if (position === 'inside' && !handled) {
        component.children = component.children || [];
        component.children.push(source);
        handled = true;
      }
    } else if (component.id !== sourceId) {
      // 递归处理子组件
      result.push({
        ...component,
        children: component.children 
          ? moveComponent(component.children, sourceId, targetId, position)
          : undefined
      });
    }
  }

  return result;
}

/**
 * 删除组件
 */
export function removeComponent(
  components: EditorComponent[],
  id: string
): EditorComponent[] {
  return components.filter(component => {
    if (component.id === id) return false;
    if (component.children) {
      component.children = removeComponent(component.children, id);
    }
    return true;
  });
}

/**
 * 插入组件
 */
export function insertComponent(
  components: EditorComponent[],
  component: EditorComponent,
  targetId?: string,
  position: 'before' | 'after' | 'inside' = 'after'
): EditorComponent[] {
  if (!targetId) {
    return [...components, component];
  }

  const result: EditorComponent[] = [];
  let handled = false;

  for (const existing of components) {
    if (existing.id === targetId) {
      if (position === 'before') {
        result.push(component);
        result.push(existing);
        handled = true;
      } else if (position === 'after') {
        result.push(existing);
        result.push(component);
        handled = true;
      } else if (position === 'inside') {
        existing.children = existing.children || [];
        existing.children.push(component);
        result.push(existing);
        handled = true;
      }
    } else {
      if (existing.children) {
        result.push({
          ...existing,
          children: insertComponent(existing.children, component, targetId, position)
        });
      } else {
        result.push(existing);
      }
    }
  }

  if (!handled) {
    result.push(component);
  }

  return result;
} 