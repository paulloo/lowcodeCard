import React from 'react';
import { IComponent, ComponentInstance } from '../types';

interface RendererProps {
  instance: ComponentInstance;
  component: IComponent;
  context: any;
}

export class ComponentRenderer extends React.Component<RendererProps> {
  private ref = React.createRef<any>();

  componentDidMount() {
    const { instance, component } = this.props;
    
    // 调用组件的生命周期方法
    if (component.implementation.onMounted) {
      component.implementation.onMounted(this.ref.current, instance.props);
    }
  }

  componentWillUnmount() {
    const { instance, component } = this.props;
    
    // 清理组件
    if (component.implementation.onUnmount) {
      component.implementation.onUnmount(this.ref.current, instance.props);
    }
  }

  render() {
    const { instance, component, context } = this.props;
    
    // 获取渲染实现
    const renderImpl = component.implementation.render;
    
    // 准备渲染上下文
    const renderContext = {
      ...context,
      ref: this.ref,
      instanceId: instance.id,
      componentId: component.id
    };

    // 渲染组件
    return renderImpl(instance.props, renderContext);
  }
} 