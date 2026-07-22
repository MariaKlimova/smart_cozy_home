import { copy } from '@/copy/ru';
import type { TSleepMetricId } from '@/domain/sleepMetricNorms';

export const ROOM_CONDITIONS_CHART = 'RoomConditionsChart' as const;

/** Опции переключателя метрик */
export const ROOM_CONDITIONS_CHART_METRIC_OPTIONS: {
  /** id метрики */
  id: TSleepMetricId;
  /** Подпись вкладки */
  label: string;
}[] = [
  { id: 'co2', label: copy.sleep.metricTabs.co2 },
  { id: 'temperature', label: copy.sleep.metricTabs.temperature },
  { id: 'humidity', label: copy.sleep.metricTabs.humidity },
];
