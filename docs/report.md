# Отчёт: Организация воспроизводимого процесса совместной разработки

## 1. Структура репозитория

Monorepo `hydra/`:
- `frontend/` — SPA на React + TypeScript
- `backend/` — API на Go
- `docs/` — документация (scope, ADR)
- `.github/` — CI, шаблон PR
- `CONTRIBUTING.md` — правила разработки
- `README.md` — описание проекта

## 2. Ветвление и правила слияния

Ветки: `main`, `develop`, `feature/*`, `fix/*`, `docs/*`.

Правила:
- Только через Pull Request
- Минимум 1 approve
- CI должен проходить
- Squash merge для `feature/*` → `develop`
- Merge commit для `develop` → `main`

## 3. Форматирование и статический анализ

- `.editorconfig` — единый стиль
- Frontend: ESLint, Prettier, TypeScript
- Backend: go vet, gofmt
- CI (GitHub Actions): build, vet, test

## 4. Порядок рецензирования

1. Ветка от `develop`
2. Коммиты по Conventional Commits
3. PR в `develop` по шаблону
4. Ревьюер (минимум 1) проверяет
5. Approve → Squash merge → удалить ветку

## 5. Дополнительно

- SSH-ключ настроен
- CI работает (runs #7, #8 — success)

## Примечание

Защита веток настроена

Бэклог, спецификация и матрица трассируемости — зона PO.
На момент сдачи — в работе.

## Выводы

Организован воспроизводимый процесс:
- Единая структура
- Чёткое ветвление
- Автоматический контроль качества
- Прозрачное рецензирование