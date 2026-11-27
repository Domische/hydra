import type { TLEditorSnapshot } from "tldraw";

const storageKey = (boardId: string) => `hydra-board-document:${boardId}`;

export const boardDocumentService = {
  load(boardId: string): TLEditorSnapshot | null {
    try {
      const raw = localStorage.getItem(storageKey(boardId));
      return raw ? (JSON.parse(raw) as TLEditorSnapshot) : null;
    } catch {
      return null;
    }
  },

  save(boardId: string, snapshot: TLEditorSnapshot): void {
    try {
      localStorage.setItem(storageKey(boardId), JSON.stringify(snapshot));
    } catch {
      // Хранилище может быть переполнено или недоступно — холст продолжает работать в памяти.
    }
  },

  copy(sourceBoardId: string, targetBoardId: string): void {
    const snapshot = boardDocumentService.load(sourceBoardId);

    if (!snapshot) return;

    boardDocumentService.save(targetBoardId, snapshot);
  },
};
