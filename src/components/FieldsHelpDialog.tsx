interface Props {
  onClose: () => void;
}

export default function FieldsHelpDialog({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">字段类型说明</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            {[
              {
                type: 'text',
                title: '文本',
                description: '用于输入单行或多行文本内容',
                options: ['rows - 文本框行数', 'placeholder - 占位文本']
              },
              {
                type: 'image',
                title: '图片',
                description: '用于上传和显示图片',
                options: ['format - 允许的图片格式', 'maxSize - 最大文件大小']
              },
              {
                type: 'color',
                title: '颜色',
                description: '用于选择颜色值',
                options: ['defaultValue - 默认颜色']
              },
              {
                type: 'select',
                title: '选择',
                description: '用于从预定义选项中选择',
                options: ['choices - 选项列表', 'multiple - 是否允许多选']
              },
              {
                type: 'number',
                title: '数字',
                description: '用于输入数字',
                options: ['min - 最小值', 'max - 最大值', 'step - 步长']
              },
              {
                type: 'boolean',
                title: '开关',
                description: '用于切换开/关状态',
                options: ['defaultValue - 默认状态']
              }
            ].map(field => (
              <div key={field.type} className="space-y-2">
                <h4 className="text-lg font-medium text-gray-800">
                  {field.title}
                  <span className="ml-2 text-sm text-gray-500">({field.type})</span>
                </h4>
                <p className="text-gray-600">{field.description}</p>
                <div className="pl-4 border-l-2 border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700">可用选项：</h5>
                  <ul className="mt-1 space-y-1">
                    {field.options.map(option => (
                      <li key={option} className="text-sm text-gray-600">
                        • {option}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
} 