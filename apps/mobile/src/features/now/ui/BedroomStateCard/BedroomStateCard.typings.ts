import type { IBedroomMetricView, TBedroomStateTone } from '@/features/now/lib/interpretState';

/** Пропсы карточки состояния спальни */
export interface IBedroomStateCardProps {
  /** Фраза-интерпретация */
  phrase: string;
  /** Метрики для чипов */
  metrics: IBedroomMetricView[];
  /** Визуальный тон (акцент, фон) */
  tone: TBedroomStateTone;
  /** Показать скелетон вместо контента */
  isLoading: boolean;
}
