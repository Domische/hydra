
import type { LinkComponent } from "../model/LinkComponent";

export interface ILinkRepository {
  getAll(): Promise<LinkComponent[]>;
  getBySourceBoardId(boardId: string): Promise<LinkComponent[]>;
  getById(id: string): Promise<LinkComponent | null>;
  save(link: LinkComponent): Promise<void>;
  delete(id: string): Promise<void>;
}
