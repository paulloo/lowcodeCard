import BaseField, { type FieldProps } from './BaseField';

export default function SelectField(props: FieldProps) {
  const { field, onChange } = props;
  const choices = field.options?.choices || [];

  return (
    <BaseField
      {...props}
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
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
        <select
          value={field.defaultValue || ''}
          onChange={e => onChange({
            ...field,
            defaultValue: e.target.value
          })}
          className="w-full px-3 py-2 border rounded-lg"
          multiple={field.options?.multiple}
        >
          <option value="">请选择</option>
          {choices.map(choice => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
        {field.description && (
          <p className="text-sm text-gray-500">{field.description}</p>
        )}
      </div>
    </BaseField>
  );
} 