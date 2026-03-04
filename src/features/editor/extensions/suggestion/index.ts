import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

import { fetcher } from "./fetcher";

// StateEffect: A way to send messages to update state.
// We define one effect type for setting the suggestion text.
const setSuggestionEffect = StateEffect.define<string | null>();

// StateField: Holds our suggestion state in the editor.
// - create(): Returns the inital value when the editor loads
// - update(): Called on every transaction (keystroke, etc) to potentially update the value
const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, transaction) {
    // Check each effect in this transaction
    // If we find our setSuggestionEffect, return its new value
    // Otherwise, keep the current value unchanged
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) return effect.value;
    }
    return value;
  },
});

// WidgetType: Craete Custom DOM elements to display in the editor
// toDOM() is called by codemirror to create the actual HTML element
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4";
    span.style.pointerEvents = "none";
    return span;
  }
}

let debounceTimer: number | null = null;
let isWaitingForSuggestion = false;
const DEBOUNCE_DELAY = 3000;

let currentAbortController: AbortController | null = null;

const generatePayload = (view: EditorView, fileName: string) => {
  const code = view.state.doc.toString();
  if (!code || code.trim().length === 0) return null;

  const cursorPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPosition);
  const cursorInLine = cursorPosition - currentLine.from;

  const previousLines: string[] = [];
  const previousLinesToFetch = Math.min(5, currentLine.number - 1);
  for (let i = previousLinesToFetch; i >= 1; i--) {
    previousLines.push(view.state.doc.line(currentLine.number - i).text);
  }

  const nextLines: string[] = [];
  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(5, totalLines - currentLine.number);

  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }

  // console.log("fileName", fileName);
  // console.log("code", fileName);
  // console.log("currentLine", currentLine.text);
  // console.log("previousLines", previousLines);
  // console.log("textBeforeCursor", currentLine.text.slice(0, cursorInLine));
  // console.log("textAfterCursor", currentLine.text.slice(cursorInLine));
  // console.log("nextLines", nextLines);
  // console.log("lineNumber", currentLine.number);

  return {
    fileName,
    code,
    currentLine: currentLine.text,
    previousLines: previousLines.join("\n"),
    textBeforeCursor: currentLine.text.slice(0, cursorInLine),
    textAfterCursor: currentLine.text.slice(cursorInLine),
    nextLines: nextLines.join("\n"),
    lineNumber: currentLine.number,
  };
};

const createDebouncePlugin = (fileName: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      triggerSuggestion(view: EditorView) {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        if (currentAbortController !== null) {
          currentAbortController.abort();
        }

        isWaitingForSuggestion = true;

        debounceTimer = window.setTimeout(async () => {
          const payload = generatePayload(view, fileName);
          if (!payload) {
            isWaitingForSuggestion = false;
            view.dispatch({
              effects: setSuggestionEffect.of(null),
            });
            return;
          }
          currentAbortController = new AbortController();

          const suggestion = await fetcher(
            payload,
            currentAbortController.signal,
          );

          isWaitingForSuggestion = false;
          view.dispatch({
            effects: setSuggestionEffect.of(suggestion),
          });
        }, DEBOUNCE_DELAY);
      }

      destroy() {
        if (debounceTimer !== null) clearTimeout(debounceTimer);
        if (currentAbortController !== null) currentAbortController.abort();
      }
    },
  );
};

const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    // Rebuild decorations if doc changed, cursor moved, or suggestion changed
    update(update: ViewUpdate) {
      const docChanged = update.docChanged;
      const cursorMoved = update.selectionSet;
      const suggestionChanged = update.transactions.some((transaction) =>
        transaction.effects.some((effect) => effect.is(setSuggestionEffect)),
      );
      const shouldRebuild = docChanged || cursorMoved || suggestionChanged;

      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      if (isWaitingForSuggestion) {
        return Decoration.none;
      }

      // get current suggestion from state
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) return Decoration.none;

      // create a widget decoration at the curson position
      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // Render this after cursor, not before (e.g. -1)
        }).range(cursor),
      ]);
    }
  },
  { decorations: (plugin) => plugin.decorations }, // Tell Codemirror to use our decorations
);

const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) return false; // No suggestion. Tab will be indent still

      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, insert: suggestion },
        selection: { anchor: cursor + suggestion.length },
        effects: setSuggestionEffect.of(null),
      });
      return true;
    },
  },
]);

export const suggestion = (fileName: string) => [
  suggestionState, // Our state storage
  createDebouncePlugin(fileName), // Triggers suggestion on typing
  renderPlugin, // Renders the ghost text
  acceptSuggestionKeymap, // Tab to accept
];
