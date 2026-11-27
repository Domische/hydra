
import { create } from "zustand";
import type { LinkComponent } from "../model/LinkComponent";
import { LinkRepository } from "../repositories/LinkRepository";
import { LinkService } from "../services/LinkService";

const linkRepository = new LinkRepository();
const linkService = new LinkService(linkRepository);

interface LinkState {
  links: LinkComponent[];
  loading: boolean;
  loadLinks: () => Promise<void>;
  addLink: (
    sourceBoardId: string,
    targetBoardId: string
  ) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
}

export const useLinkStore = create<LinkState>((set) => ({
  links: [],
  loading: false,

  loadLinks: async () => {
    set({ loading: true });

    try {
      const links = await linkService.getAllLinks();
      set({ links });
    } finally {
      set({ loading: false });
    }
  },

  addLink: async (sourceBoardId, targetBoardId) => {
    if (sourceBoardId === targetBoardId) return;

    const existingLinks = await linkService.getAllLinks();

    const alreadyExists = existingLinks.some(
      (link) =>
        link.sourceBoardId === sourceBoardId &&
        link.targetBoardId === targetBoardId
    );

    if (alreadyExists) return;

    const link: LinkComponent = {
      id: crypto.randomUUID(),
      sourceBoardId,
      targetBoardId,
      createdAt: new Date().toISOString(),
    };

    await linkService.addLink(link);

    set((state) => ({
      links: [...state.links, link],
    }));
  },

  deleteLink: async (id) => {
    await linkService.deleteLink(id);

    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
    }));
  },
}));
