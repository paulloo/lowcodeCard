import { useState, useEffect } from 'react';
import type { Template } from '../../../../types/editor';
import TemplateRenderer from '../../preview/TemplateRenderer';
import { useEditor } from '../../../../core/editor/EditorContext';

interface Props {
  template: Template;
  variables?: Record<string, any>;
}

export default function PreviewPanel({ template, variables = {} }: Props) {
  const [previewVariables, setPreviewVariables] = useState(variables);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 生成预览数据
    const newVariables = { ...variables };
    template.fields?.forEach(field => {
      if (!(field.id in newVariables)) {
        newVariables[field.id] = field.defaultValue ?? getDefaultValueByType(field.type);
      }
    });
    setPreviewVariables(newVariables);
  }, [template, variables]);

  return (
    <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">实时预览</h3>
      </div>
      <div className="p-4">
        <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
          <TemplateRenderer
            template={template}
            variables={{}}
            scale={0.5}
          />
        </div>
      </div>
    </div>
  );
}

// 根据字段类型获取默认值
function getDefaultValueByType(type: string) {
  switch (type) {
    case 'text':
      return '示例文本';
    case 'image':
      return '/placeholder.jpg';
    case 'color':
      return '#FF69B4';
    case 'select':
      return '';
    case 'slider':
      return 50;
    case 'switch':
      return false;
    default:
      return null;
  }
}

// 导出模板
async function exportTemplate(template: Template) {
  try {
    // 生成模板代码
    const code = generateTemplateCode(template);
    
    // 创建下载
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${template.id}.js`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export template:', err);
  }
}

// 生成模板代码
function generateTemplateCode(template: Template): string {
  return `
// Template: ${template.name}
// Generated at: ${new Date().toISOString()}

import React from 'react';

export default function Template({ variables = {} }) {
  return (
    <div className="template">
      ${generateJSXFromTemplate(template)}
    </div>
  );
}

// 模板配置
export const config = ${JSON.stringify(template, null, 2)};

// 字段验证
export function validate(values) {
  const errors = {};
  ${generateValidationCode(template)}
  return errors;
}

// 默认变量
export const defaultVariables = ${JSON.stringify(
    template.fields?.reduce((acc, field) => {
      acc[field.id] = field.defaultValue ?? getDefaultValueByType(field.type);
      return acc;
    }, {} as Record<string, any>),
    null,
    2
  )};
`;
}

// 从模板生成 JSX
function generateJSXFromTemplate(template: Template): string {
  // 这里实现模板到 JSX 的转换逻辑
  return template.fields?.map(field => {
    switch (field.type) {
      case 'text':
        return `<div className="field-${field.id}">{variables.${field.id}}</div>`;
      case 'image':
        return `<img src={variables.${field.id}} alt="${field.label}" className="field-${field.id}" />`;
      // ... 其他类型的处理
      default:
        return '';
    }
  }).join('\n') || '';
}

// 生成验证代码
function generateValidationCode(template: Template): string {
  return template.fields?.map(field => {
    if (field.required) {
      return `
  if (!values.${field.id}) {
    errors.${field.id} = '${field.label}不能为空';
  }`;
    }
    return '';
  }).join('\n') || '';
} 