import { useEditor } from '../../../../core/editor/EditorContext';

export default function EditorToolbar() {
  const { template, selectedId, updateComponent } = useEditor();

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-white">
      <button
        onClick={() => {
          // 撤销
        }}
        className="p-1.5 rounded hover:bg-gray-100"
        title="撤销"
      >
        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.061.025z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => {
          // 重做
        }}
        className="p-1.5 rounded hover:bg-gray-100"
        title="重做"
      >
        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.207 2.232a.75.75 0 00.025 1.06L16.378 7.25H6.375a5.375 5.375 0 000 10.75H9.25a.75.75 0 000-1.5H6.375a3.875 3.875 0 010-7.75h10.003l-4.146 3.957a.75.75 0 001.036 1.085l5.5-5.25a.75.75 0 000-1.085l-5.5-5.25a.75.75 0 00-1.061.025z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="h-5 border-l border-gray-200 mx-2" />
      <button
        onClick={() => {
          // 导出配置
        }}
        className="p-1.5 rounded hover:bg-gray-100"
        title="导出"
      >
        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => {
          // 导入配置
        }}
        className="p-1.5 rounded hover:bg-gray-100"
        title="导入"
      >
        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 