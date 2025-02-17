// 输入组件预设模板
export const InputTemplates = {
  // 选择框组件
  Select: {
    label: '选择框',
    icon: 'M8 9l4-4 4 4m0 6l-4 4-4-4',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '标签',
        required: true,
        options: {
          group: '基本设置'
        }
      },
      {
        id: 'options',
        type: 'text',
        label: '选项',
        required: true,
        options: {
          rows: 5,
          placeholder: '每行一个选项\n格式：标签=值',
          group: '选项设置'
        }
      },
      {
        id: 'multiple',
        type: 'boolean',
        label: '是否多选',
        options: {
          group: '功能设置'
        }
      },
      {
        id: 'style',
        type: 'select',
        label: '样式',
        options: {
          choices: [
            { label: '默认', value: 'default' },
            { label: '简约', value: 'minimal' },
            { label: '圆角', value: 'rounded' }
          ],
          group: '样式设置'
        }
      }
    ],
    html: `
<div class="select-component {{style}}">
  <label class="select-label">{{label}}</label>
  <select class="select-input" {{#if multiple}}multiple{{/if}}>
    {{#each options}}
      <option value="{{value}}" {{#if selected}}selected{{/if}}>
        {{label}}
      </option>
    {{/each}}
  </select>
</div>`,
    css: `
.select-component {
  margin: 1rem 0;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
}

.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #1a202c;
  transition: all 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

/* 样式变体 */
.select-component.minimal .select-input {
  border: none;
  border-bottom: 2px solid #e2e8f0;
  border-radius: 0;
  padding: 0.5rem 0;
}

.select-component.minimal .select-input:focus {
  border-color: #667eea;
  box-shadow: none;
}

.select-component.rounded .select-input {
  border-radius: 9999px;
  padding: 0.5rem 1.5rem;
}`
  },

  // 滑块组件
  Slider: {
    label: '滑块',
    icon: 'M21 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2zm-2 4H5',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '标签',
        required: true,
        options: {
          group: '基本设置'
        }
      },
      {
        id: 'min',
        type: 'number',
        label: '最小值',
        options: {
          group: '范围设置'
        }
      },
      {
        id: 'max',
        type: 'number',
        label: '最大值',
        options: {
          group: '范围设置'
        }
      },
      {
        id: 'step',
        type: 'number',
        label: '步长',
        options: {
          group: '范围设置'
        }
      },
      {
        id: 'showValue',
        type: 'boolean',
        label: '显示数值',
        options: {
          group: '显示设置'
        }
      }
    ],
    html: `
<div class="slider-component">
  <label class="slider-label">
    {{label}}
    {{#if showValue}}
      <span class="slider-value">{{value}}</span>
    {{/if}}
  </label>
  <input
    type="range"
    class="slider-input"
    min="{{min}}"
    max="{{max}}"
    step="{{step}}"
    value="{{value}}"
  />
</div>`,
    css: `
.slider-component {
  margin: 1rem 0;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.slider-value {
  font-weight: 500;
  color: #667eea;
}

.slider-input {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 9999px;
  outline: none;
  -webkit-appearance: none;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #667eea;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}`
  }
}; 