
import { useEffect, useState } from "react";
import { Sidebar } from "./view/Sidebar";
import { Topbar } from "./view/Topbar";
import { BoardList } from "./view/BoardList";
import { BoardEditor } from "./view/BoardEditor";
import { ProjectMap } from "./view/ProjectMap";
import { Workspace } from "./view/Workspace";
import { ProjectSettingsModal } from "./view/ProjectSettingsModal";
import { useBoardStore } from "./viewmodel/useBoardStore";
import { useProjectStore } from "./viewmodel/useProjectStore";
import "./App.css";
import "./AppLayout.css";

const pageTitles: Record<string, string> = {
  workspace: "Рабочее пространство",
  boards: "Мои доски",
  favorites: "Избранное",
  team: "Команда",
  settings: "Настройки",
  archive: "Архив",
  profile: "Профиль",
};

function App() {
  const [activePage, setActivePage] = useState("boards");

  const selectBoard = useBoardStore((state) => state.selectBoard);
  const boards = useBoardStore((state) => state.boards);
  const selectedBoardId = useBoardStore((state) => state.selectedBoardId);
  const toggleFavorite = useBoardStore((state) => state.toggleFavorite);
  const loadBoards = useBoardStore((state) => state.loadBoards);
  const createBoard = useBoardStore((state) => state.createBoard);

  const loadProjects = useProjectStore((state) => state.loadProjects);
  const projects = useProjectStore((state) => state.projects);
  const archiveProject = useProjectStore((state) => state.archiveProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const updateProject = useProjectStore((state) => state.updateProject);

  const favoriteBoards = boards.filter((board) => board.isFavorite);
  const archivedProjects = projects.filter((project) => project.isArchived);

  const isProjectPage = activePage.startsWith("project:");
  const isProjectSettingsPage = activePage.startsWith("project-settings:");
  const isBoardPage = activePage.startsWith("board:");

  const activeProjectId = isProjectPage
    ? activePage.replace("project:", "")
    : null;

  const settingsProjectId = isProjectSettingsPage
    ? activePage.replace("project-settings:", "")
    : null;

  const activeBoardId = isBoardPage
    ? activePage.replace("board:", "")
    : null;

  const activeProject = projects.find(
    (project) => project.id === activeProjectId
  );

  const settingsProject = projects.find(
    (project) => project.id === settingsProjectId
  );

  const activeBoard = boards.find((board) => board.id === activeBoardId);

  useEffect(() => {
    void loadBoards();
    void loadProjects();
  }, [loadBoards, loadProjects]);

  useEffect(() => {
    if (activeBoardId && activeBoardId !== selectedBoardId) {
      selectBoard(activeBoardId);
    }
  }, [activeBoardId, selectedBoardId, selectBoard]);

  const handleOpenBoard = (boardId: string) => {
    selectBoard(boardId);
    setActivePage(`board:${boardId}`);
  };

  const handleBackFromBoard = () => {
    if (activeBoard?.projectId) {
      setActivePage(`project:${activeBoard.projectId}`);
    } else {
      setActivePage("boards");
    }
  };

  const handleDeleteArchivedProject = async (
    id: string,
    title: string
  ) => {
    const confirmed = window.confirm(
      `Удалить проект «${title}» навсегда? Его доски сохранятся в разделе «Мои доски».`
    );

    if (!confirmed) return;
    await deleteProject(id);
  };

  const handleSaveProject = async (
    project: NonNullable<typeof settingsProject>
  ) => {
    await updateProject(project);
    setActivePage(`project:${project.id}`);
  };

  const currentTitle = isProjectSettingsPage
    ? "Настройки проекта"
    : isBoardPage
      ? activeBoard?.title ?? "Доска"
      : isProjectPage
        ? activeProject?.title ?? "Проект"
        : pageTitles[activePage] ?? "Hydra";

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-area">
        <Topbar
          title={currentTitle}
          boards={boards}
          onOpenBoard={handleOpenBoard}
          onNavigate={setActivePage}
          onBack={isBoardPage ? handleBackFromBoard : undefined}
        />

        <div
          className={
            isBoardPage ? "page-content page-content--board" : "page-content"
          }
        >
          {activePage === "boards" && (
            <BoardList onOpenBoard={handleOpenBoard} />
          )}

          {isProjectPage && activeProject && (
            <div className="project-page">
              <div className="project-header">
                <div className="project-header-info">
                  <div
                    className="project-header-icon"
                    style={{
                      background: `${activeProject.color}20`,
                      color: activeProject.color,
                    }}
                  >
                    <span>▱</span>
                  </div>

                  <div>
                    <div className="project-header-title">
                      <h1>{activeProject.title}</h1>
                      <span className="project-header-star">★</span>
                    </div>

                    <p>
                      {activeProject.description || "Проект Hydra"} ·{" "}
                      {boards.filter(
                        (board) => board.projectId === activeProject.id
                      ).length}{" "}
                      доски
                    </p>
                  </div>
                </div>

                <button
                  className="project-header-add-board"
                  onClick={async () => {
                    const title = window.prompt("Название новой доски:");
                    if (!title?.trim()) return;
                    await createBoard(title.trim(), activeProject.id);
                  }}
                >
                  <span>＋</span> Доска
                </button>
              </div>

              <ProjectMap
                projectId={activeProject.id}
                boards={boards.filter(
                  (board) => board.projectId === activeProject.id
                )}
                onOpenBoard={handleOpenBoard}
              />
            </div>
          )}

          {isProjectPage && !activeProject && (
            <div className="card">
              <h2>Проект не найден</h2>
              <button onClick={() => setActivePage("boards")}>
                Вернуться к моим доскам
              </button>
            </div>
          )}

          {isBoardPage && activeBoard && <BoardEditor />}

          {isBoardPage && !activeBoard && (
            <div className="card">
              <h2>Доска не найдена</h2>
              <button onClick={() => setActivePage("boards")}>
                Вернуться к моим доскам
              </button>
            </div>
          )}

          {activePage === "workspace" && (
            <Workspace
              onOpenBoard={handleOpenBoard}
              onOpenProject={(projectId) =>
                setActivePage(`project:${projectId}`)
              }
              onOpenAllBoards={() => setActivePage("boards")}
            />
          )}

          {activePage === "favorites" && (
            <div className="card">
              <h2>Избранное</h2>

              {favoriteBoards.length === 0 ? (
                <p>Здесь пока нет избранных досок.</p>
              ) : (
                <ul>
                  {favoriteBoards.map((board) => (
                    <li key={board.id}>
                      <button onClick={() => handleOpenBoard(board.id)}>
                        {board.title}
                      </button>

                      <button
                        onClick={() => void toggleFavorite(board.id)}
                        title="Убрать из избранного"
                      >
                        ★
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activePage === "archive" && (
            <div className="card">
              <h2>Архив проектов</h2>

              {archivedProjects.length === 0 ? (
                <p>В архиве пока нет проектов.</p>
              ) : (
                <ul>
                  {archivedProjects.map((project) => (
                    <li key={project.id}>
                      <strong>{project.title}</strong>

                      {project.description && (
                        <p>{project.description}</p>
                      )}

                      <button
                        onClick={() => void archiveProject(project.id)}
                      >
                        Восстановить
                      </button>

                      <button
                        onClick={() =>
                          void handleDeleteArchivedProject(
                            project.id,
                            project.title
                          )
                        }
                      >
                        Удалить навсегда
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activePage === "team" && (
            <div className="card">
              <h2>Команда</h2>
              <p>Здесь будет управление участниками команды.</p>
            </div>
          )}

          {activePage === "settings" && (
            <div className="card">
              <h2>Настройки</h2>
              <p>Здесь будут настройки приложения.</p>
            </div>
          )}

          {activePage === "profile" && (
            <div className="card profile-page">
              <h2>Профиль пользователя</h2>
              <div className="profile-page-avatar">U</div>
              <p>Пользователь</p>
              <p>Личный аккаунт Hydra</p>
            </div>
          )}

          {isProjectSettingsPage && !settingsProject && (
            <div className="card">
              <h2>Проект не найден</h2>
              <button onClick={() => setActivePage("boards")}>
                Вернуться к моим доскам
              </button>
            </div>
          )}
        </div>
      </main>

      {isProjectSettingsPage && settingsProject && (
        <ProjectSettingsModal
          project={settingsProject}
          onSave={handleSaveProject}
          onClose={() =>
            setActivePage(`project:${settingsProject.id}`)
          }
        />
      )}
    </div>
  );
}

export default App;
