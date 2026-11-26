import { useMemo } from "react";
import { Tldraw } from "tldraw";
import type { Editor, TLEditorSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { useBoardStore } from "../viewmodel/useBoardStore";
import { boardDocumentService } from "../services/BoardDocumentService";
import {
  applyNoteTheme,
  tldrawAssetUrls,
  tldrawComponents,
  tldrawConfig,
  tldrawOverrides,
} from "../tldraw";
import "./BoardEditor.css";

const SAVE_DELAY_MS = 400;

export function BoardEditor() {
  const selectedBoardId = useBoardStore(
    (state) => state.selectedBoardId
  );
  const boards = useBoardStore((state) => state.boards);

  const selectedBoard = boards.find(
    (board) => board.id === selectedBoardId
  );

  const initialSnapshot = useMemo<TLEditorSnapshot | undefined>(
    () =>
      selectedBoardId
        ? boardDocumentService.load(selectedBoardId) ?? undefined
        : undefined,
    [selectedBoardId]
  );

  if (!selectedBoardId || !selectedBoard) {
    return (
      <main className="board-editor-empty">
        <h2>Выберите доску</h2>
        <p>Или создайте новую, чтобы начать работу.</p>
      </main>
    );
  }

  const handleMount = (editor: Editor) => {
    applyNoteTheme(editor);

    let saveTimeout: number | undefined;

    const save = () => {
      boardDocumentService.save(
        selectedBoardId,
        editor.getSnapshot()
      );
    };

    const unsubscribe = editor.store.listen(
      () => {
        window.clearTimeout(saveTimeout);
        saveTimeout = window.setTimeout(save, SAVE_DELAY_MS);
      },
      { scope: "document", source: "user" }
    );

    return () => {
      window.clearTimeout(saveTimeout);
      save();
      unsubscribe();
    };
  };

  return (
    <main className="board-editor">
      <div className="board-canvas">
        <Tldraw
          key={selectedBoardId}
          snapshot={initialSnapshot}
          onMount={handleMount}
          locale={tldrawConfig.locale}
          colorScheme={tldrawConfig.colorScheme}
          overrides={tldrawOverrides}
          components={tldrawComponents}
          assetUrls={tldrawAssetUrls}
        />
      </div>
    </main>
  );
}
