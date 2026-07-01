/** День недели (понедельник — первый) */
export type TWeekdayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** Расписание на один день */
export interface IWeekdayScheduleEntry {
  /** Активен ли этот день */
  enabled: boolean;
  /** Время HH:mm */
  time: string;
}

/** Недельное расписание сценария */
export interface IScenarioWeeklyScheduleData {
  /** Мастер-переключатель расписания */
  enabled: boolean;
  /** Настройки по дням */
  weekdays: Record<TWeekdayId, IWeekdayScheduleEntry>;
}

/** Недельное расписание для UI (с метаданными HA) */
export interface IScenarioWeeklySchedule extends IScenarioWeeklyScheduleData {
  /** Helper input_text доступен в HA */
  isAvailable: boolean;
}

/** Ближайший запуск по расписанию */
export interface INextScheduleRun {
  /** Момент запуска */
  runAt: Date;
  /** День недели */
  weekdayId: TWeekdayId;
}
