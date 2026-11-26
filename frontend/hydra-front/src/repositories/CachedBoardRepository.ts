
import type { Board } from "../model/Board";
import type { IBoardRepository } from "./IBoardRepository";

export class CachedBoardRepository implements IBoardRepository {
  private readonly cache = new Map<string, Board>();
  private cacheLoaded = false;

  private readonly repository: IBoardRepository;

constructor(repository: IBoardRepository) {
  this.repository = repository;
}

  async getAll(): Promise<Board[]> {
    if (!this.cacheLoaded) {
      const boards = await this.repository.getAll();

      this.cache.clear();

      for (const board of boards) {
        this.cache.set(board.id, board);
      }

      this.cacheLoaded = true;
    }

    return Array.from(this.cache.values());
  }

  async getById(id: string): Promise<Board | null> {
    if (!this.cacheLoaded) {
      await this.getAll();
    }

    return this.cache.get(id) ?? null;
  }

  async save(board: Board): Promise<void> {
  await this.repository.save(board);

  if (this.cacheLoaded) {
    this.cache.set(board.id, board);
  }
}

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
    this.cache.delete(id);
  }
}
