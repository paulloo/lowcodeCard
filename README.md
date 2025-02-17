# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

组件系统基础
[x] 定义核心组件接口 (IComponent)
[x] 实现基础组件加载器 (BaseLoader)
[x] 支持 React 组件加载 (ReactLoader)
[x] 支持 Vue 组件加载 (VueLoader)
[x] 支持 HTML 组件加载 (HtmlLoader)
[x] 组件生命周期管理
[x] 组件版本控制系统
[x] 组件依赖关系管理
[ ] 组件热更新机制

编辑器核心
[x] 插件系统架构设计
[x] 核心事件总线
[x] 状态管理系统
[x] 撤销/重做功能
[x] 组件间通信机制
[x] 快捷键系统
[x] 多语言支持
[x] 主题系统

数据层
[x] 组件数据模型定义
[x] 数据验证系统
[x] 数据持久化方案
[x] 数据迁移工具
[x] 数据版本控制
[x] 数据导入导出
[x] 数据备份恢复

渲染层
[x] 统一渲染器接口
[x] 自定义渲染器支持
[x] 响应式布局系统
[x] 主题定制能力
[x] 动画系统
[x] 性能优化
[x] 渲染缓存

工具链
[x] 组件打包工具
[x] 组件调试工具
[x] 组件文档生成器
[x] 组件测试框架
[x] 组件发布工具
[x] 组件市场系统
[x] 组件分析工具

扩展功能
[x] 组件市场集成
[x] 协同编辑支持
[x] 版本控制集成
[x] 自动化测试
[x] 性能监控
[x] 错误追踪
[x] 使用分析


后续版本规划：
第二阶段：
协同编辑支持
组件热更新
版本控制集成
完整的组件市场
第三阶段：
高级动画系统
完整的测试框架
自动化文档生成
完整的分析系统
暂时不建议接入的功能：
完整的组件系统：
目前模板编辑器主要面向静态模板
组件化改造需要较大重构
复杂的插件系统：
当前功能相对独立
插件机制可能增加复杂度
完整的协同功能：
需要后端支持
需要考虑冲突解决