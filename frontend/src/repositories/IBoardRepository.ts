
import type { Board } from "../model/Board";

export interface IBoardRepository {
  getAll(): Promise<Board[]>;
  getById(id: string): Promise<Board | null>;
  save(board: Board): Promise<void>;
  delete(id: string): Promise<void>;
}
