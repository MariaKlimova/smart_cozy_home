import { colors } from '@/theme/tokens';

/** Палитра темы (light / dark) */
type TThemeColors = (typeof colors)[keyof typeof colors];

/** Визуальный акцент сценария: активен, подготовлен или обычный */
export type TScenarioHighlightKind = 'active' | 'prepared' | 'idle';

export interface IScenarioHighlightColors {
  /** Фон карточки / баннера */
  backgroundColor: string;
  /** Цвет рамки */
  borderColor: string;
  /** Цвет иконки */
  iconColor: string;
}

/** Цвета рамки, фона и иконки для active / prepared / idle */
export function getScenarioHighlightColors(
  c: TThemeColors,
  kind: TScenarioHighlightKind,
): IScenarioHighlightColors {
  if (kind === 'active') {
    return {
      backgroundColor: c.accentMuted,
      borderColor: c.accent,
      iconColor: c.accent,
    };
  }
  if (kind === 'prepared') {
    return {
      backgroundColor: c.surface,
      borderColor: c.success,
      iconColor: c.success,
    };
  }
  return {
    backgroundColor: c.surface,
    borderColor: c.border,
    iconColor: c.accent,
  };
}
