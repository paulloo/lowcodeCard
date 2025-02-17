import BaseField, { type FieldProps } from './BaseField';

export default function ColorField(props: FieldProps) {
  const { field, onChange } = props;

  return (
    <BaseField
      {...props}
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          {field.required && (
            <span className="text-red-500 text-xs">*必填</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={field.defaultValue || '#000000'}
            onChange={e => onChange({
              ...field,
              defaultValue: e.target.value
            })}
            className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer"
          />
          <input
            type="text"
            value={field.defaultValue || ''}
            onChange={e => onChange({
              ...field,
              defaultValue: e.target.value
            })}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
        </div>
        {field.description && (
          <p className="text-sm text-gray-500">{field.description}</p>
        )}
      </div>
    </BaseField>
  );
} 