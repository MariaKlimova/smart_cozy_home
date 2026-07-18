import type {
  ISleepScoreMethodDetails,
  TSleepScoreExplainComponent,
} from '@/health/sleepScore.typings';

export interface ISleepNightDetailScoreMethodSheetProps {
  /** Видимость шторы */
  visible: boolean;
  /** Какой компонент объясняем */
  component: TSleepScoreExplainComponent | null;
  /** Детали методики */
  methodDetails: ISleepScoreMethodDetails | null;
  /** Закрыть */
  onClose: () => void;
}
