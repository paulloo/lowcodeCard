import { useEffect, useState } from 'react';
import type { Template } from '../types/template';
import { DefaultValues } from './templates/defaultValues';
import TemplateRenderer from './editor/preview/TemplateRenderer';

interface Props {
  template: Template;
  variables: Record<string, any>;
}

export default function TemplatePreview({ template, variables }: Props) {
  const [previewVariables, setPreviewVariables] = useState(variables);

  // 当变量改变时，使用默认值填充空值
  useEffect(() => {
    const filledVariables = { ...variables };
    
    template.fields.forEach(field => {
      const value = variables[field.id];
      if (value === undefined || value === '') {
        switch (field.type) {
          case 'image':
            filledVariables[field.id] = DefaultValues.image.placeholder;
            break;
          case 'text':
            if (field.options?.style === 'title') {
              filledVariables[field.id] = DefaultValues.text.title;
            } else if (field.options?.style === 'quote') {
              filledVariables[field.id] = DefaultValues.text.quote;
            } else {
              filledVariables[field.id] = DefaultValues.text.body;
            }
            break;
          case 'color':
            filledVariables[field.id] = DefaultValues.color.primary;
            break;
          case 'select':
            filledVariables[field.id] = field.options?.choices?.[0]?.value || '';
            break;
        }
      }
    });

    setPreviewVariables(filledVariables);
  }, [template, variables]);

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3 className="text-lg font-medium">实时预览</h3>
        <div className="text-sm text-gray-500">
          使用默认值填充未设置的字段
        </div>
      </div>
      <div className="preview-content">
        <TemplateRenderer
          template={template}
          variables={previewVariables}
        />
      </div>
    </div>
  );
} 