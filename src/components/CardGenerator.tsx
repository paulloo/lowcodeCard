import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import CardTemplate from './CardTemplate';
import { generateCardImage, downloadCard } from '../utils/cardExporter';
import { uploadImage, optimizeImageUrl } from '../utils/cloudinaryUtils';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import Step from './Step';
import ImageGenerator from './ImageGenerator';
import PhotoUploader from './PhotoUploader';
import EffectSelector from './EffectSelector';
import { generateAnimatedCard } from '../utils/gifGenerator';
import GenerateOptions from './GenerateOptions';
import BackgroundUploader from './BackgroundUploader';
import type { Template } from '../types/template';
import { TemplateManager } from '../services/template/TemplateManager';
import TemplateRenderer from './editor/preview/TemplateRenderer';
import TemplatePreviewCard from './TemplatePreviewCard';
import TemplateEffectSelector from './TemplateEffectSelector';
import TemplateStyleConfig from './TemplateStyleConfig';
import TemplateList from './template/TemplateList';
import TemplateVariableEditor from './TemplateVariableEditor';
import ExportOptions from './ExportOptions';
import type { ExportOptions as ExportOptionsType } from './ExportOptions';
import ExportProgress from './ExportProgress';
import ExportPreview from './ExportPreview';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import MessageGenerator from './MessageGenerator';
import { aiService } from '../services/ai';
import TemplateEditor from './TemplateEditor';
import TemplateVisualEditor from './editor/TemplateVisualEditor';
import TemplateFormRenderer from './template/TemplateFormRenderer';
import TemplateContentEditor from './template/TemplateContentEditor';
import { useTemplateManager } from '../hooks/useTemplateManager';
import { useCardExport } from '../hooks/useCardExport';
import { TemplateListView } from './card/TemplateListView';
import { TemplateEditorView } from './card/TemplateEditorView';

interface CloudinaryResponse {
  secure_url: string;
  // 其他可能的响应字段...
}

declare global {
  interface ImportMetaEnv {
    readonly PUBLIC_CLOUDINARY_CLOUD_NAME: string;
    readonly PUBLIC_CLOUDINARY_PRESET: string;
  }
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const TEMPLATES = [
  { id: 'template1', name: '浪漫渐变', thumb: '/templates/template1-thumb.png' },
  { id: 'template2', name: '紫色梦幻', thumb: '/templates/template2-thumb.png' },
  { id: 'template3', name: '复古文艺', thumb: '/templates/template3-thumb.png' },
  { id: 'template4', name: '简约现代', thumb: '/templates/template4-thumb.png' },
  { id: 'template5', name: '甜蜜心形', thumb: '/templates/template5-thumb.png' },
];

interface Props {
  template: Template;
}

// 预览和导出区域组件
function PreviewAndExportSection({ 
  previewUrl, 
  onExport, 
  onBack 
}: { 
  previewUrl: string;
  onExport: (options: ExportOptionsType) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* 顶部导航 */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium text-gray-900">预览效果</h2>
          <p className="mt-1 text-sm text-gray-500">
            确认效果满意后可以导出贺卡
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <span className="sr-only">返回编辑</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 预览区域 */}
      <div className="p-6">
        <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden mb-6">
          <img 
            src={previewUrl} 
            alt="贺卡预览"
            className="w-full h-full object-contain"
          />
        </div>

        <ExportOptions
          onExport={onExport}
          loading={false}
          disabled={false}
        />
      </div>
    </div>
  );
}

export default function CardGenerator({ template: initialTemplate }: Props) {
  const {
    templates,
    selectedTemplate,
    editingTemplate,
    showTemplateEditor,
    setShowTemplateEditor,
    loadTemplates,
    handleTemplateSelect,
    handleEditTemplate,
    handleDeleteTemplate,
    handleSaveTemplate,
  } = useTemplateManager();

  const {
    exporting,
    exportProgress,
    exportStatus,
    previewUrl,
    handleExport,
    handleDownload,
  } = useCardExport();

  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [variables, setVariables] = useState<Record<string, any>>({});

  // 加载模板列表
  useEffect(() => {
    loadTemplates().catch(error => {
      setToast({
        message: '加载模板失败',
        type: 'error'
      });
    });
  }, [loadTemplates]);

  // 处理模板内容保存
  const handleTemplateContentSave = useCallback(async (values: Record<string, any>) => {
    try {
      if (!selectedTemplate) {
        throw new Error('未选择模板');
      }

      // 更新表单值和变量
      setFormValues(values);
      setVariables(prev => ({
        ...prev,
        ...values,
        styles: {
          ...prev.styles,
          ...selectedTemplate.styles
        }
      }));

      // 查找预览容器并生成预览图
      const previewContainer = document.querySelector('.template-container');
      if (!previewContainer) {
        throw new Error('找不到预览区域');
      }

      const previewDataUrl = await handleExport(previewContainer as HTMLElement, {
        format: 'png',
        quality: 0.8,
        scale: 2,
        withAnimation: false,
        filename: '贺卡'
      });

      if (previewDataUrl) {
        setCurrentStep(3);
        return true;
      }
      return false;
    } catch (error) {
      console.error('保存模板内容失败:', error);
      setToast({
        message: error instanceof Error ? error.message : '保存失败，请重试',
        type: 'error'
      });
      return false;
    }
  }, [selectedTemplate, handleExport, setToast]);

  // 处理导出 - 直接使用预览图片
  const handleExportCallback = useCallback((options: ExportOptionsType) => {
    if (!previewUrl) {
      setToast({
        message: '预览图片未生成',
        type: 'error'
      });
      return;
    }

    try {
      downloadCard(previewUrl, options.filename);
      setToast({
        message: '导出成功',
        type: 'success'
      });
    } catch (error) {
      console.error('导出失败:', error);
      setToast({
        message: '导出失败，请重试',
        type: 'error'
      });
    }
  }, [previewUrl, setToast]);

  // 处理模板选择
  const handleSelectTemplate = useCallback((template: Template) => {
    handleTemplateSelect(template);
    setCurrentStep(2); // 选择模板后进入编辑步骤
  }, [handleTemplateSelect]);

  // 渲染不同步骤的视图
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TemplateListView
            templates={templates}
            onSelect={handleSelectTemplate}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onCreateNew={() => setShowTemplateEditor(true)}
          />
        );
      case 2:
        return selectedTemplate && (
          <TemplateEditorView
            template={selectedTemplate}
            onSave={handleTemplateContentSave}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return previewUrl && (
          <PreviewAndExportSection
            previewUrl={previewUrl}
            onExport={handleExportCallback}
            onBack={() => setCurrentStep(2)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {renderStep()}
      </div>

      {/* 弹窗组件 */}
      {showTemplateEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => setShowTemplateEditor(false)}
        />
      )}

      {/* 导出进度提示 */}
      {exporting && (
        <ExportProgress
          progress={exportProgress}
          status={exportStatus}
        />
      )}

      {/* 提示消息 */}
      {toast && (
        <Toast
          {...toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 