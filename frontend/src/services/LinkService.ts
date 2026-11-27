
import type { LinkComponent } from "../model/LinkComponent";
import type { ILinkRepository } from "../repositories/ILinkRepository";

export class LinkService {
  private readonly linkRepository: ILinkRepository;

  constructor(linkRepository: ILinkRepository) {
    this.linkRepository = linkRepository;
  }

  async getAllLinks(): Promise<LinkComponent[]> {
    return this.linkRepository.getAll();
  }

  async getLinksByBoard(boardId: string): Promise<LinkComponent[]> {
    return this.linkRepository.getBySourceBoardId(boardId);
  }

  async addLink(link: LinkComponent): Promise<void> {
    await this.linkRepository.save(link);
  }

  async deleteLink(id: string): Promise<void> {
    await this.linkRepository.delete(id);
  }
}
