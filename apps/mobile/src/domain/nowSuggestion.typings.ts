import type { INightSchedule } from '@/domain/nightSchedule.typings';

/** Тип primary action на табе «Сейчас» */
export type TNowSuggestionKind = 'scenario' | 'device' | 'none';

/** Предложение запустить сценарий */
export interface INowScenarioSuggestion {
  /** Тип — сценарий */
  kind: 'scenario';
  /** id сценария */
  scenarioId: string;
  /** Пояснение, опционально */
  message?: string;
}

/** Ключ текста в copy.now.suggestions */
export type TNowSuggestionCopyKey =
  | 'stuffyForSleepVentilate'
  | 'slightlyStuffyVentilate'
  | 'openWindow'
  | 'dryHumidifierOn'
  | 'turnOnHumidifier'
  | 'turnOnLight';

/** Предложение простого действия с устройством (до локализации copy) */
export interface INowDeviceSuggestionRaw {
  /** Тип — устройство */
  kind: 'device';
  /** id действия для обработчика */
  actionId: string;
  /** Ключ текста в copy.now.suggestions */
  messageKey?: TNowSuggestionCopyKey;
  /** Inline-текст (gentle notifications) */
  message?: string;
  /** Ключ подписи кнопки в copy.now.suggestions */
  actionLabelKey?: TNowSuggestionCopyKey;
  /** Inline-подпись кнопки */
  actionLabel?: string;
}

/** Предложение простого действия с устройством */
export interface INowDeviceSuggestion {
  /** Тип — устройство */
  kind: 'device';
  /** id действия для обработчика */
  actionId: string;
  /** Текст предложения */
  message: string;
  /** Подпись кнопки */
  actionLabel: string;
}

/** Нет primary action */
export interface INowEmptySuggestion {
  /** Тип — пусто */
  kind: 'none';
}

/** Primary action на табе «Сейчас» (до локализации copy) */
export type INowSuggestionRaw =
  | INowScenarioSuggestion
  | INowDeviceSuggestionRaw
  | INowEmptySuggestion;

/** Primary action на табе «Сейчас» */
export type INowSuggestion =
  | INowScenarioSuggestion
  | INowDeviceSuggestion
  | INowEmptySuggestion;

/** Показания спальни для подбора device-предложений */
export interface INowSuggestionBedroomReadings {
  /** CO₂, ppm */
  co2Ppm?: number;
  /** Влажность, % */
  humidityPct?: number;
}

/** Состояние устройства спальни для подбора предложений */
export interface INowSuggestionBedroomDevice {
  /** Domain id устройства */
  id: string;
  /** Доступно в HA */
  isAvailable: boolean;
  /** Тип контрола */
  control: 'slider' | 'toggle' | 'segmented';
  /** Включён toggle */
  isOn?: boolean;
  /** Активная опция segmented */
  activeOptionId?: string;
}

/** Мягкое уведомление для подбора предложений */
export interface INowSuggestionGentleNotification {
  /** id уведомления */
  id: string;
  /** Текст */
  message: string;
  /** Подпись действия */
  actionLabel?: string;
}

/** Вход resolveNowSuggestion */
export interface INowSuggestionInput {
  /** Текущий момент */
  now: Date;
  /** Границы ночи пользователя */
  nightSchedule: INightSchedule;
  /** Активный режим дома */
  activeScenarioId: string | null;
  /** Подготовленный сценарий */
  preparedScenarioId: string | null;
  /** Показания спальни */
  bedroomReadings: INowSuggestionBedroomReadings;
  /** Устройства спальни */
  bedroomDevices: INowSuggestionBedroomDevice[];
  /** Активные мягкие уведомления */
  gentleNotifications: INowSuggestionGentleNotification[];
  /** Скрытые id уведомлений */
  dismissedGentleNotificationIds: string[];
}
