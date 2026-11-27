import { beforeEach, describe, expect, it } from "vitest";
import type { Board } from "../model/Board";
import { BoardRepository } from "../repositories/BoardRepository";

const board = (id: string, title = "Board") : Board => ({
  id,
  title,
  createdAt: "2026-11-27T10:00:00.000Z",
  updatedAt: "2026-11-27T10:00:00.000Z",
  isFavorite: false,
  projectId: "project-1",
});

describe("BoardRepository", () => {
  let repository: BoardRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new BoardRepository();
  });

  it("returns an empty list when no boards exist", async () => {
    await expect(repository.getAll()).resolves.toEqual([]);
  });

  it("appends and retrieves a board", async () => {
    await repository.save(board("board-1"));

    await expect(repository.getById("board-1")).resolves.toEqual(board("board-1"));
  });

  it("updates an existing board instead of duplicating it", async () => {
    await repository.save(board("board-1", "Before"));
    await repository.save(board("board-1", "After"));

    await expect(repository.getAll()).resolves.toEqual([board("board-1", "After")]);
  });

  it("deletes only the selected board", async () => {
    await repository.save(board("board-1"));
    await repository.save(board("board-2", "Other"));

    await repository.delete("board-1");

    await expect(repository.getAll()).resolves.toEqual([board("board-2", "Other")]);
  });

  it("returns null for an unknown board", async () => {
    await expect(repository.getById("unknown")).resolves.toBeNull();
  });

  it("defaults isFavorite for legacy stored records", async () => {
    localStorage.setItem("myBoards", JSON.stringify([{
      id: "legacy",
      title: "Legacy board",
      createdAt: "2026-11-27T10:00:00.000Z",
      updatedAt: "2026-11-27T10:00:00.000Z",
    }]));

    const [legacy] = await repository.getAll();
    expect(legacy.isFavorite).toBe(false);
  });
});
