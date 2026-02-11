import { EditorView } from "@codemirror/view";
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import estree from "prettier/plugins/estree";

export const formatEditor = async (view: EditorView): Promise<boolean> => {
  // Debug 1: 確認函式有被觸發
  // console.log("Format triggerred"); 

  if (!view) return false;
  const source = view.state.doc.toString();

  try {
    const formatted = await prettier.format(source, {
      parser: "babel",
      plugins: [parserBabel, estree],
      semi: true,
      singleQuote: true,
    });

    // Debug 2: 確認 Prettier 沒報錯且有產出
    // console.log("Prettier Success:", formatted);

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: formatted,
      },
    });
  } catch (err) {
    // Debug 3: 語法錯誤（例如少個括號）會導致 Prettier 失敗
    console.error("Format failed (Probably syntax error):", err);
  }

  return true;
};