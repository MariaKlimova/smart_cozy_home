import type { TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';

/** Ключи pendingFieldKey для записей расписания (UI-занятость, не domain field key) */
export const SCHEDULE_FIELD_KEY = {
  /** Вкл/выкл всего расписания */
  enabled: 'scheduleEnabled',
  /** Вкл/выкл дня */
  weekday: (weekdayId: TWeekdayId) => `weekday-${weekdayId}`,
  /** Время дня */
  weekdayTime: (weekdayId: TWeekdayId) => `weekday-time-${weekdayId}`,
} as const;
