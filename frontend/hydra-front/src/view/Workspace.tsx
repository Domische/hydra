import { useEffect } from "react";
import { useBoardStore } from "../viewmodel/useBoardStore";
import { useProjectStore } from "../viewmodel/useProjectStore";
import "./Workspace.css";

interface WorkspaceProps {
  onOpenBoard: (boardId: string) => void;
  onOpenProject: (projectId: string) => void;
  onOpenAllBoards: () => void;
}

export function Workspace({
  onOpenBoard,
  onOpenProject,
  onOpenAllBoards
}: WorkspaceProps) {
  const boards = useBoardStore((state) => state.boards);
  const loadBoards = useBoardStore((state) => state.loadBoards);
  const createBoard = useBoardStore((state) => state.createBoard);

  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  const activeProjects = projects.filter(
    (project) => !project.isArchived
  );

  const recentBoards = [...boards]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  const handleCreateBoard = async () => {
    await createBoard("Новая доска");

    const createdBoardId =
      useBoardStore.getState().selectedBoardId;

    if (createdBoardId) {
      onOpenBoard(createdBoardId);
    }
  };

  const handleCreateProject = async () => {
    const title = window.prompt("Введите название проекта:");

    if (!title?.trim()) return;

    await createProject(title.trim());
  };

  return (
    <div className="workspace">
      <section className="workspace-header">
        <div>
          <h1>Рабочее пространство</h1>
          <p>Привет! Продолжай работу над проектами.</p>
        </div>

        <div className="workspace-actions">
          <button
            className="secondary-button"
            onClick={() => void handleCreateBoard()}
          >
            + Создать доску
          </button>

          <button
            className="primary-button"
            onClick={() => void handleCreateProject()}
          >
            + Новый проект
          </button>
        </div>
      </section>

      <section className="workspace-section">
        <h2>
          Проекты{" "}
          <span className="section-count">
            {activeProjects.length}
          </span>
        </h2>

        <div className="projects-grid">
          {activeProjects.map((project, index) => {
            const projectBoards = boards.filter(
              (board) => board.projectId === project.id
            );

            const colors = ["purple", "blue", "green", "orange"];
            const color = colors[index % colors.length];

            return (
              <button
                className="project-card"
                key={project.id}
                onClick={() => onOpenProject(project.id)}
              >
                <div className={`project-icon ${color}`}>
                  ▱
                </div>

                <h3>{project.title}</h3>
                <p>
                  {projectBoards.length}{" "}
                  {projectBoards.length === 1
                    ? "доска"
                    : projectBoards.length >= 2 &&
                        projectBoards.length <= 4
                      ? "доски"
                      : "досок"}
                </p>
              </button>
            );
          })}

          <button
            className="new-project-card"
            onClick={() => void handleCreateProject()}
          >
            <span>+</span>
            Новый проект
          </button>
        </div>

        {activeProjects.length === 0 && (
          <p className="workspace-empty">
            Пока нет проектов. Создай первый проект!
          </p>
        )}
      </section>

      <section className="workspace-section">
        <div className="section-heading">
          <h2>Недавние доски</h2>

          <button
            className="text-button"
            onClick={onOpenAllBoards}
        >
           Смотреть все →
        </button>
        </div>

        <div className="recent-boards-grid">
          {recentBoards.map((board, index) => {
            const colors = ["purple", "blue", "orange", "green", "pink"];
            const color = colors[index % colors.length];

            return (
              <button
                className="recent-board-card"
                key={board.id}
                onClick={() => onOpenBoard(board.id)}
              >
                <div className="recent-board-header">
                  <div className={`board-icon ${color}`}>▤</div>

                  <div className="board-info">
                    <h3>{board.title}</h3>
                    <p>Моя доска</p>
                  </div>
                </div>

                <div className={`board-preview ${color}`}>
                  <div />
                  <div />
                  <div />
                </div>

                <div className="board-footer">
                  Обновлено:{" "}
                  {new Date(board.updatedAt).toLocaleDateString(
                    "ru-RU"
                  )}
                </div>
              </button>
            );
          })}

          {recentBoards.length === 0 && (
            <p className="workspace-empty">
              Пока нет досок. Создай первую доску!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}