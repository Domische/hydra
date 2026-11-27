
import { create } from "zustand";
import type { Project } from "../model/Project";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { ProjectService } from "../services/ProjectService";
import { useBoardStore } from "./useBoardStore";

const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);

interface ProjectState {
  projects: Project[];
  loading: boolean;
  loadProjects: () => Promise<void>;
  createProject: (title: string) => Promise<void>;
  renameProject: (id: string, title: string) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  loadProjects: async () => {
    set({ loading: true });

    try {
      const projects = await projectService.getAllProjects();
      set({ projects });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (title) => {
    if (!title.trim()) return;

    const project = await projectService.createProject(title.trim());

    set((state) => ({
      projects: [...state.projects, project],
    }));
  },

  renameProject: async (id, title) => {
    const project = get().projects.find((item) => item.id === id);

    if (!project || !title.trim()) return;

    const updatedProject = {
      ...project,
      title: title.trim(),
      updatedAt: new Date().toISOString(),
    };

    await projectService.updateProject(updatedProject);

    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === id ? updatedProject : item
      ),
    }));
  },

  updateProject: async (project) => {
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    await projectService.updateProject(updatedProject);

    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === project.id ? updatedProject : item
      ),
    }));
  },

  duplicateProject: async (id) => {
    const originalProject = get().projects.find(
      (item) => item.id === id
    );

    if (!originalProject) return;

    const now = new Date().toISOString();
    const newProjectId = crypto.randomUUID();

    const duplicatedProject: Project = {
      ...originalProject,
      id: newProjectId,
      title: `${originalProject.title} (копия)`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    await projectService.updateProject(duplicatedProject);

    set((state) => ({
      projects: [...state.projects, duplicatedProject],
    }));

    const boardStore = useBoardStore.getState();

    const originalBoards = boardStore.boards.filter(
      (board) => board.projectId === id
    );

    for (const board of originalBoards) {
      await useBoardStore
        .getState()
        .duplicateBoardToProject(board.id, newProjectId);
    }
  },

  archiveProject: async (id) => {
    const project = get().projects.find((item) => item.id === id);

    if (!project) return;

    const updatedProject = {
      ...project,
      isArchived: !project.isArchived,
      updatedAt: new Date().toISOString(),
    };

    await projectService.updateProject(updatedProject);

    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === id ? updatedProject : item
      ),
    }));
  },

  deleteProject: async (id) => {
    const boards = useBoardStore.getState().boards;

    const projectBoards = boards.filter(
      (board) => board.projectId === id
    );

    for (const board of projectBoards) {
      await useBoardStore
        .getState()
        .moveBoardToProject(board.id, null);
    }

    await projectService.deleteProject(id);

    set((state) => ({
      projects: state.projects.filter(
        (project) => project.id !== id
      ),
    }));
  },
}));
