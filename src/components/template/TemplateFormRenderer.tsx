import React from 'react';
import type { Template, TemplateField } from '../../types/template';
import TemplateFormField from './TemplateFormField';

interface Props {
  template: Template;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function TemplateFormRenderer({ 
  template, 
  values, 
  onChange,
  onImageUpload 
}: Props) {
  const handleFieldChange = (fieldId: string, value: any) => {
    onChange({
      ...values,
      [fieldId]: value
    });
  };

  return (
    <div className="space-y-6">
      {template.fields.map(field => (
        <TemplateFormField
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={value => handleFieldChange(field.id, value)}
          onImageUpload={onImageUpload}
        />
      ))}
    </div>
  );
} 