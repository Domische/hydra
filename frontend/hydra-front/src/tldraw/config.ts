import type { TLUiComponents } from "tldraw";

/**
 * Единственное место, где настраивается встроенный интерфейс tldraw.
 *
 * Цвета вынесены в `theme.css` (там токены `--tl-color-*` привязаны
 * к переменным приложения), а здесь — поведение: какие инструменты
 * и компоненты показывать, какие иконки и тексты подменять.
 */

export const TOOL_IDS = [
  "select",
  "hand",
  "draw",
  "eraser",
  "arrow",
  "text",
  "note",
  "line",
  "highlight",
  "frame",
  "laser",
  "media",
  "embed",
] as const;

export type TldrawToolId = (typeof TOOL_IDS)[number];

export type TldrawComponentName = keyof TLUiComponents;

export interface TldrawAppConfig {
  /** Язык интерфейса tldraw. `undefined` — как в браузере. */
  locale?: string;
  /** Тема: приложение тёмное, поэтому по умолчанию `dark`. */
  colorScheme: "light" | "dark" | "system";
  /** Инструменты, которые нужно убрать из панели и горячих клавиш. */
  hiddenTools: TldrawToolId[];
  /** Компоненты интерфейса, которые нужно отключить (`null` в `components`). */
  hiddenComponents: TldrawComponentName[];
  /** Подмена иконок: `{ "tool-pencil": "/icons/pencil.svg" }` или data-URL. */
  icons: Record<string, string>;
  /** Подмена текстов: `{ ru: { "tool.select": "Указатель" } }`. */
  translations: Record<string, Record<string, string>>;
}

export const tldrawConfig: TldrawAppConfig = {
  locale: "ru",
  colorScheme: "dark",

  // Пример: убрать «Лазер» и встраивание контента.
  // hiddenTools: ["laser", "embed"],
  hiddenTools: [],

  // Совместная работа и отладка в приложении не используются.
  hiddenComponents: [
    "PeopleMenu",
    "PeopleMenuAvatar",
    "PeopleMenuItem",
    "PeopleMenuFacePile",
    "UserPresenceEditor",
    "FollowingIndicator",
    "CursorChatBubble",
    "DebugPanel",
    "DebugMenu",
  ],

  // Пример: свои иконки инструментов.
  // icons: { "tool-pencil": "/icons/pencil.svg" },
  icons: {},

  translations: {},
};
