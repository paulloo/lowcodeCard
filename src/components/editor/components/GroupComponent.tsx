import { useState } from 'react';
import type { EditorComponent } from '../../../types/editor';
import { TextComponent, ImageComponent, ColorComponent, SelectComponent, SliderComponent, SwitchComponent } from './';

interface Props {
  component: EditorComponent;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  onBlur?: () => void;
}

const ComponentMap = {
  text: TextComponent,
  image: ImageComponent,
  color: ColorComponent,
  select: SelectComponent,
  slider: SliderComponent,
  switch: SwitchComponent
};

export default function GroupComponent({ component, value, onChange, onBlur }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChildChange = (childId: string, childValue: any) => {
    onChange({
      ...value,
      [childId]: childValue
    });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
      >
        <span className="font-medium">{component.label}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="pl-4 space-y-4">
          {component.children?.map(child => {
            const Component = ComponentMap[child.type as keyof typeof ComponentMap];
            if (!Component) return null;

            return (
              <div key={child.id} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {child.label}
                </label>
                <Component
                  component={child}
                  value={value[child.id]}
                  onChange={(newValue) => handleChildChange(child.id, newValue)}
                  onBlur={onBlur}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 