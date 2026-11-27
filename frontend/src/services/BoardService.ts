
import type { Board } from "../model/Board";
import type { IBoardRepository } from "../repositories/IBoardRepository";

export class BoardService {
  private readonly boardRepository: IBoardRepository;

  constructor(boardRepository: IBoardRepository) {
    this.boardRepository = boardRepository;
  }

  async getAllBoards(): Promise<Board[]> {
    return this.boardRepository.getAll();
  }

  async getBoardById(id: string): Promise<Board | null> {
    return this.boardRepository.getById(id);
  }

  async createBoard(title: string, projectId?: string): Promise<Board> {
  const now = new Date().toISOString();

  const board: Board = {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    projectId,
  };

  await this.boardRepository.save(board);
  return board;
}

  async updateBoard(board: Board): Promise<void> {
    await this.boardRepository.save(board);
  }

  async deleteBoard(id: string): Promise<void> {
    await this.boardRepository.delete(id);
  }
}
