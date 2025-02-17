import { useState, useEffect, useCallback } from 'react';
import type { EditorComponent } from '../../../types/editor';

interface UseComponentStateProps<T = any> {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  defaultValue?: T;
  validate?: (value: T) => string | undefined;
}

export function useComponentState<T = any>({
  component,
  onChange,
  defaultValue,
  validate
}: UseComponentStateProps<T>) {
  // 本地状态
  const [value, setValue] = useState<T>(
    component.defaultValue ?? defaultValue
  );
  const [error, setError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);

  // 同步外部值
  useEffect(() => {
    setValue(component.defaultValue ?? defaultValue);
  }, [component.defaultValue, defaultValue]);

  // 处理值变更
  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    setIsDirty(true);

    // 验证
    if (validate) {
      const validationError = validate(newValue);
      setError(validationError);
      if (!validationError) {
        onChange({ defaultValue: newValue });
      }
    } else {
      onChange({ defaultValue: newValue });
    }
  }, [onChange, validate]);

  // 处理失焦
  const handleBlur = useCallback(() => {
    if (isDirty && !error) {
      onChange({ defaultValue: value });
    }
    setIsDirty(false);
  }, [isDirty, error, value, onChange]);

  return {
    value,
    error,
    isDirty,
    handleChange,
    handleBlur
  };
} 