import type { IBedroomReadings } from './bedroomReadings.typings';
import { hasAnyBedroomReading } from './interpretState';

/** Входы для решения о CTA настройки датчиков на вкладке «Сейчас» */
export interface IShouldShowBedroomSensorSetupInput {
  /** Есть готовый бэкенд HA */
  haReady: boolean;
  /** Стор привязок датчиков загружен из storage */
  hasSensorHydrated: boolean;
  /** Идёт первая загрузка показаний спальни */
  isBedroomLoading: boolean;
  /** Текущие показания (пустой объект, если ещё нет данных) */
  readings: IBedroomReadings;
}

/**
 * Показывать ли подсказку «настрой датчики».
 * Ориентируемся на фактические показания, а не на факт сохранения overrides:
 * дефолты HOME_CONFIG могут уже отдавать данные без ручной настройки.
 */
export function shouldShowBedroomSensorSetupCta(
  input: IShouldShowBedroomSensorSetupInput,
): boolean {
  if (!input.haReady || !input.hasSensorHydrated || input.isBedroomLoading) {
    return false;
  }

  return !hasAnyBedroomReading(input.readings);
}
