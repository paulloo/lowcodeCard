declare module '@monaco-editor/react' {
  import type { editor } from 'monaco-editor';
  
  interface EditorProps {
    height?: string | number;
    defaultLanguage?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string | undefined) => void;
    theme?: string;
    options?: editor.IStandaloneEditorConstructionOptions;
    loading?: React.ReactNode;
  }

  export default function Editor(props: EditorProps): JSX.Element;
  export const loader: {
    config: (config: { paths?: { vs: string } }) => void;
  };
} 