import type { TLUiOverrides } from "tldraw";
import { tldrawConfig } from "./config";

/** Убирает из UI выключенные в конфиге инструменты. */
export const tldrawOverrides: TLUiOverrides = {
  tools(_editor, tools) {
    for (const toolId of tldrawConfig.hiddenTools) {
      delete tools[toolId];
    }

    return tools;
  },

  translations: tldrawConfig.translations,
};
