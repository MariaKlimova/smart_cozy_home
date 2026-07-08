import type { TSleepNightScore } from '@/domain/sleepNight.typings';
import { useThemeColors } from '@/hooks/useThemeColors';

type TThemeColors = ReturnType<typeof useThemeColors>;

/** Цвет текста оценки на фоне экрана */
export function sleepScoreTextColor(score: TSleepNightScore, c: TThemeColors): string {
  if (score === 'good') {
    return c.success;
  }
  if (score === 'fair') {
    return c.warning;
  }
  if (score === 'poor') {
    return c.danger;
  }
  return c.textMuted;
}

/** Спокойный эмодзи-префикс для итоговой оценки */
export function sleepScoreEmoji(score: TSleepNightScore): string {
  if (score === 'good') {
    return '🌿 ';
  }
  if (score === 'fair') {
    return '🌤 ';
  }
  if (score === 'poor') {
    return '💨 ';
  }
  return '';
}

/** Цвет ячейки по оценке ночи */
export function sleepScoreColor(score: TSleepNightScore, c: TThemeColors): string {
  if (score === 'good') {
    return c.success;
  }
  if (score === 'fair') {
    return c.warning;
  }
  if (score === 'poor') {
    return c.danger;
  }
  return c.border;
}
