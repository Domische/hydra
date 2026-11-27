
import { useEffect, useState } from "react";
import type { PointerEvent } from "react";
import type { Board } from "../model/Board";
import { useLinkStore } from "../viewmodel/useLinkStore";
import "./ProjectMap.css";

interface ProjectMapProps {
  projectId: string;
  boards: Board[];
  onOpenBoard: (boardId: string) => void;
}

interface Position {
  x: number;
  y: number;
}

const CARD_WIDTH = 264;
const CARD_HEIGHT = 164;

function getSavedPositions(projectId: string): Record<string, Position> {
  try {
    const saved = localStorage.getItem(`project-map-${projectId}`);
    return saved ? JSON.parse(saved) as Record<string, Position> : {};
  } catch {
    return {};
  }
}

function getConnectionGeometry(
  source: Position,
  target: Position
) {
  const sourceCenter = {
    x: source.x + CARD_WIDTH / 2,
    y: source.y + CARD_HEIGHT / 2,
  };

  const targetCenter = {
    x: target.x + CARD_WIDTH / 2,
    y: target.y + CARD_HEIGHT / 2,
  };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let start: Position;
  let end: Position;
  let control1: Position;
  let control2: Position;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const direction = dx >= 0 ? 1 : -1;

    start = {
      x: sourceCenter.x + direction * CARD_WIDTH / 2,
      y: sourceCenter.y,
    };

    end = {
      x: targetCenter.x - direction * CARD_WIDTH / 2,
      y: targetCenter.y,
    };

    const curve = Math.max(65, Math.abs(dx) * 0.45);

    control1 = { x: start.x + direction * curve, y: start.y };
    control2 = { x: end.x - direction * curve, y: end.y };
  } else {
    const direction = dy >= 0 ? 1 : -1;

    start = {
      x: sourceCenter.x,
      y: sourceCenter.y + direction * CARD_HEIGHT / 2,
    };

    end = {
      x: targetCenter.x,
      y: targetCenter.y - direction * CARD_HEIGHT / 2,
    };

    const curve = Math.max(65, Math.abs(dy) * 0.45);

    control1 = { x: start.x, y: start.y + direction * curve };
    control2 = { x: end.x, y: end.y - direction * curve };
  }

  return {
    start,
    end,
    path: `M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`,
  };
}

