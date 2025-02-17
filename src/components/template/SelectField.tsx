import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SelectOption } from '../../types/template';

interface Props {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
}

export default function SelectField({
  value,
  onChange,
  options,
  placeholder = '请选择...',
  multiple = false,
  searchable = false,
  clearable = false,
  disabled = false
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 关闭下拉框
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchValue('');
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  // 过滤选项
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // 获取选中项标签
  const getSelectedLabel = () => {
    if (multiple) {
      const selectedValues = value as string[];
      if (!selectedValues.length) return placeholder;
      return selectedValues
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean)
        .join(', ');
    } else {
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  // 处理选择
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const selectedValues = value as string[];
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      closeDropdown();
    }
  };

  // 处理清除
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`
          relative flex items-center px-3 py-2 bg-white border rounded-lg
          ${isOpen ? 'border-pink-500 ring-1 ring-pink-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer hover:border-pink-500'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate">
          {getSelectedLabel()}
        </div>
        <div className="flex items-center gap-1">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="搜索..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded
                  focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = multiple
                  ? (value as string[]).includes(option.value)
                  : value === option.value;

                return (
                  <div
                    key={option.value}
                    className={`
                      px-3 py-2 cursor-pointer flex items-center gap-2
                      ${isSelected ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => handleSelect(option.value)}
                  >
                    {multiple && (
                      <div className={`
                        w-4 h-4 border rounded
                        ${isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}
                      `}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                    {option.label}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                无匹配结果
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 