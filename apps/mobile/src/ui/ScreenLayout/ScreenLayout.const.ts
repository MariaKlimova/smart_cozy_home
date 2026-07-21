import { spacing } from '@/theme/tokens';

/** Локальные константы блока */
export const SCREEN_LAYOUT = 'ScreenLayout' as const;

/**
 * Зазор между фокусным полем и клавиатурой (KeyboardAwareScrollView.bottomOffset).
 * xl (32) — заметный «воздух», поле не липнет к клавиатуре.
 */
export const SCREEN_LAYOUT_KEYBOARD_GAP = spacing.xl;
