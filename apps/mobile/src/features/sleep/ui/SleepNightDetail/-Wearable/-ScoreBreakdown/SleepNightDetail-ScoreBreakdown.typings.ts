import type {
  ISleepScoreComponents,
  TSleepScoreExplainComponent,
} from '@/health/sleepScore.typings';

export interface ISleepNightDetailScoreBreakdownProps {
  /** Компоненты оценки выбранной ночи */
  components: ISleepScoreComponents;
  /** Cold start — consistency ещё собирается */
  isColdStart: boolean;
  /** Открыть штору с методикой */
  onExplainComponent?: (component: TSleepScoreExplainComponent) => void;
}
