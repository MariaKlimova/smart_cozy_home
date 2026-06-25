import type { TBedroomStateTone } from '@/features/now/lib/interpretState';
import type { colors } from '@/theme/tokens';

type TThemeColors = (typeof colors)[keyof typeof colors];

/** Цвет левой полоски по тону */
export function toneAccentColor(tone: TBedroomStateTone, c: TThemeColors): string {
  if (tone === 'neutral') return c.border;
  if (tone === 'air') return c.warning;
  if (tone === 'warm') return c.accent;
  if (tone === 'cool') return '#8BA4B8';
  if (tone === 'dry') return '#C9A86C';
  return c.success;
}

/** Фоновый оттенок карточки */
export function toneSurfaceColor(tone: TBedroomStateTone, c: TThemeColors): string {
  if (tone === 'neutral') return c.surface;
  if (tone === 'comfort' || tone === 'warm' || tone === 'dry') return c.accentMuted;
  return c.surface;
}

/** Декоративный эмодзи в углу */
export function toneWatermark(tone: TBedroomStateTone): string {
  if (tone === 'neutral') return '🛏';
  if (tone === 'air') return '🌬';
  if (tone === 'warm') return '🌡';
  if (tone === 'cool') return '❄️';
  if (tone === 'dry') return '💧';
  return '✨';
}
