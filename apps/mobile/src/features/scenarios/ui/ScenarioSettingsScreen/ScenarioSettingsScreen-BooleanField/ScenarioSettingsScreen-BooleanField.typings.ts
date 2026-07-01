export interface IScenarioSettingsScreenBooleanFieldProps {
  /** Подпись поля */
  label: string;
  /** Текущее значение */
  value: boolean;
  /** Неактивен */
  disabled: boolean;
  /** Обработчик изменения */
  onChange: (value: boolean) => Promise<boolean>;
}
