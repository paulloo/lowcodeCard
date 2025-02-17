import { TextComponent } from './TextComponent';
import { ImageComponent } from './ImageComponent';
import { ColorComponent } from './ColorComponent';
import { SelectComponent } from './SelectComponent';
import { SliderComponent } from './SliderComponent';
import { SwitchComponent } from './SwitchComponent';
import type { ComponentType, EditorComponent } from '../../../types/editor';

interface ComponentProps {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  preview?: boolean;
}

type ComponentRenderer = (props: ComponentProps) => JSX.Element;

export const ComponentMap: Record<ComponentType, ComponentRenderer> = {
  text: TextComponent,
  image: ImageComponent,
  color: ColorComponent,
  select: SelectComponent,
  slider: SliderComponent,
  switch: SwitchComponent
} as const;

export type ComponentMapType = typeof ComponentMap; 