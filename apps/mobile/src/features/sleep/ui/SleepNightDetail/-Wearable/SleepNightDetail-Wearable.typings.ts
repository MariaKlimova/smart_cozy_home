import type {
  ISleepWearableNightSummary,
  TWearableSleepStatus,
} from '@/health/healthKitSleep.typings';
import type {
  ISleepScoreMethodDetails,
  ISleepScoreResult,
  ISleepScoreTrend,
  TSleepScoreTrendDays,
} from '@/health/sleepScore.typings';

export interface ISleepNightDetailWearableProps {
  /** Статус истории wearable */
  status: TWearableSleepStatus | null;
  /** Сводка выбранной ночи (из кэша истории) */
  selectedSummary: ISleepWearableNightSummary | null;
  /** Оценка выбранной ночи */
  selectedNightScore: ISleepScoreResult | null;
  /** Детали методики для шторы */
  methodDetails: ISleepScoreMethodDetails | null;
  /** Тренд оценки сна */
  trend: ISleepScoreTrend | null;
  /** Окно тренда */
  trendDays: TSleepScoreTrendDays;
  /** Смена окна тренда */
  onTrendDaysChange: (days: TSleepScoreTrendDays) => void;
  /** Идёт загрузка */
  isLoading: boolean;
  /** Запросить доступ в настройках */
  onOpenSettings?: () => void;
}
