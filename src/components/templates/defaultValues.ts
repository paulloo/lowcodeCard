// 默认值配置
export const DefaultValues = {
  // 图片类型默认值
  image: {
    placeholder: 'https://via.placeholder.com/400x300/667eea/ffffff?text=预览图片',
    demo: {
      landscape: 'https://source.unsplash.com/random/800x600',
      portrait: 'https://source.unsplash.com/random/600x800',
      square: 'https://source.unsplash.com/random/600x600'
    }
  },

  // 文本类型默认值
  text: {
    title: '示例标题',
    body: '这是一段示例文本内容，用于展示文本组件的效果。您可以根据需要修改这段文本。',
    quote: '这是一段引用文本，展示引用样式的效果。'
  },

  // 颜色类型默认值
  color: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#ed64a6'
  },

  // 选择框默认选项
  select: {
    defaultChoices: [
      { label: '选项一', value: 'option1' },
      { label: '选项二', value: 'option2' },
      { label: '选项三', value: 'option3' }
    ]
  }
}; 