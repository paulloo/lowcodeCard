export const CSS_SNIPPETS = {
  布局: [
    {
      label: 'flex-center',
      detail: 'Flex 居中布局',
      insertText: [
        'display: flex;',
        'align-items: center;',
        'justify-content: center;'
      ].join('\n')
    },
    {
      label: 'grid-2cols',
      detail: '两列网格布局',
      insertText: [
        'display: grid;',
        'grid-template-columns: repeat(2, 1fr);',
        'gap: 1rem;'
      ].join('\n')
    },
    {
      label: 'absolute-center',
      detail: '绝对定位居中',
      insertText: [
        'position: absolute;',
        'top: 50%;',
        'left: 50%;',
        'transform: translate(-50%, -50%);'
      ].join('\n')
    }
  ],
  动画: [
    {
      label: 'fade-in',
      detail: '渐入动画',
      insertText: [
        '@keyframes fadeIn {',
        '  from { opacity: 0; }',
        '  to { opacity: 1; }',
        '}',
        '',
        'animation: fadeIn 0.3s ease-in-out;'
      ].join('\n')
    },
    {
      label: 'scale',
      detail: '缩放动画',
      insertText: [
        '@keyframes scale {',
        '  0% { transform: scale(1); }',
        '  50% { transform: scale(1.1); }',
        '  100% { transform: scale(1); }',
        '}',
        '',
        'animation: scale 2s infinite;'
      ].join('\n')
    },
    {
      label: 'slide-up',
      detail: '向上滑入',
      insertText: [
        '@keyframes slideUp {',
        '  from { transform: translateY(20px); opacity: 0; }',
        '  to { transform: translateY(0); opacity: 1; }',
        '}',
        '',
        'animation: slideUp 0.3s ease-out;'
      ].join('\n')
    }
  ],
  效果: [
    {
      label: 'glass',
      detail: '毛玻璃效果',
      insertText: [
        'background: rgba(255, 255, 255, 0.1);',
        'backdrop-filter: blur(10px);',
        'border: 1px solid rgba(255, 255, 255, 0.2);',
        'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);'
      ].join('\n')
    },
    {
      label: 'gradient',
      detail: '渐变背景',
      insertText: [
        'background: linear-gradient(135deg, var(--color-1), var(--color-2));'
      ].join('\n')
    },
    {
      label: 'shadow-hover',
      detail: '悬浮阴影效果',
      insertText: [
        'transition: all 0.3s ease;',
        'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);',
        '',
        '&:hover {',
        '  transform: translateY(-2px);',
        '  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);',
        '}'
      ].join('\n')
    }
  ],
  响应式: [
    {
      label: 'mobile',
      detail: '移动端媒体查询',
      insertText: [
        '@media (max-width: 768px) {',
        '  $1',
        '}'
      ].join('\n')
    },
    {
      label: 'desktop',
      detail: '桌面端媒体查询',
      insertText: [
        '@media (min-width: 1024px) {',
        '  $1',
        '}'
      ].join('\n')
    }
  ]
};

export const HTML_SNIPPETS = {
  基础元素: [
    {
      label: 'img',
      detail: '图片元素',
      insertText: '<img src="${1}" alt="${2}" class="${3}" />',
      insertTextRules: 2
    },
    {
      label: 'div',
      detail: 'div容器',
      insertText: [
        '<div class="${1:container}">',
        '  ${2}',
        '</div>'
      ].join('\n'),
      insertTextRules: 2
    }
  ],
  模板组件: [
    {
      label: 'photo-card',
      detail: '照片卡片',
      insertText: [
        '<div class="photo-card">',
        '  <div class="photo">',
        '    <img src="{{images.self}}" alt="照片" />',
        '  </div>',
        '  <div class="message">{{message}}</div>',
        '</div>'
      ].join('\n')
    },
    {
      label: 'gallery',
      detail: '图片画廊',
      insertText: [
        '<div class="gallery">',
        '  <div class="photo main">',
        '    <img src="{{images.self}}" alt="主图" />',
        '  </div>',
        '  <div class="photo sub">',
        '    <img src="{{images.partner}}" alt="配图" />',
        '  </div>',
        '</div>'
      ].join('\n')
    }
  ]
}; 