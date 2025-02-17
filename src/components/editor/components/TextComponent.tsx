import { useComponentState } from '../hooks/useComponentState';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  preview?: boolean;
}

export function TextComponent({ component, onChange, preview = false }: Props) {
  const {
    value,
    error,
    handleChange,
    handleBlur
  } = useComponentState({
    component,
    onChange,
    defaultValue: '',
    validate: value => {
      if (component.required && !value) {
        return `${component.label}不能为空`;
      }
      if (component.options?.maxLength && value.length > component.options.maxLength) {
        return `${component.label}不能超过${component.options.maxLength}个字符`;
      }
      return undefined;
    }
  });

  if (preview) {
    return (
      <div 
        className="text-component"
        style={component.style}
      >
        {value || component.options?.placeholder || '文本内容'}
      </div>
    );
  }

  return (
    <div className="text-component-editor">
      {component.options?.multiline ? (
        <textarea
          value={value}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={component.options?.placeholder}
          disabled={component.options?.disabled}
          readOnly={component.options?.readonly}
          maxLength={component.options?.maxLength}
          rows={component.options?.rows || 3}
          className={`
            w-full p-2 border rounded-lg resize-none
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:border-pink-500 focus:ring-1 focus:ring-pink-500
            disabled:bg-gray-100 disabled:text-gray-500
          `}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={component.options?.placeholder}
          disabled={component.options?.disabled}
          readOnly={component.options?.readonly}
          maxLength={component.options?.maxLength}
          className={`
            w-full p-2 border rounded-lg
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:border-pink-500 focus:ring-1 focus:ring-pink-500
            disabled:bg-gray-100 disabled:text-gray-500
          `}
        />
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mt-1 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* 字数统计 */}
      {component.options?.maxLength && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {value.length} / {component.options.maxLength}
        </div>
      )}
    </div>
  );
} 