import TextComponent from './TextComponent';
import ImageComponent from './ImageComponent';
import ColorComponent from './ColorComponent';
import SelectComponent from './SelectComponent';
import SliderComponent from './SliderComponent';
import SwitchComponent from './SwitchComponent';
import GroupComponent from './GroupComponent';
import LayoutComponent from './LayoutComponent';

export const ComponentMap = {
  text: TextComponent,
  image: ImageComponent,
  color: ColorComponent,
  select: SelectComponent,
  slider: SliderComponent,
  switch: SwitchComponent,
  group: GroupComponent,
  layout: LayoutComponent
} as const;

export type ComponentType = keyof typeof ComponentMap;

export {
  TextComponent,
  ImageComponent,
  ColorComponent,
  SelectComponent,
  SliderComponent,
  SwitchComponent,
  GroupComponent,
  LayoutComponent
}; 