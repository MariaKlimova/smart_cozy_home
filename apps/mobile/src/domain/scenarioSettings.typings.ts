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

/** Настройки одного сценария для UI */
export interface IScenarioSettings {
  /** id сценария */
  scenarioId: string;
  /** Числовые параметры */
  numbers: IScenarioNumberSetting[];
  /** Булевые параметры */
  booleans: IScenarioBooleanSetting[];
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
