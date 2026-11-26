
import type { LinkComponent } from "../model/LinkComponent";
import type { ILinkRepository } from "./ILinkRepository";
import { LocalStorageAdapter } from "../adapters/LocalStorageAdapter";

export class LinkRepository implements ILinkRepository {
  private readonly storage = new LocalStorageAdapter();
  private readonly storageKey = "myLinks";


async getAll(): Promise<LinkComponent[]> {
  return this.storage.get<LinkComponent[]>(this.storageKey) ?? [];
}

  async getBySourceBoardId(boardId: string): Promise<LinkComponent[]> {
    const links = this.storage.get<LinkComponent[]>(this.storageKey) ?? [];
    return links.filter((link) => link.sourceBoardId === boardId);
  }

  async getById(id: string): Promise<LinkComponent | null> {
    const links = this.storage.get<LinkComponent[]>(this.storageKey) ?? [];
    return links.find((link) => link.id === id) ?? null;
  }

  async save(link: LinkComponent): Promise<void> {
    const links = this.storage.get<LinkComponent[]>(this.storageKey) ?? [];
    const index = links.findIndex((item) => item.id === link.id);

    if (index >= 0) {
      links[index] = link;
    } else {
      links.push(link);
    }

    this.storage.set(this.storageKey, links);
  }

  async delete(id: string): Promise<void> {
    const links = this.storage.get<LinkComponent[]>(this.storageKey) ?? [];
    this.storage.set(
      this.storageKey,
      links.filter((link) => link.id !== id)
    );
  }
}
