
import { useState } from "react";
import type { Project } from "../model/Project";

interface ProjectSettingsModalProps {
  project: Project;
  onSave: (project: Project) => void;
  onClose: () => void;
}

export function ProjectSettingsModal({
  project,
  onSave,
  onClose,
}: ProjectSettingsModalProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      ...project,
      title: title.trim(),
      description: description.trim(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="project-modal-overlay" onClick={onClose}>
      <div
        className="project-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="project-modal-header">
          <h2>⚙ Настройки проекта</h2>

          <button
            className="project-modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="project-modal-body">
          <label className="project-form-label">
            Название проекта
          </label>

          <input
            className="project-form-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Введите название проекта"
            autoFocus
          />

          <label className="project-form-label">
            Описание
          </label>

          <textarea
            className="project-form-textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Расскажите о проекте..."
            rows={4}
          />
        </div>

        <div className="project-modal-footer">
          <button
            className="project-modal-cancel"
            onClick={onClose}
          >
            Отмена
          </button>

          <button
            className="project-modal-save"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
