import { forwardRef, useImperativeHandle, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import TemplateVariableHint from './TemplateVariableHint';
import { CSS_SNIPPETS, HTML_SNIPPETS } from '../constants/codeSnippets';

// 配置 Monaco Editor CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

interface Props {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'css' | 'javascript';
  placeholder?: string;
  onFocus?: () => void;
  variables?: Array<{
    label: string;
    value: string;
    description?: string;
    category: string;
  }>;
}

export interface CodeEditorRef {
  getEditor: () => editor.IStandaloneCodeEditor | null;
}

const getSnippets = (language: string) => {
  switch (language) {
    case 'css':
      return Object.entries(CSS_SNIPPETS).flatMap(([category, items]) =>
        items.map(item => ({
          ...item,
          detail: `${category} - ${item.detail}`
        }))
      );
    case 'html':
      return Object.entries(HTML_SNIPPETS).flatMap(([category, items]) =>
        items.map(item => ({
          ...item,
          detail: `${category} - ${item.detail}`
        }))
      );
    default:
      return [];
  }
};

const CodeEditor = forwardRef<CodeEditorRef, Props>(({ 
  value, 
  onChange, 
  language, 
  placeholder,
  onFocus,
  variables = []
}, ref) => {
  let editorInstance: editor.IStandaloneCodeEditor | null = null;
  let monaco: typeof Monaco | null = null;

  // 注册自定义提示
  const registerCompletionProvider = (m: typeof Monaco) => {
    m.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['{', '.', '<', '@'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);

        let suggestions: Monaco.languages.CompletionItem[] = [];

        // 变量提示
        if (beforeCursor.endsWith('{')) {
          suggestions.push(...variables.map(v => ({
            label: v.label,
            kind: m.languages.CompletionItemKind.Variable,
            documentation: {
              value: `**${v.label}**\n\n${v.description || ''}\n\n\`${v.value}\``
            },
            detail: v.category,
            insertText: `{${v.value.slice(2)}`,
            range,
            sortText: '0' // 确保变量出现在最前面
          })));
        } else if (beforeCursor.endsWith('{{')) {
          suggestions.push(...variables.map(v => ({
            label: v.label,
            kind: m.languages.CompletionItemKind.Variable,
            documentation: {
              value: `**${v.label}**\n\n${v.description || ''}\n\n\`${v.value}\``
            },
            detail: v.category,
            insertText: v.value.slice(2),
            range,
            sortText: '0'
          })));
        }

        // 代码片段提示
        const snippets = getSnippets(language);
        suggestions.push(...snippets.map(s => ({
          label: s.label,
          kind: m.languages.CompletionItemKind.Snippet,
          documentation: {
            value: `**${s.detail}**\n\n\`\`\`${language}\n${s.insertText}\n\`\`\``
          },
          detail: s.detail,
          insertText: s.insertText,
          insertTextRules: s.insertTextRules || m.languages.CompletionItemInsertTextRule.None,
          range,
          sortText: '1'
        })));

        // CSS 属性提示
        if (language === 'css' && !beforeCursor.includes(':')) {
          suggestions.push(
            ...['color', 'background', 'padding', 'margin', 'border', 'font-size'].map(prop => ({
              label: prop,
              kind: m.languages.CompletionItemKind.Property,
              insertText: `${prop}: `,
              range,
              sortText: '2'
            }))
          );
        }

        return { suggestions };
      }
    });
  };

  // 注册悬停提示
  const registerHoverProvider = (m: typeof Monaco) => {
    m.languages.registerHoverProvider(language, {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const variable = variables.find(v => 
          v.value.includes(word.word) || 
          v.label.toLowerCase().includes(word.word.toLowerCase())
        );

        if (variable) {
          return {
            contents: [
              { value: `**${variable.label}**` },
              { value: variable.description || '' },
              { value: `\`${variable.value}\`` }
            ]
          };
        }

        return null;
      }
    });
  };

  useEffect(() => {
    if (monaco && editorInstance) {
      registerCompletionProvider(monaco);
      registerHoverProvider(monaco);
    }
  }, [variables, monaco, editorInstance]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, m: typeof Monaco) => {
    editorInstance = editor;
    monaco = m;

    // 注册提供者
    registerCompletionProvider(m);
    registerHoverProvider(m);

    // 添加快捷键
    editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Space, () => {
      editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
    });

    // 添加格式化快捷键
    editor.addCommand(m.KeyMod.CtrlCmd | m.KeyMod.Shift | m.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run();
    });

    editor.onDidFocusEditorText(() => {
      onFocus?.();
    });
  };

  useImperativeHandle(ref, () => ({
    getEditor: () => editorInstance
  }));

  return (
    <div className="w-full h-full relative">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={value}
        onChange={value => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'inline'
        }}
        onMount={handleEditorDidMount}
        loading={
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-gray-400 flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>加载编辑器...</span>
            </div>
          </div>
        }
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor; 