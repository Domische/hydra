
import { useState } from "react";
import type { Board } from "../model/Board";
import "./Topbar.css";

interface TopbarProps {
  title: string;
  boards: Board[];
  onOpenBoard: (boardId: string) => void;
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

export function Topbar({
  title,
  boards,
  onOpenBoard,
  onNavigate,
  onBack,
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchResults = boards
    .filter((board) =>
      board.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    .slice(0, 6);

  const handleOpenBoard = (boardId: string) => {
    onOpenBoard(boardId);
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <header className="topbar">
      <div className="topbar-title-group">
        {onBack && (
          <button
            className="topbar-back-button"
            onClick={onBack}
            title="Назад"
            aria-label="Назад"
          >
            ←
          </button>
        )}

        <div className="topbar-title">{title}</div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search-container">
          <label className="topbar-search">
            <span>⌕</span>
            <input
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchOpen(false);
                  setSearchQuery("");
                }

                if (event.key === "Enter" && searchResults.length > 0) {
                  handleOpenBoard(searchResults[0].id);
                }
              }}
              placeholder="Поиск по доскам"
              aria-label="Поиск по доскам"
            />
            <span className="topbar-search-shortcut">⌘K</span>
          </label>

          {searchOpen && (
            <div className="topbar-dropdown topbar-search-results">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => handleOpenBoard(board.id)}
                    >
                      <span>▤</span>
                      {board.title}
                    </button>
                  ))
                ) : (
                  <p>Доски не найдены</p>
                )
              ) : (
                <p>Начните вводить название доски</p>
              )}

              <button
                className="topbar-dropdown-close"
                onClick={() => setSearchOpen(false)}
              >
                Закрыть
              </button>
            </div>
          )}
        </div>

        <div className="topbar-menu-container">
          <button
            className="topbar-icon-button"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            aria-label="Уведомления"
            title="Уведомления"
          >
            ♧
            <span className="topbar-notification-dot" />
          </button>

          {notificationsOpen && (
            <div className="topbar-dropdown topbar-notifications">
              <strong>Уведомления</strong>
              <p>Новых уведомлений пока нет.</p>
            </div>
          )}
        </div>

        <div className="topbar-menu-container">
          <button
            className={`topbar-avatar ${profileOpen ? "active" : ""}`}
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            title="Профиль пользователя"
            aria-label="Открыть профиль"
          >
            U
          </button>

          {profileOpen && (
            <div className="topbar-dropdown topbar-profile-menu">
              <div className="topbar-profile-info">
                <div className="topbar-profile-avatar">U</div>
                <div>
                  <strong>Пользователь</strong>
                  <span>Личный аккаунт</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate("profile");
                  setProfileOpen(false);
                }}
              >
                ♙ Профиль
              </button>

              <button
                onClick={() => {
                  onNavigate("settings");
                  setProfileOpen(false);
                }}
              >
                ⚙ Настройки
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
