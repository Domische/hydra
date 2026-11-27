import type { TLComponents } from "tldraw";
import { tldrawConfig } from "./config";

function buildComponents(): TLComponents {
  const disabled: Record<string, null> = {};

  for (const name of tldrawConfig.hiddenComponents) {
    disabled[name] = null;
  }

  return disabled as unknown as TLComponents;
}

/**
 * Компоненты tldraw с учётом конфига.
 *
 * Свой компонент добавляется так:
 *
 * ```tsx
 * export const tldrawComponents: TLComponents = {
 *   ...buildComponents(),
 *   Toolbar: MyToolbar,
 * };
 * ```
 */
export const tldrawComponents = buildComponents();
