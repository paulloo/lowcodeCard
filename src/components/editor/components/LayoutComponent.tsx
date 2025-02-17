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

export default function LayoutComponent({ component, value, onChange, onBlur }: Props) {
  const handleChildChange = (childId: string, childValue: any) => {
    onChange({
      ...value,
      [childId]: childValue
    });
  };

  return (
    <div
      className={`
        flex
        ${component.options?.direction === 'vertical' ? 'flex-col' : 'flex-row'}
        ${component.options?.align ? `items-${component.options.align}` : ''}
        ${component.options?.justify ? `justify-${component.options.justify}` : ''}
      `}
      style={{
        gap: component.options?.gap ? `${component.options.gap}px` : undefined,
        ...component.style
      }}
    >
      {component.children?.map(child => {
        const Component = ComponentMap[child.type as keyof typeof ComponentMap];
        if (!Component) return null;

        return (
          <div key={child.id} className="flex-1">
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
  );
} 