import React, { useRef, useState } from 'react';
import type { TemplateField } from '../../types/template';
import ImageUploader from '../ImageUploader';
import ColorPicker from '../ColorPicker';
import { aiService } from '../../services/ai';
import SelectField from './SelectField';

interface Props {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
  onImageUpload?: (file: File) => Promise<string>;
  uploading?: boolean;
}

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  accept?: string;
  maxSize?: number;
}

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  allowAIGenerate?: boolean;
}

function ImageField({ 
  value, 
  onChange, 
  onImageUpload, 
  uploading,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024 
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      alert(`图片大小不能超过 ${Math.floor(maxSize / 1024 / 1024)}MB`);
      return;
    }

    try {
      const imageUrl = await onImageUpload(file);
      onChange(imageUrl);
    } catch (error) {
      console.error('上传图片失败:', error);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <div className={`
        aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden
        ${!value ? 'border-2 border-dashed border-gray-300' : ''}
      `}>
        {value ? (
          <div className="relative group h-full">
            <img
              src={value}
              alt="已上传图片"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
              flex items-center justify-center gap-2 transition-opacity">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full
                  text-white transition-colors"
              >
                <span className="sr-only">更换图片</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full
                  text-white transition-colors"
              >
                <span className="sr-only">删除图片</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6
              cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              点击或拖拽上传图片
            </p>
            <p className="mt-1 text-xs text-gray-400">
              支持 JPG、PNG、GIF 格式，最大 {Math.floor(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm
          flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 
              border-pink-500 border-t-transparent" />
            <span className="text-sm text-gray-600">上传中...</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

function TextField({ 
  value, 
  onChange, 
  placeholder,
  required,
  multiline,
  rows = 3,
  allowAIGenerate = true
}: TextFieldProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateMessage = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await aiService.generateMessage({
        type: 'valentine',
        tone: 'romantic',
        length: 'medium'
      });
      
      const message = typeof response === 'object' && 'message' in response 
        ? response.message 
        : typeof response === 'string' 
          ? response 
          : '';
          
      if (!message) {
        throw new Error('生成的消息格式不正确');
      }

      onChange(message);
    } catch (error) {
      setError('生成消息失败，请重试');
      console.error('生成消息失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className="w-full rounded-md border-gray-300 shadow-sm 
            focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-md border-gray-300 shadow-sm 
            focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
      )}

      {allowAIGenerate && (
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleGenerateMessage}
            disabled={generating}
            className={`
              inline-flex items-center px-3 py-1 rounded-md text-sm
              ${generating 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}
            `}
          >
            {generating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 
                  border-pink-500 border-t-transparent rounded-full" />
                生成中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" 
                    d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                AI 生成祝福语
              </>
            )}
          </button>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TemplateFormField({ field, value, onChange, onImageUpload, uploading }: Props) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <TextField
              value={value || ''}
              onChange={onChange}
              placeholder={field.options?.placeholder}
              required={field.required}
              multiline={field.options?.multiline}
              rows={field.options?.rows}
              allowAIGenerate={field.options?.allowAIGenerate}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <ImageField
              value={value}
              onChange={onChange}
              onImageUpload={onImageUpload}
              uploading={uploading}
              accept={field.options?.accept}
              maxSize={field.options?.maxSize}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'color':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <ColorPicker
              value={value || '#FF69B4'}
              onChange={onChange}
              presetColors={field.options?.presetColors}
              showAlpha={field.options?.showAlpha}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <SelectField
              value={value || (field.options?.multiple ? [] : '')}
              onChange={onChange}
              options={field.options?.items || []}
              placeholder={field.options?.placeholder}
              multiple={field.options?.multiple}
              searchable={field.options?.searchable}
              clearable={field.options?.clearable}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={value || field.options?.min || 0}
                onChange={e => onChange(Number(e.target.value))}
                min={field.options?.min || 0}
                max={field.options?.max || 100}
                step={field.options?.step || 1}
                className="w-full"
              />
              <span className="text-sm text-gray-500">
                {value}{field.options?.unit || ''}
              </span>
            </div>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <button
              type="button"
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
                border-2 border-transparent transition-colors duration-200 ease-in-out 
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                ${value ? 'bg-pink-500' : 'bg-gray-200'}
              `}
              onClick={() => onChange(!value)}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full 
                  bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${value ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-4">
      {renderField()}
    </div>
  );
} 