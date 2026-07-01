/** Настройка числового поля */
export interface IScenarioSettingsScreenNumberFieldSetting {
  /** Ключ поля */
  key: string;
  /** Текущее значение */
  value: number;
  /** Минимум слайдера */
  min: number;
  /** Максимум слайдера */
  max: number;
  /** Шаг слайдера */
  step: number;
  /** Единица измерения */
  unit?: string;
  /** Entity доступна в HA */
  isAvailable: boolean;
}

export interface IScenarioSettingsScreenNumberFieldProps {
  /** Подпись поля */
  label: string;
  /** Настройка из domain */
  setting: IScenarioSettingsScreenNumberFieldSetting;
  /** Идёт запись */
  isPending: boolean;
  /** Записать значение */
  onComplete: (value: number) => Promise<boolean>;
}
