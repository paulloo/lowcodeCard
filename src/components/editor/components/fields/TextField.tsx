import BaseField, { type FieldProps } from './BaseField';

export default function TextField(props: FieldProps) {
  const { field, onChange } = props;

  return (
    <BaseField
      {...props}
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6v8l4-4m-4 4l-4-4"/>
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
        <input
          type="text"
          value={field.defaultValue || ''}
          onChange={e => onChange({
            ...field,
            defaultValue: e.target.value
          })}
          placeholder={field.options?.placeholder}
          className="w-full px-3 py-2 border rounded-lg"
        />
        {field.description && (
          <p className="text-sm text-gray-500">{field.description}</p>
        )}
      </div>
    </BaseField>
  );
} 