/**
 * 根据路径设置对象的值，自动创建不存在的中间对象
 */
export function setValueByPath(obj: Record<string, any>, path: string, value: any): void {
  if (!obj || typeof obj !== 'object') {
    throw new Error('First argument must be an object');
  }

  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // 如果当前层级不存在或不是对象，创建一个新对象
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  // 设置最终值
  current[parts[parts.length - 1]] = value;
}

/**
 * 根据路径获取对象的值
 */
export function getValueByPath(obj: Record<string, any>, path: string): any {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return current;
} 