export function ProjectMap({
  projectId,
  boards,
  onOpenBoard,
}: ProjectMapProps) {
  const links = useLinkStore((state) => state.links);
  const loadLinks = useLinkStore((state) => state.loadLinks);
  const addLink = useLinkStore((state) => state.addLink);
  const deleteLink = useLinkStore((state) => state.deleteLink);

  const [positions, setPositions] = useState<Record<string, Position>>(
    () => getSavedPositions(projectId)
  );

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [draggedBoardId, setDraggedBoardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [connectMode, setConnectMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "links">("links");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  useEffect(() => {
    setPositions(getSavedPositions(projectId));
    setSelectedBoardId(null);
    setDraggedBoardId(null);
    setConnectionStart(null);
    setConnectMode(false);
  }, [projectId]);

  useEffect(() => {
    setPositions((current) => {
      const next = { ...current };

      boards.forEach((board, index) => {
        if (!next[board.id]) {
          next[board.id] = {
            x: 90 + (index % 2) * 370,
            y: 70 + Math.floor(index / 2) * 250,
          };
        }
      });

      return next;
    });

    setSelectedBoardId((current) => {
      if (current && boards.some((board) => board.id === current)) {
        return current;
      }
      return boards[0]?.id ?? null;
    });
  }, [boards]);

  useEffect(() => {
    localStorage.setItem(
      `project-map-${projectId}`,
      JSON.stringify(positions)
    );
  }, [positions, projectId]);

  const projectBoardIds = new Set(boards.map((board) => board.id));

  const projectLinks = links.filter(
    (link) =>
      projectBoardIds.has(link.sourceBoardId) &&
      projectBoardIds.has(link.targetBoardId)
  );

  const selectedBoard = boards.find(
    (board) => board.id === selectedBoardId
  );

  const selectedLinks = projectLinks.filter(
    (link) =>
      link.sourceBoardId === selectedBoardId ||
      link.targetBoardId === selectedBoardId
  );

  const getOtherBoardId = (sourceBoardId: string, targetBoardId: string) =>
    sourceBoardId === selectedBoardId ? targetBoardId : sourceBoardId;

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>,
    boardId: string
  ) => {
    if (connectMode || event.button !== 0) return;

    const position = positions[boardId];
    const map = event.currentTarget.parentElement;

    if (!position || !map) return;

    const rect = map.getBoundingClientRect();

    setDraggedBoardId(boardId);
    setDragOffset({
      x: event.clientX - rect.left + map.scrollLeft - position.x,
      y: event.clientY - rect.top + map.scrollTop - position.y,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggedBoardId) return;

    const map = event.currentTarget;
    const rect = map.getBoundingClientRect();

    const x = Math.max(
      20,
      event.clientX - rect.left + map.scrollLeft - dragOffset.x
    );

    const y = Math.max(
      20,
      event.clientY - rect.top + map.scrollTop - dragOffset.y
    );

    setPositions((current) => ({
      ...current,
      [draggedBoardId]: { x, y },
    }));
  };

  const handlePointerUp = () => {
    setDraggedBoardId(null);
  };

  const handleCardClick = async (boardId: string) => {
    if (!connectMode) {
      setSelectedBoardId(boardId);
      setActiveTab("links");
      return;
    }

    if (!connectionStart) {
      setConnectionStart(boardId);
      setSelectedBoardId(boardId);
      setMessage("Теперь выбери доску, с которой нужно создать связь.");
      return;
    }

    if (connectionStart === boardId) {
      setConnectionStart(null);
      setMessage("Выбор отменён.");
      return;
    }

    await addLink(connectionStart, boardId);
    setConnectionStart(null);
    setConnectMode(false);
    setSelectedBoardId(boardId);
    setMessage("Связь между досками создана.");
  };

  const startConnection = () => {
    if (!selectedBoardId) return;

    setConnectMode(true);
    setConnectionStart(selectedBoardId);
    setMessage("Теперь выбери на карте вторую доску.");
  };

  const handleDeleteLink = async (id: string) => {
    if (!window.confirm("Удалить эту связь?")) return;
    await deleteLink(id);
  };

  return (
    <section className="project-map-wrapper">
      <div className="project-map-toolbar">
        <div>
          <h2>Карта проекта</h2>
          <p>Расположите доски и свяжите их между собой</p>
        </div>

        <button
          className={`project-map-connect ${connectMode ? "active" : ""}`}
          onClick={() => {
            if (connectMode) {
              setConnectMode(false);
              setConnectionStart(null);
              setMessage("");
            } else {
              startConnection();
            }
          }}
          disabled={!selectedBoard}
        >
          {connectMode ? "Отменить" : "↗ Добавить связь"}
        </button>
      </div>

      {message && (
        <div className="project-map-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="project-map-content">
        <div
          className="project-map"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <svg className="project-map-lines" width="3000" height="2000">
            <defs>
              <filter id="connection-glow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {projectLinks.map((link) => {
              const source = positions[link.sourceBoardId];
              const target = positions[link.targetBoardId];

              if (!source || !target) return null;

              const geometry = getConnectionGeometry(source, target);

              return (
                <g key={link.id}>
                  <path
                    d={geometry.path}
                    className="project-map-line-shadow"
                  />
                  <path
                    d={geometry.path}
                    className="project-map-line"
                    filter="url(#connection-glow)"
                  />
                  <circle
                    cx={geometry.start.x}
                    cy={geometry.start.y}
                    r="5"
                    className="project-map-connection-point"
                  />
                  <circle
                    cx={geometry.end.x}
                    cy={geometry.end.y}
                    r="5"
                    className="project-map-connection-point"
                  />
                  <path
                    d={geometry.path}
                    className="project-map-line-hitbox"
                    onClick={() => void handleDeleteLink(link.id)}
                  />
                </g>
              );
            })}
          </svg>

          {boards.map((board) => {
            const position = positions[board.id];
            if (!position) return null;

            const isSelected = selectedBoardId === board.id;
            const isConnectionStart = connectionStart === board.id;

            const boardLinkCount = projectLinks.filter(
              (link) =>
                link.sourceBoardId === board.id ||
                link.targetBoardId === board.id
            ).length;

            return (
              <div
                key={board.id}
                className={`project-map-card ${
                  isSelected ? "selected" : ""
                } ${draggedBoardId === board.id ? "dragging" : ""} ${
                  isConnectionStart ? "connection-selected" : ""
                } ${connectMode ? "connect-mode" : ""}`}
                style={{ left: position.x, top: position.y }}
                onPointerDown={(event) => handlePointerDown(event, board.id)}
                onClick={() => void handleCardClick(board.id)}
              >
                <div className="project-map-card-top">
                  <span className="project-map-card-icon">▦</span>
                  <h3>{board.title}</h3>
                  <span className="project-map-card-menu">•••</span>
                </div>

                <div className="project-map-card-preview">
                  <div className="project-map-preview-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="project-map-preview-bars">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="project-map-card-footer">
                  <span>{boardLinkCount} связей</span>
                  <button
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenBoard(board.id);
                    }}
                  >
                    Открыть доску ↗
                  </button>
                </div>
              </div>
            );
          })}

          {boards.length === 0 && (
            <div className="project-map-empty">
              <div>▦</div>
              <h3>Карта пока пуста</h3>
              <p>Создайте доску проекта, чтобы она появилась здесь.</p>
            </div>
          )}
        </div>

        <aside className="project-map-sidebar">
          {selectedBoard ? (
            <>
              <div className="project-map-sidebar-heading">
                <div className="project-map-sidebar-icon">▦</div>
                <h3>{selectedBoard.title}</h3>
                <button
                  onClick={() => setSelectedBoardId(null)}
                  aria-label="Закрыть панель"
                >
                  ×
                </button>
              </div>

              <div className="project-map-tabs">
                <button
                  className={activeTab === "properties" ? "active" : ""}
                  onClick={() => setActiveTab("properties")}
                >
                  Свойства
                </button>
                <button
                  className={activeTab === "links" ? "active" : ""}
                  onClick={() => setActiveTab("links")}
                >
                  Связи <span>{selectedLinks.length}</span>
                </button>
              </div>

              {activeTab === "properties" && (
                <div className="project-map-sidebar-body">
                  <div className="project-map-property">
                    <span>Название</span>
                    <strong>{selectedBoard.title}</strong>
                  </div>
                  <div className="project-map-property">
                    <span>Количество связей</span>
                    <strong>{selectedLinks.length}</strong>
                  </div>
                </div>
              )}

              {activeTab === "links" && (
                <div className="project-map-sidebar-body">
                  {selectedLinks.length === 0 ? (
                    <p className="project-map-no-links">
                      У этой доски пока нет связей.
                    </p>
                  ) : (
                    selectedLinks.map((link) => {
                      const otherId = getOtherBoardId(
                        link.sourceBoardId,
                        link.targetBoardId
                      );

                      const otherBoard = boards.find(
                        (board) => board.id === otherId
                      );

                      if (!otherBoard) return null;

                      return (
                        <div className="project-map-link-item" key={link.id}>
                          <button
                            className="project-map-link-name"
                            onClick={() => setSelectedBoardId(otherBoard.id)}
                          >
                            <span>▦</span>
                            {otherBoard.title}
                          </button>
                          <button
                            className="project-map-link-delete"
                            onClick={() => void handleDeleteLink(link.id)}
                            title="Удалить связь"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  )}

                  <button
                    className="project-map-add-link"
                    onClick={startConnection}
                  >
                    ↗ Добавить связь
                  </button>
                </div>
              )}

              <button
                className="project-map-open-selected"
                onClick={() => onOpenBoard(selectedBoard.id)}
              >
                Открыть доску
              </button>
            </>
          ) : (
            <div className="project-map-sidebar-placeholder">
              <p>Выбери доску на карте, чтобы посмотреть её свойства и связи.</p>
            </div>
          )}
        </aside>
      </div>

      <div className="project-map-hint">
        Перетаскивай доски мышью. Нажми на карточку, чтобы увидеть её связи.
      </div>
    </section>
  );
}
