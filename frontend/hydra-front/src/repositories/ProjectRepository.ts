
import type { Project } from "../model/Project";
import type { IProjectRepository } from "./IProjectRepository";
import { LocalStorageAdapter } from "../adapters/LocalStorageAdapter";

export class ProjectRepository implements IProjectRepository {
  private readonly storage = new LocalStorageAdapter();
  private readonly storageKey = "myProjects";

  async getAll(): Promise<Project[]> {
    const projects =
      this.storage.get<Project[]>(this.storageKey) ?? [];

    return projects.map((project) => ({
      ...project,
      description: project.description ?? "",
      color: project.color ?? "#8B5CF6",
      isArchived: project.isArchived ?? false,
    }));
  }

  async getById(id: string): Promise<Project | null> {
    const projects = await this.getAll();

    return projects.find((project) => project.id === id) ?? null;
  }

  async save(project: Project): Promise<void> {
    const projects = await this.getAll();

    const index = projects.findIndex(
      (item) => item.id === project.id
    );

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    this.storage.set(this.storageKey, projects);
  }

  async delete(id: string): Promise<void> {
    const projects = await this.getAll();

    this.storage.set(
      this.storageKey,
      projects.filter((project) => project.id !== id)
    );
  }
}
