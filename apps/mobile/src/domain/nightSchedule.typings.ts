/** Пользовательские границы ночи (одна пара на все дни) */
export interface INightSchedule {
  /** Время засыпания HH:mm */
  bedtime: string;
  /** Время пробуждения HH:mm */
  wakeTime: string;
}
