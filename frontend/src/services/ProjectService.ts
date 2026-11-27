
import type { Project } from "../model/Project";
import type { IProjectRepository } from "../repositories/IProjectRepository";

export class ProjectService {
  private readonly projectRepository: IProjectRepository;

  constructor(projectRepository: IProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.getAll();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepository.getById(id);
  }

  async createProject(title: string): Promise<Project> {
    const now = new Date().toISOString();

    const project: Project = {
      id: crypto.randomUUID(),
      title,
      description: "",
      color: "#8B5CF6",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.projectRepository.save(project);

    return project;
  }

  async updateProject(project: Project): Promise<void> {
    await this.projectRepository.save(project);
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
