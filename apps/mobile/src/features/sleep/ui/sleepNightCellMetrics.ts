import { spacing, touchMin, typography } from '@/theme/tokens';

const MARKER_LINE_HEIGHT = Math.ceil(typography.subtitle.fontSize * 1.3);
const LABEL_LINE_HEIGHT = Math.ceil(typography.caption.fontSize * 1.35);

/** Общие метрики ячейки ночи — SleepNightCell и скелетон */
export const sleepNightCellMetrics = {
  /** Минимальная высота */
  minHeight: touchMin,
  /** Вертикальные отступы */
  paddingVertical: spacing.sm,
  /** Горизонтальные отступы */
  paddingHorizontal: spacing.xs,
  /** Зазор между маркером и подписью */
  gap: spacing.xs,
  /** Высота строки маркера */
  markerLineHeight: MARKER_LINE_HEIGHT,
  /** Ширина плейсхолдера маркера */
  markerWidth: 12,
  /** Высота строки подписи дня */
  labelLineHeight: LABEL_LINE_HEIGHT,
  /** Ширина плейсхолдера подписи */
  labelWidth: 22,
} as const;

/** Итоговая высота ячейки с контентом */
export function getSleepNightCellHeight(): number {
  return (
    sleepNightCellMetrics.paddingVertical * 2
    + sleepNightCellMetrics.gap
    + sleepNightCellMetrics.markerLineHeight
    + sleepNightCellMetrics.labelLineHeight
  );
}
