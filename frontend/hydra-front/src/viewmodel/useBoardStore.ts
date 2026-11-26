
import { create } from "zustand";
import type { Board } from "../model/Board";
import { BoardRepository } from "../repositories/BoardRepository";
import { CachedBoardRepository } from "../repositories/CachedBoardRepository";
import { BoardService } from "../services/BoardService";
import { boardDocumentService } from "../services/BoardDocumentService";

const repository = new CachedBoardRepository(new BoardRepository());
const boardService = new BoardService(repository);

interface BoardState {
  boards: Board[];
  selectedBoardId: string | null;
  loading: boolean;
  loadBoards: () => Promise<void>;
  selectBoard: (id: string | null) => void;
  createBoard: (title: string, projectId?: string) => Promise<void>;
  renameBoard: (id: string, title: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  duplicateBoard: (id: string) => Promise<void>;
  duplicateBoardToProject: (
    id: string,
    projectId: string
  ) => Promise<void>;
  moveBoardToProject: (
    boardId: string,
    projectId: string | null
  ) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  selectedBoardId: null,
  loading: false,

  loadBoards: async () => {
    set({ loading: true });

    try {
      const boards = await boardService.getAllBoards();
      set({ boards });
    } finally {
      set({ loading: false });
    }
  },

  selectBoard: (id) => {
    set({ selectedBoardId: id });
  },

  createBoard: async (title, projectId) => {
    const board = await boardService.createBoard(title, projectId);

    set((state) => ({
      boards: [...state.boards, board],
      selectedBoardId: board.id,
    }));
  },

  renameBoard: async (id, title) => {
    const board = get().boards.find((item) => item.id === id);

    if (!board || !title.trim()) return;

    const updatedBoard = {
      ...board,
      title: title.trim(),
      updatedAt: new Date().toISOString(),
    };

    await boardService.updateBoard(updatedBoard);

    set((state) => ({
      boards: state.boards.map((item) =>
        item.id === id ? updatedBoard : item
      ),
    }));
  },

  toggleFavorite: async (id) => {
    const board = get().boards.find((item) => item.id === id);

    if (!board) return;

    const updatedBoard = {
      ...board,
      isFavorite: !board.isFavorite,
    };

    await boardService.updateBoard(updatedBoard);

    set((state) => ({
      boards: state.boards.map((item) =>
        item.id === id ? updatedBoard : item
      ),
    }));
  },

  duplicateBoard: async (id) => {
    const originalBoard = get().boards.find(
      (board) => board.id === id
    );

    if (!originalBoard) return;

    const newBoard = await boardService.createBoard(
      `${originalBoard.title} (копия)`,
      originalBoard.projectId
    );

    boardDocumentService.copy(id, newBoard.id);

    set((state) => ({
      boards: [...state.boards, newBoard],
      selectedBoardId: newBoard.id,
    }));
  },

  duplicateBoardToProject: async (id, projectId) => {
    const originalBoard = get().boards.find(
      (board) => board.id === id
    );

    if (!originalBoard) return;

    const newBoard = await boardService.createBoard(
      originalBoard.title,
      projectId
    );

    boardDocumentService.copy(id, newBoard.id);

    set((state) => ({
      boards: [...state.boards, newBoard],
    }));
  },

  moveBoardToProject: async (boardId, projectId) => {
    const board = get().boards.find((item) => item.id === boardId);

    if (!board) return;

    const updatedBoard = {
      ...board,
      projectId: projectId ?? undefined,
      updatedAt: new Date().toISOString(),
    };

    await boardService.updateBoard(updatedBoard);

    set((state) => ({
      boards: state.boards.map((item) =>
        item.id === boardId ? updatedBoard : item
      ),
    }));
  },

  deleteBoard: async (id) => {
    await boardService.deleteBoard(id);

    set((state) => ({
      boards: state.boards.filter((board) => board.id !== id),
      selectedBoardId:
        state.selectedBoardId === id ? null : state.selectedBoardId,
    }));
  },
}));
