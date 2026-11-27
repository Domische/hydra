
import { useState } from "react";
import { useBoardStore } from "../viewmodel/useBoardStore";
import { useProjectStore } from "../viewmodel/useProjectStore";
import "./Sidebar.css";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: "workspace", icon: "▦", label: "Рабочее пространство" },
  { id: "boards", icon: "▣", label: "Мои доски" },
  { id: "favorites", icon: "☆", label: "Избранное" },
  { id: "team", icon: "♧", label: "Команда" },
];

const boardColors = [
  "#A16BFF",
  "#3987FF",
  "#F5A000",
  "#20C76B",
  "#EC4899",
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const activeProjectId = activePage.startsWith("project:")
    ? activePage.replace("project:", "")
    : null;

  const [expandedProjects, setExpandedProjects] = useState<string[]>(
    activeProjectId ? [activeProjectId] : []
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const renameProject = useProjectStore((state) => state.renameProject);
  const duplicateProject = useProjectStore((state) => state.duplicateProject);
  const archiveProject = useProjectStore((state) => state.archiveProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);

  const boards = useBoardStore((state) => state.boards);
  const createBoard = useBoardStore((state) => state.createBoard);
  const selectBoard = useBoardStore((state) => state.selectBoard);
  const selectedBoardId = useBoardStore((state) => state.selectedBoardId);

  const archivedProjects = projects.filter((project) => project.isArchived);

  const handleCreateProject = async () => {
    const title = window.prompt("Введите название проекта:");
    if (!title?.trim()) return;
    await createProject(title.trim());
  };

  const handleRenameProject = async (id: string, currentTitle: string) => {
    const title = window.prompt("Новое название проекта:", currentTitle);
    if (!title?.trim()) return;

    await renameProject(id, title.trim());
    setOpenMenuId(null);
  };

  const handleDeleteProject = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Удалить проект «${title}»? Его доски сохранятся в разделе «Мои доски».`
    );

    if (!confirmed) return;

    await deleteProject(id);

    if (activePage === `project:${id}`) {
      onNavigate("boards");
    }

    setOpenMenuId(null);
  };

  const handleOpenProject = (projectId: string) => {
    setExpandedProjects((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    );

    onNavigate(`project:${projectId}`);
  };

  const handleCreateBoard = async (projectId: string) => {
    const title = window.prompt("Введите название доски:");
    if (!title?.trim()) return;

    await createBoard(title.trim(), projectId);
    onNavigate(`project:${projectId}`);
  };

  const handleOpenBoard = (boardId: string) => {
    selectBoard(boardId);
    onNavigate(`board:${boardId}`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-symbol">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M8 12 L20 20 L32 8 M20 20 L25 33" />
            <circle cx="8" cy="12" r="3" />
            <circle cx="32" cy="8" r="3" />
            <circle cx="25" cy="33" r="3" />
          </svg>
        </div>
        <span>Hydra</span>
      </div>

      <div className="sidebar-scroll">
        <section className="sidebar-section">
          <div className="sidebar-label">МЕНЮ</div>

          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </section>

        <section className="sidebar-section projects-section">
          <div className="projects-header">
            <span className="sidebar-label">ПРОЕКТЫ</span>

            <button
              className="project-add-button"
              onClick={() => void handleCreateProject()}
              title="Создать проект"
              aria-label="Создать проект"
            >
              +
            </button>
          </div>

          <div className="projects-list">
            {projects
              .filter((project) => !project.isArchived)
              .map((project) => {
                const isExpanded = expandedProjects.includes(project.id);
                const isActive = activePage === `project:${project.id}`;

                const projectBoards = boards.filter(
                  (board) => board.projectId === project.id
                );

                return (
                  <div className="project-item" key={project.id}>
                    <div className={`project-row ${isActive ? "active" : ""}`}>
                      <button
                        className="project-link"
                        onClick={() => handleOpenProject(project.id)}
                      >
                        <span className="project-arrow">
                          {isExpanded ? "⌄" : "›"}
                        </span>

                        <span className="project-folder">▱</span>
                        <span className="project-name">{project.title}</span>
                      </button>

                      <button
                        className="project-menu-button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === project.id ? null : project.id
                          )
                        }
                        title="Действия с проектом"
                        aria-label={`Действия с проектом ${project.title}`}
                      >
                        ⋯
                      </button>
                    </div>

                    {openMenuId === project.id && (
                      <div className="project-context-menu">
                        <button
                          onClick={() =>
                            void handleRenameProject(project.id, project.title)
                          }
                        >
                          ✎ <span>Переименовать</span>
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onNavigate(`project-settings:${project.id}`);
                          }}
                        >
                          ⚙ <span>Настройки проекта</span>
                        </button>

                        <button
                          onClick={() => {
                            void duplicateProject(project.id);
                            setOpenMenuId(null);
                          }}
                        >
                          ⧉ <span>Дублировать</span>
                        </button>

                        <button
                          onClick={() => {
                            void archiveProject(project.id);

                            if (activePage === `project:${project.id}`) {
                              onNavigate("boards");
                            }

                            setOpenMenuId(null);
                          }}
                        >
                          ▣ <span>Архивировать</span>
                        </button>

                        <div className="project-menu-divider" />

                        <button
                          className="delete-project-action"
                          onClick={() =>
                            void handleDeleteProject(project.id, project.title)
                          }
                        >
                          × <span>Удалить проект</span>
                        </button>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="project-boards">
                        {projectBoards.map((board, index) => (
                          <button
                            key={board.id}
                            className={`project-board-link ${
                              selectedBoardId === board.id ? "active" : ""
                            }`}
                            onClick={() => handleOpenBoard(board.id)}
                          >
                            <span
                              className="project-board-dot"
                              style={{
                                background:
                                  boardColors[index % boardColors.length],
                              }}
                            />
                            <span>{board.title}</span>
                          </button>
                        ))}

                        <button
                          className="project-create-board"
                          onClick={() => void handleCreateBoard(project.id)}
                        >
                          <span>＋</span>
                          <span>Доска</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <button
            className={`sidebar-link archive-link ${
              activePage === "archive" ? "active" : ""
            }`}
            onClick={() => onNavigate("archive")}
          >
            <span className="sidebar-icon">▣</span>
            <span>Архив</span>

            {archivedProjects.length > 0 && (
              <span className="archive-count">{archivedProjects.length}</span>
            )}
          </button>
        </section>
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">U</div>

        <div className="profile-info">
          <strong>Пользователь</strong>
          <span>Личный аккаунт</span>
        </div>

        <button
          className="profile-settings"
          onClick={() => onNavigate("settings")}
          title="Настройки"
        >
          ⚙
        </button>
      </div>
    </aside>
  );
}
