import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { ProjectService } from "../services/ProjectService";

describe("ProjectService + ProjectRepository integration", () => {
  beforeEach(() => {
    localStorage.clear();
    const projectId = "project-integration-1" as ReturnType<typeof crypto.randomUUID>;
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(projectId);
  });

  it("creates, retrieves, updates, and deletes a project through real persistence", async () => {
    const service = new ProjectService(new ProjectRepository());

    const created = await service.createProject("Integration project");

    expect(created.id).toBe("project-integration-1");
    await expect(service.getProjectById(created.id)).resolves.toEqual(created);

    const updated = {
      ...created,
      title: "Renamed project",
      description: "Verified through the service",
      isArchived: true,
    };
    await service.updateProject(updated);

    await expect(service.getProjectById(created.id)).resolves.toEqual(updated);
    await service.deleteProject(created.id);
    await expect(service.getAllProjects()).resolves.toEqual([]);
  });
});
