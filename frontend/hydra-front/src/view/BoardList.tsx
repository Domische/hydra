
import { useEffect, useMemo, useState } from "react";
import { useBoardStore } from "../viewmodel/useBoardStore";
import { useProjectStore } from "../viewmodel/useProjectStore";
import "./BoardList.css";

interface BoardListProps {
  onOpenBoard: (boardId: string) => void;
}

type ViewMode = "list" | "grid";

export function BoardList({ onOpenBoard }: BoardListProps) {
  const boards = useBoardStore((state) => state.boards);
  const loadBoards = useBoardStore((state) => state.loadBoards);
  const createBoard = useBoardStore((state) => state.createBoard);
  const renameBoard = useBoardStore((state) => state.renameBoard);
  const toggleFavorite = useBoardStore((state) => state.toggleFavorite);
  const duplicateBoard = useBoardStore((state) => state.duplicateBoard);
  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const moveBoardToProject = useBoardStore(
    (state) => state.moveBoardToProject
  );

  const projects = useProjectStore((state) => state.projects);

  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  const visibleBoards = useMemo(() => {
    return [...boards]
      .filter((board) => {
        const matchesProject =
          projectFilter === "all"
            ? true
            : projectFilter === "none"
              ? !board.projectId
              : board.projectId === projectFilter;

        const matchesSearch = board.title
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());

        return matchesProject && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );
  }, [boards, projectFilter, searchQuery]);

  const handleCreate = async () => {
    const title = window.prompt("Введите название новой доски:");
    if (!title?.trim()) return;

    const newBoard = await createBoard(title.trim());
    if (typeof newBoard === "string") {
      onOpenBoard(newBoard);
    }
  };

  const handleRename = async (id: string) => {
    const title = editingTitle.trim();
    if (!title) return;

    await renameBoard(id, title);
    setEditingBoardId(null);
    setEditingTitle("");
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Удалить доску «${title}»? Это действие нельзя отменить.`
    );

    if (!confirmed) return;

    await deleteBoard(id);
    setOpenMenuId(null);
  };

  const getProjectTitle = (projectId?: string) => {
    if (!projectId) return "Без проекта";

    return (
      projects.find((project) => project.id === projectId)?.title ??
      "Проект не найден"
    );
  };

  const getBoardColor = (index: number) => {
    const colors = ["purple", "blue", "orange", "green", "pink"];
    return colors[index % colors.length];
  };

  return (
    <main className="board-list-page">
      <header className="board-list-header">
        <div>
          <div className="board-list-title-row">
            <h1>Мои доски</h1>
            <span className="board-list-count">{visibleBoards.length}</span>
          </div>
          <p>Все доски из ваших проектов</p>
        </div>

        <button
          className="board-create-button"
          onClick={() => void handleCreate()}
        >
          <span>＋</span>
          Создать доску
        </button>
      </header>

      <div className="board-list-controls">
        <label className="board-search">
          <span>⌕</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по доскам"
            aria-label="Поиск по доскам"
          />
        </label>

        <select
          className="board-project-filter"
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          aria-label="Фильтр по проектам"
        >
          <option value="all">Все проекты</option>
          <option value="none">Без проекта</option>
          {projects
            .filter((project) => !project.isArchived)
            .map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
        </select>

        <div className="board-view-switch">
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
            title="Показать карточками"
            aria-label="Показать карточками"
          >
            ▦
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
            title="Показать списком"
            aria-label="Показать списком"
          >
            ☷
          </button>
        </div>
      </div>

      {visibleBoards.length > 0 ? (
        viewMode === "list" ? (
          <div className="boards-table-wrapper">
            <table className="boards-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Проект</th>
                  <th>Изменено</th>
                  <th className="board-table-actions-heading">Действия</th>
                </tr>
              </thead>

              <tbody>
                {visibleBoards.map((board, index) => (
                  <tr key={board.id}>
                    <td>
                      {editingBoardId === board.id ? (
                        <div className="board-rename-form">
                          <input
                            value={editingTitle}
                            onChange={(event) =>
                              setEditingTitle(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                void handleRename(board.id);
                              }
                              if (event.key === "Escape") {
                                setEditingBoardId(null);
                                setEditingTitle("");
                              }
                            }}
                            autoFocus
                          />
                          <button onClick={() => void handleRename(board.id)}>
                            Сохранить
                          </button>
                          <button
                            onClick={() => {
                              setEditingBoardId(null);
                              setEditingTitle("");
                            }}
                          >
                            Отмена
                          </button>
                        </div>
                      ) : (
                        <button
                          className="board-table-name"
                          onClick={() => onOpenBoard(board.id)}
                        >
                          <span
                            className={`board-table-icon ${getBoardColor(index)}`}
                          >
                            ▤
                          </span>
                          <span>{board.title}</span>
                        </button>
                      )}
                    </td>

                    <td>
                      <span className="board-project-badge">
                        <span />
                        {getProjectTitle(board.projectId)}
                      </span>
                    </td>

                    <td className="board-updated">
                      {new Date(board.updatedAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td>
                      <div className="board-row-actions">
                        <button
                          className={`board-favorite-button ${
                            board.isFavorite ? "favorite" : ""
                          }`}
                          onClick={() => void toggleFavorite(board.id)}
                          title={
                            board.isFavorite
                              ? "Убрать из избранного"
                              : "Добавить в избранное"
                          }
                        >
                          {board.isFavorite ? "★" : "☆"}
                        </button>

                        <div className="board-menu-container">
                          <button
                            className="board-more-button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === board.id ? null : board.id
                              )
                            }
                            title="Действия с доской"
                          >
                            ⋯
                          </button>

                          {openMenuId === board.id && (
                            <div className="board-action-menu">
                              <button
                                onClick={() => {
                                  setEditingBoardId(board.id);
                                  setEditingTitle(board.title);
                                  setOpenMenuId(null);
                                }}
                              >
                                ✎ Переименовать
                              </button>

                              <button
                                onClick={() => {
                                  void duplicateBoard(board.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                ⧉ Создать копию
                              </button>

                              <label className="board-move-label">
                                Переместить в проект
                                <select
                                  value={board.projectId ?? ""}
                                  onChange={(event) => {
                                    void moveBoardToProject(
                                      board.id,
                                      event.target.value || null
                                    );
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <option value="">Без проекта</option>
                                  {projects
                                    .filter((project) => !project.isArchived)
                                    .map((project) => (
                                      <option
                                        key={project.id}
                                        value={project.id}
                                      >
                                        {project.title}
                                      </option>
                                    ))}
                                </select>
                              </label>

                              <button
                                className="delete-board-action"
                                onClick={() =>
                                  void handleDelete(board.id, board.title)
                                }
                              >
                                × Удалить
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="boards-card-grid">
            {visibleBoards.map((board, index) => (
              <article className="boards-grid-card" key={board.id}>
                <button
                  className="boards-grid-main"
                  onClick={() => onOpenBoard(board.id)}
                >
                  <div className="boards-grid-card-header">
                    <span
                      className={`board-table-icon ${getBoardColor(index)}`}
                    >
                      ▤
                    </span>
                    <span className="boards-grid-project">
                      {getProjectTitle(board.projectId)}
                    </span>
                  </div>

                  <h3>{board.title}</h3>

                  <div className="board-preview-lines">
                    <span />
                    <span />
                    <span />
                  </div>

                  <p>
                    Изменено:{" "}
                    {new Date(board.updatedAt).toLocaleDateString("ru-RU")}
                  </p>
                </button>

                <div className="boards-grid-actions">
                  <button
                    className={`board-favorite-button ${
                      board.isFavorite ? "favorite" : ""
                    }`}
                    onClick={() => void toggleFavorite(board.id)}
                    title="Избранное"
                  >
                    {board.isFavorite ? "★" : "☆"}
                  </button>

                  <button
                    className="board-more-button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === board.id ? null : board.id)
                    }
                    title="Действия"
                  >
                    ⋯
                  </button>

                  {openMenuId === board.id && (
                    <div className="board-action-menu grid-menu">
                      <button
                        onClick={() => {
                          setEditingBoardId(board.id);
                          setEditingTitle(board.title);
                          setOpenMenuId(null);
                        }}
                      >
                        ✎ Переименовать
                      </button>
                      <button
                        onClick={() => {
                          void duplicateBoard(board.id);
                          setOpenMenuId(null);
                        }}
                      >
                        ⧉ Создать копию
                      </button>
                      <button
                        className="delete-board-action"
                        onClick={() => void handleDelete(board.id, board.title)}
                      >
                        × Удалить
                      </button>
                    </div>
                  )}
                </div>

                {editingBoardId === board.id && (
                  <div className="board-grid-rename">
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void handleRename(board.id);
                        }
                        if (event.key === "Escape") {
                          setEditingBoardId(null);
                          setEditingTitle("");
                        }
                      }}
                    />
                    <button onClick={() => void handleRename(board.id)}>
                      Сохранить
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )
      ) : (
        <div className="boards-empty">
          <div>▤</div>
          <h2>
            {searchQuery.trim()
              ? "Доски не найдены"
              : "Здесь пока нет досок"}
          </h2>
          <p>
            {searchQuery.trim()
              ? "Попробуйте изменить поисковый запрос или фильтр."
              : "Создайте первую доску, чтобы начать работу."}
          </p>
          {!searchQuery.trim() && (
            <button
              className="board-create-button"
              onClick={() => void handleCreate()}
            >
              ＋ Создать доску
            </button>
          )}
        </div>
      )}
    </main>
  );
}
