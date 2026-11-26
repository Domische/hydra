import type { TLUiAssetUrlOverrides } from "tldraw";
import { tldrawConfig } from "./config";
import "./theme.css";

export { TOOL_IDS, tldrawConfig } from "./config";
export type { TldrawAppConfig, TldrawComponentName, TldrawToolId } from "./config";
export { tldrawComponents } from "./components";
export { tldrawOverrides } from "./overrides";
export { applyNoteTheme } from "./theme";

/** Пропсы для `<Tldraw />`, собранные из конфига. */
export const tldrawAssetUrls: TLUiAssetUrlOverrides = {
  icons: tldrawConfig.icons,
};
