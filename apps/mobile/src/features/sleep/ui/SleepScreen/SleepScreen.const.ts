import { spacing } from '@/theme/tokens';

/** testID экрана сна */
export const SLEEP_SCREEN = 'SleepScreen' as const;

/** Горизонтальный отступ контента (как у ScreenLayout) */
export const SLEEP_SCREEN_HORIZONTAL_PADDING = spacing.lg;

/** Зазор между страницами недель в горизонтальном скролле */
export const SLEEP_WEEK_PAGE_GAP = spacing.md;

/** Порог скорости свайпа влево для дозагрузки недели */
export const SLEEP_WEEK_SCROLL_LEFT_VELOCITY = -0.05;
