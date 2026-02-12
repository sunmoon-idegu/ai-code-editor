import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";

import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { minimap } from "../extensions/minimap";
import { customSetup } from "../extensions/custom-setup";
import { formatEditor } from "../extensions/format-editor";
import { suggestion } from "../extensions/suggestion";

interface CodeEditorProps {
  fileName: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({
  fileName,
  initialValue = "",
  onChange,
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(() => {
    return getLanguageExtension(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        oneDark,
        customTheme,
        customSetup,
        languageExtension,
        suggestion(fileName),
        keymap.of([
          indentWithTab,
          {
            key: "Ctrl-f", // VS Code 快捷鍵是 Alt-Shift-f, 但不知道為什麼會 failed
            run: (view: EditorView) => {
              // 觸發異步函數，但不等待它結束就回傳 true 表示指令已處理
              formatEditor(view);
              return true;
            },
            preventDefault: true,
          },
        ]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if(update.docChanged) onChange(update.state.doc.toString())
        })
      ],
    });

    viewRef.current = view;

    return () => view.destroy();
  }, [languageExtension, onChange]);

  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
};
