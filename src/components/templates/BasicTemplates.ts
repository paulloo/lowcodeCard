// 基础组件预设模板
export const BasicTemplates = {
  // 文本组件
  Text: {
    label: '文本',
    icon: 'M13 6v8l4-4m-4 4l-4-4',
    fields: [
      {
        id: 'content',
        type: 'text',
        label: '文本内容',
        path: 'text.content',
        showLabel: false,
        defaultValue: '请输入文本内容',
        style: {
          fontSize: '1rem',
          color: '#333333',
          margin: '0.5rem 0',
          padding: '0.5rem',
          textAlign: 'left'
        },
        options: {
          placeholder: '请输入文本内容',
          rows: 3
        }
      }
    ],
    html: `{{content}}`,
    css: `
.text-content {
  width: 100%;
  line-height: 1.5;
  font-size: 1rem;
  color: #333333;
}`
  },

  // 图片组件
  Image: {
    label: '图片',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    fields: [
      {
        id: 'image',
        type: 'image',
        label: '图片',
        required: true,
        path: 'content.image',
        showLabel: false,
        options: {
          format: 'jpg,jpeg,png,gif',
          maxSize: 5 * 1024 * 1024,
          aspectRatio: '16/9',
          objectFit: 'cover'
        }
      }
    ],
    html: `<img src="{{content.image}}" alt="" style="width:100%; height:auto; border-radius:0.5rem;">`,
    css: `
img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}`
  },

  // 颜色组件
  Color: {
    label: '颜色',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    fields: [
      {
        id: 'color',
        type: 'color',
        label: '颜色',
        path: 'style.color',
        showLabel: false,
        defaultValue: '#333333',
        options: {
          presetColors: [
            '#333333', '#FF6B6B', '#4ECDC4', '#45B7D1',
            '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'
          ],
          opacity: true
        }
      }
    ],
    html: `<div style="background-color:{{color}}; width:100%; height:40px; border-radius:0.5rem;"></div>`,
    css: ``
  }
}; 