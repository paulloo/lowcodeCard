import { useState, useEffect } from 'react';
import type { Template, TemplateField } from '../types/template';
import { getValueByPath, setValueByPath } from '../utils/objectUtils';
import { UploadService } from '../services/upload/UploadService';

interface Props {
  template: Template;
  variables: Record<string, any>;
  onChange: (variables: Record<string, any>) => void;
}

export default function TemplateVariableEditor({ template, variables, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取字段当前值
  const getFieldValue = (field: TemplateField) => {
    const path = field.path || field.id;
    
    try {
      if (!variables) return '';

      if (path.includes('.')) {
        const parts = path.split('.');
        let current = variables;
        
        for (const part of parts) {
          if (!current || typeof current !== 'object') {
            return '';
          }
          current = current[part];
        }
        
        return current ?? '';
      }
      
      return variables[path] ?? '';
    } catch (err) {
      console.warn(`Error getting value for path: ${path}`, err);
      return '';
    }
  };

  // 处理字段值变化
  const handleFieldChange = (field: TemplateField, value: any) => {
    const path = field.path || field.id;
    const newVariables = { ...variables };  // 创建变量的副本
    
    try {
      // 处理颜色值
      if (field.type === 'color') {
        const color = value.trim();
        if (color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
          setValueByPath(newVariables, path, color);
          onChange(newVariables);
          return;
        }
      }
      
      // 处理其他类型
      setValueByPath(newVariables, path, value);
      onChange(newVariables);
    } catch (err) {
      console.error(`Error setting value for path: ${path}`, err);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (file: File, fieldId: string) => {
    setUploading(true);
    setError(null);

    try {
      const uploadService = UploadService.getInstance();
      const result = await uploadService.uploadImage(file);

      if (!result.success) {
        throw new Error(result.error || '上传失败');
      }

      const newVariables = { ...variables };
      setValueByPath(newVariables, fieldId, result.url);
      onChange(newVariables);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 渲染字段输入控件
  const renderFieldInput = (field: TemplateField) => {
    const value = getFieldValue(field);

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder={field.options?.placeholder}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={e => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {field.options?.choices?.map(choice => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="field-group">
            {field.showLabel && (
              <label className="field-label">{field.label}</label>
            )}
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={value}
                onChange={e => handleFieldChange(field, e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={value}
                onChange={e => handleFieldChange(field, e.target.value)}
                className="color-input"
                placeholder="#000000"
              />
            </div>
            {field.options?.presetColors && (
              <div className="color-presets">
                {field.options.presetColors.map(color => (
                  <button
                    key={color}
                    onClick={() => handleFieldChange(field, color)}
                    className="color-preset-btn"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={value}
                onChange={e => handleFieldChange(field, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="输入图片URL"
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, field.id);
                  }
                }}
                className="hidden"
                id={`file-${field.id}`}
              />
              <label
                htmlFor={`file-${field.id}`}
                className={`
                  px-4 py-2 rounded-lg cursor-pointer transition-colors
                  ${uploading
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }
                `}
              >
                {uploading ? '上传中...' : '上传'}
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {value && (
              <img
                src={value}
                alt={field.label}
                className="max-w-full h-32 object-contain rounded-lg"
              />
            )}
          </div>
        );

      case 'slider':
        const min = field.options?.min ?? 0;
        const max = field.options?.max ?? 100;
        const step = field.options?.step ?? 1;
        const currentValue = Number(value) || min;

        return (
          <div className="space-y-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentValue}
              onChange={e => handleFieldChange(field, Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 text-center">
              {currentValue}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 按组分类字段
  const fieldGroups = template.fields.reduce((groups, field) => {
    const group = field.options?.group || '基本设置';
    if (!groups[group]) groups[group] = [];
    groups[group].push(field);
    return groups;
  }, {} as Record<string, TemplateField[]>);

  return (
    <div className="p-4 space-y-6">
      {Object.entries(fieldGroups).map(([group, fields]) => (
        <div key={group}>
          <h3 className="text-lg font-medium mb-4">{group}</h3>
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {field.description && (
                  <p className="text-sm text-gray-500 mb-2">
                    {field.description}
                  </p>
                )}
                {renderFieldInput(field)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 