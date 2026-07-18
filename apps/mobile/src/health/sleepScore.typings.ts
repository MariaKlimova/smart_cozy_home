import type { TWearableSleepQualityTier } from '@/health/healthKitSleep.typings';

/** Возрастная группа для клинической кривой длительности */
export type TSleepScoreAgeBand = 'adult' | 'older';

/** Окно тренда оценки сна, дней */
export type TSleepScoreTrendDays = 7 | 30;

/** Компоненты оценки сна, 0–100; null — компонент недоступен */
export interface ISleepScoreComponents {
  /** Длительность (клиника + baseline) */
  duration: number | null;
  /** Эффективность (asleep / inBed) */
  efficiency: number | null;
  /** Непрерывность (WASO + пробуждения) */
  continuity: number | null;
  /** Стабильность отбоя/подъёма */
  consistency: number | null;
}

/** Результат расчёта оценки за одну ночь */
export interface ISleepScoreResult {
  /** Итоговый score 0–100 */
  score: number;
  /** Компоненты до взвешивания */
  components: ISleepScoreComponents;
  /** Нет baseline / consistency — cold start */
  isColdStart: boolean;
  /** TST сегодня или avg 7д ниже 7 ч */
  belowRecommendedNorm: boolean;
  /** Уровень для UI */
  tier: TWearableSleepQualityTier;
}

/** Вход одной ночи для формулы */
export interface ISleepScoreNightInput {
  /** Дата пробуждения YYYY-MM-DD */
  nightDate: string;
  /** TST, минуты */
  totalSleepMinutes: number;
  /** Время в кровати, минуты; undefined — efficiency пропустить */
  timeInBedMinutes?: number;
  /** Засыпание */
  fellAsleepAt?: Date;
  /** Подъём */
  wokeAt?: Date;
  /** WASO, минуты (awake + разрывы между asleep) */
  wasoMinutes: number;
  /** Число пробуждений */
  awakeningCount: number;
  /** Есть сигнал для continuity (awake или разрывы) */
  continuityHasSignal: boolean;
}

/** Агрегированный тренд за окно */
export interface ISleepScoreTrend {
  /** Средний score, округлённый */
  score: number;
  /** Средние компоненты (null если ни у одной ночи не было) */
  components: ISleepScoreComponents;
  /** Уровень по среднему score */
  tier: TWearableSleepQualityTier;
  /** Cold start по истории (меньше 7 ночей) */
  isColdStart: boolean;
  /** Флаг ниже нормы по последней ночи / rolling 7d */
  belowRecommendedNorm: boolean;
  /** Сколько ночей с данными вошло в среднее */
  nightCount: number;
  /** Окно тренда */
  trendDays: TSleepScoreTrendDays;
}

/** Компонент, для которого открываем методику */
export type TSleepScoreExplainComponent = 'duration' | 'consistency';

/** Детали методики длительности */
export interface ISleepScoreDurationMethod {
  /** TST этой ночи, мин */
  tstMinutes: number;
  /** Клинический скор до baseline */
  clinicalScore: number;
  /** Медиана TST за 7 ночей */
  baselineMinutes?: number;
  /** Бонус baseline 0 / 5 / 10 */
  baselineModifier: number;
  /** Baseline применён */
  appliedBaseline: boolean;
  /** Итоговый duration score */
  durationScore: number;
}

/** Одна ночь в окне стабильности */
export interface ISleepScoreConsistencyNightRow {
  /** Дата пробуждения */
  nightDate: string;
  /** Засыпание */
  fellAsleepAt?: Date;
  /** Подъём */
  wokeAt?: Date;
}

/** Детали методики стабильности */
export interface ISleepScoreConsistencyMethod {
  /** Ещё собираем 7 ночей */
  isCollecting: boolean;
  /** Сколько ночей в окне */
  nightCount: number;
  /** Stddev отбоя, мин */
  bedtimeStdMinutes?: number;
  /** Stddev подъёма, мин */
  wakeStdMinutes?: number;
  /** Средний разброс, мин */
  avgStdMinutes?: number;
  /** Итоговый consistency score */
  consistencyScore: number | null;
  /** Ночи окна */
  nights: ISleepScoreConsistencyNightRow[];
}

/** Пакет деталей методики для шторы */
export interface ISleepScoreMethodDetails {
  /** Длительность */
  duration: ISleepScoreDurationMethod;
  /** Стабильность */
  consistency: ISleepScoreConsistencyMethod;
}
