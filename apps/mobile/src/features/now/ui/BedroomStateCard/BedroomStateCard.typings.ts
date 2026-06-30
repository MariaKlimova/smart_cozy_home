import type { IBedroomMetricView, IOutdoorMetricView, TBedroomStateTone } from '@/features/now/lib/interpretState';

/** Пропсы карточки состояния спальни */
export interface IBedroomStateCardProps {
  /** Фраза-интерпретация */
  phrase: string;
  /** Метрики датчиков спальни */
  bedroomMetrics: IBedroomMetricView[];
  /** Метрики внешних условий */
  outdoorMetrics: IOutdoorMetricView[];
  /** Визуальный тон (акцент, фон) */
  tone: TBedroomStateTone;
  /** Показать скелетон вместо контента */
  isLoading: boolean;
}
