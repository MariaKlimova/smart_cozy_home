import {
  SLEEP_SCORE_CONSISTENCY_GOOD_MAX,
  SLEEP_SCORE_CONSISTENCY_POOR_MIN,
} from '@/health/sleepScore.const';
import {
  WEARABLE_SLEEP_NORM_MAX_MINUTES,
  WEARABLE_SLEEP_NORM_MIN_HOURS,
} from '@/health/wearableSleep.const';

export const SLEEP_NIGHT_DETAIL_SCORE_METHOD_SHEET = 'SleepNightDetail-ScoreMethodSheet';

/** Нижняя граница шкалы duration, мин */
export const DURATION_SCALE_MIN_MINUTES = 4 * 60;

/** Верхняя граница шкалы duration, мин */
export const DURATION_SCALE_MAX_MINUTES = 12 * 60;

/** Начало зоны нормы на шкале duration, мин */
export const DURATION_NORM_MIN_MINUTES = WEARABLE_SLEEP_NORM_MIN_HOURS * 60;

/** Конец зоны нормы на шкале duration, мин */
export const DURATION_NORM_MAX_MINUTES = WEARABLE_SLEEP_NORM_MAX_MINUTES;

/** Верхняя граница шкалы consistency (= poor min), мин */
export const CONSISTENCY_SCALE_MAX_MINUTES = SLEEP_SCORE_CONSISTENCY_POOR_MIN;

/** Порог «хорошо» на шкале consistency, мин */
export const CONSISTENCY_GOOD_MAX_MINUTES = SLEEP_SCORE_CONSISTENCY_GOOD_MAX;

/** Запас вокруг реального окна сна на графике, мин */
export const SLEEP_CHART_PADDING_MINUTES = 60;

/** Ширина колонки даты на графике ночей */
export const NIGHT_DATE_COLUMN_WIDTH = 52;
