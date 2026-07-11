/** Пропсы секции границ ночи в настройках */
export interface INightScheduleSectionProps {
  /** Текущее время засыпания HH:mm */
  bedtime: string;
  /** Текущее время пробуждения HH:mm */
  wakeTime: string;
  /** Изменение времени засыпания */
  onBedtimeChange: (time: string) => void;
  /** Изменение времени пробуждения */
  onWakeTimeChange: (time: string) => void;
}
