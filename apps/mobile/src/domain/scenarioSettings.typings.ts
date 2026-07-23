import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';
import type { TLightColorValue } from '@/domain/lightColor.typings';
import type { IScenarioWeeklySchedule } from '@/domain/scenarioWeeklySchedule.typings';

/** Числовой параметр сценария */
export interface IScenarioNumberSetting {
  /** Ключ поля, например brightness */
  key: string;
  /** Текущее значение */
  value: number;
  /** Минимум слайдера */
  min: number;
  /** Максимум слайдера */
  max: number;
  /** Шаг слайдера */
  step: number;
  /** Единица измерения для подписи */
  unit?: string;
  /** Entity доступна в HA */
  isAvailable: boolean;
}

/** Булевый параметр сценария */
export interface IScenarioBooleanSetting {
  /** Ключ поля, например curtains */
  key: string;
  /** Текущее значение */
  value: boolean;
  /** Entity доступна в HA */
  isAvailable: boolean;
}

/** Цветовой параметр сценария (ночник) */
export interface IScenarioColorSetting {
  /** Ключ поля, например nightlightColor */
  key: string;
  /** Текущий цвет в domain-форме */
  color: TLightColorValue;
  /** id активного пресета; undefined если список пуст */
  colorPresetId?: string;
  /** Пресеты из избранного ночника (или дефолтная палитра) */
  colorPresets: INightlightColorPreset[];
  /** Entity доступна в HA */
  isAvailable: boolean;
}

/** Текстовый параметр сценария (например плейлист) */
export interface IScenarioTextSetting {
  /** Ключ поля, например playlist */
  key: string;
  /** Текущее значение */
  value: string;
  /** Максимальная длина (лимит HA input_text) */
  maxLength: number;
  /** Entity доступна в HA */
  isAvailable: boolean;
}

/** Настройки одного сценария для UI */
export interface IScenarioSettings {
  /** id сценария */
  scenarioId: string;
  /** Числовые параметры */
  numbers: IScenarioNumberSetting[];
  /** Булевые параметры */
  booleans: IScenarioBooleanSetting[];
  /** Цветовые параметры */
  colors: IScenarioColorSetting[];
  /** Текстовые параметры */
  texts: IScenarioTextSetting[];
  /** Недельное расписание */
  schedule: IScenarioWeeklySchedule;
  /** Ключи полей, недоступных в HA */
  missingFieldKeys: string[];
}

/** Состояние расписания для подписи на карточке */
export interface IScenarioScheduleState {
  /** Включено ли расписание */
  enabled: boolean;
  /** Настройки по дням */
  weekdays: IScenarioWeeklySchedule['weekdays'];
}
