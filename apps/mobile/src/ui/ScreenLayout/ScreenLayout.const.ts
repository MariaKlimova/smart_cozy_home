import { spacing } from '@/theme/tokens';

/** Локальные константы блока */
export const SCREEN_LAYOUT = 'ScreenLayout' as const;

/**
 * Зазор между фокусным полем / низом формы и клавиатурой.
 * 8–16pt — обычный диапазон; md даёт спокойный «воздух» без большого пустого поля.
 */
export const SCREEN_LAYOUT_KEYBOARD_GAP = spacing.md;
