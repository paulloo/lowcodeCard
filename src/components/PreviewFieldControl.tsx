import type { TemplateField } from '../types/template';

interface Props {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
}

export default function PreviewFieldControl({ field, value, onChange }: Props) {
  const renderControl = () => {
    switch (field.type) {
      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="图片URL"
              className="w-full px-3 py-2 border rounded-lg"
            />
            {value && (
              <img
                src={value}
                alt="预览"
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
          </div>
        );
      
      case 'color':
        return (
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={value || '#000000'}
              onChange={e => onChange(e.target.value)}
              className="w-10 h-10 rounded overflow-hidden"
            />
            <input
              type="text"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
          </div>
        );
      
      case 'select':
        return field.options?.multiple ? (
          <div className="space-y-2">
            {field.options.choices?.map(choice => (
              <label key={choice} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(choice)}
                  onChange={e => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(choice);
                    } else {
                      const index = newValue.indexOf(choice);
                      if (index > -1) newValue.splice(index, 1);
                    }
                    onChange(newValue);
                  }}
                  className="rounded text-pink-500"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        ) : (
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">请选择</option>
            {field.options?.choices?.map(choice => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={e => onChange(parseFloat(e.target.value))}
            min={field.options?.min}
            max={field.options?.max}
            step={field.options?.step}
            className="w-full px-3 py-2 border rounded-lg"
          />
        );
      
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={e => onChange(e.target.checked)}
              className="rounded text-pink-500"
            />
            <span>{field.label}</span>
          </label>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.description && (
          <span className="ml-2 text-xs text-gray-500">
            {field.description}
          </span>
        )}
      </label>
      {renderControl()}
    </div>
  );
} 