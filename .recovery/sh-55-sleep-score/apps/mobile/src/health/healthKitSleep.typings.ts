/** Стадия сна из HealthKit */
export type TSleepWearableStage =
  | 'inBed'
  | 'awake'
  | 'asleepCore'
  | 'asleepDeep'
  | 'asleepREM'
  | 'asleepUnspecified';

/** Статус доступа к данным о сне с носимого */
export type TWearableSleepStatus = 'available' | 'denied' | 'unavailable' | 'no_data' | 'error';

/** Пресет мок-данных wearable для разработки */
export type TWearableMockPreset = 'default' | 'empty' | 'denied' | 'dualSource' | 'fragmented';

/** Уровень качества сна с трекера */
export type TWearableSleepQualityTier = 'excellent' | 'good' | 'fair' | 'poor';

/** Один интервал сна из HealthKit после маппинга */
export interface ISleepWearableSegment {
  /** Начало интервала */
  startAt: Date;
  /** Конец интервала */
  endAt: Date;
  /** Стадия */
  stage: TSleepWearableStage;
  /** Имя источника (Polar, Apple Watch, …) */
  sourceName: string;
  /** Bundle ID источника — для приоритета */
  sourceBundleId: string;
  /** Оценка из метаданных трекера, 0–100 */
  trackerSleepScore?: number;
}

/** Сводка по сну с носимого за ночь */
export interface ISleepWearableNightSummary {
  /** Время засыпания (первый asleep*) */
  fellAsleepAt?: Date;
  /** Время пробуждения (последний asleep* / конец inBed) */
  wokeAt?: Date;
  /** Длительность сна, мин */
  totalSleepMinutes?: number;
  /** Длительность по стадиям, мин */
  stageMinutes: Partial<Record<TSleepWearableStage, number>>;
  /** Доминирующий источник после дедупликации */
  primarySourceName?: string;
  /** Bundle ID доминирующего источника */
  primarySourceBundleId?: string;
  /** Оценка качества сна из метаданных трекера, 0–100 */
  sleepQualityScore?: number;
  /** Уровень качества для UI */
  sleepQualityTier?: TWearableSleepQualityTier;
}

/** Результат загрузки wearable-данных за ночное окно */
export interface IWearableSleepNightResult {
  /** Статус доступа */
  status: TWearableSleepStatus;
  /** Сводка, если status === 'available' */
  summary?: ISleepWearableNightSummary;
}
