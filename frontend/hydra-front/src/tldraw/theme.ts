import type { Editor } from "tldraw";

/**
 * Цвета заметок в tldraw живут не в CSS-токенах, а в JS-палитре темы.
 * В тёмной теме заливки приглушены (белая заметка — `#eaeaea`, то есть серая),
 * поэтому берём цвета заметок из светлой палитры. Остальные цвета фигур
 * остаются тёмными, чтобы линии и стрелки были видны на тёмном холсте.
 */
export function applyNoteTheme(editor: Editor) {
  editor.updateThemes((themes) => {
    const { light, dark } = themes.default.colors;

    for (const name of Object.keys(light) as (keyof typeof light)[]) {
      const lightColor = light[name];
      const darkColor = dark[name];

      if (typeof lightColor === "string" || typeof darkColor === "string") {
        continue;
      }

      darkColor.noteFill = lightColor.noteFill;
      darkColor.noteText = lightColor.noteText;
    }

    return themes;
  });
}
