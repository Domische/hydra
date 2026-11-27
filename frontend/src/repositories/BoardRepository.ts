
import type { Board } from "../model/Board";
import type { IBoardRepository } from "./IBoardRepository";
import { LocalStorageAdapter } from "../adapters/LocalStorageAdapter";

export class BoardRepository implements IBoardRepository {
  private readonly storage = new LocalStorageAdapter();
  private readonly storageKey = "myBoards";

  async getAll(): Promise<Board[]> {
    const boards = this.storage.get<Board[]>(this.storageKey) ?? [];

    return boards.map((board) => ({
      ...board,
      isFavorite: board.isFavorite ?? false,
    }));
  }

  async getById(id: string): Promise<Board | null> {
    const boards = await this.getAll();
    return boards.find((board) => board.id === id) ?? null;
  }

  async save(board: Board): Promise<void> {
  const boards = await this.getAll();
  const index = boards.findIndex((item) => item.id === board.id);

  if (index >= 0) {
    boards[index] = board;
  } else {
    boards.push(board);
  }

  this.storage.set(this.storageKey, boards);
}

  async delete(id: string): Promise<void> {
    const boards = await this.getAll();

    this.storage.set(
      this.storageKey,
      boards.filter((board) => board.id !== id)
    );
  }
}
