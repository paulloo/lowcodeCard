import BaseField, { type FieldProps } from './BaseField';

export default function ImageField(props: FieldProps) {
  const { field, onChange } = props;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const allowedTypes = field.options?.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('不支持的文件类型');
      return;
    }

    // 检查文件大小
    const maxSize = field.options?.maxSize || 5 * 1024 * 1024; // 默认 5MB
    if (file.size > maxSize) {
      alert('文件大小超出限制');
      return;
    }

    // 转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({
        ...field,
        defaultValue: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <BaseField
      {...props}
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        <div className="relative">
          {field.defaultValue ? (
            <div className="relative group">
              <img
                src={field.defaultValue}
                alt={field.label}
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onChange({ ...field, defaultValue: '' })}
                  className="p-2 bg-white rounded-full text-gray-600 hover:text-red-500"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 cursor-pointer">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mt-2 text-sm text-gray-500">点击上传图片</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        {field.description && (
          <p className="text-sm text-gray-500">{field.description}</p>
        )}
      </div>
    </BaseField>
  );
} 