export const ComponentGroups = {
  Basic: {
    label: '基础组件',
    components: ['text', 'image', 'color', 'select']
  },
  Layout: {
    label: '布局组件',
    components: ['group', 'layout']
  },
  Advanced: {
    label: '高级组件',
    components: ['slider', 'switch']
  }
} as const;

export const ComponentIcons = {
  text: 'M13 6v8l4-4m-4 4l-4-4',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  // ... 其他图标
} as const;

export const ComponentLabels = {
  text: '文本',
  image: '图片',
  // ... 其他标签
} as const; 