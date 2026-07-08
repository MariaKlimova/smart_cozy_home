import type { TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';

/** Итоговая оценка качества среды за ночь */
export type TSleepNightScore = 'good' | 'fair' | 'poor' | 'no_data';

/** Ключ причины отклонения для copy.sleep.issues */
export type TSleepNightIssueKey = 'co2High' | 'tempHigh' | 'tempLow' | 'humidityLow';

/** Временное окно одной ночи */
export interface ISleepNightWindow {
  /** Дата начала ночи (вечер), YYYY-MM-DD */
  nightDate: string;
  /** День недели вечера */
  weekdayId: TWeekdayId;
  /** Начало ночи (вечерний сценарий или фоллбек) */
  startAt: Date;
  /** Конец ночи (утренний сценарий или фоллбек) */
  endAt: Date;
  /** Вечерний сценарий запускался — есть смысл оценивать ночь */
  hasScenarioData: boolean;
}

/** Одна точка показаний датчиков */
export interface ISleepSensorSample {
  /** Момент измерения */
  timestamp: Date;
  /** CO₂, ppm */
  co2Ppm?: number;
  /** Температура, °C */
  temperatureC?: number;
  /** Влажность, % */
  humidityPct?: number;
}

/** Сводка по одной ночи для UI */
export interface ISleepNightSummary {
  /** Окно ночи */
  window: ISleepNightWindow;
  /** Итоговая оценка */
  score: TSleepNightScore;
  /** Минимальный CO₂ за ночь, ppm */
  co2MinPpm?: number;
  /** Максимальный CO₂ за ночь, ppm */
  co2MaxPpm?: number;
  /** Средняя температура за ночь, °C */
  tempAvgC?: number;
  /** Средняя влажность за ночь, % */
  humidityAvgPct?: number;
  /** Ключи причин отклонений для copy */
  issues: TSleepNightIssueKey[];
  /** Есть показания датчиков за ночь */
  hasData: boolean;
}

/** Запись logbook для расчёта окон (идентификатор сценария — на границе mapper/config) */
export interface ISleepLogbookEntry {
  /** ISO-время события */
  when: string;
  /** Идентификатор сценария (вечерний/утренний) */
  scriptId?: string;
}
