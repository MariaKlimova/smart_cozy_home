import type { IScenarioTextSetting } from '@/domain/scenarioSettings.typings';

export interface IScenarioSettingsScreenTextFieldProps {
  /** Подпись поля */
  label: string;
  /** Подсказка под полем */
  hint?: string;
  /** Текущие настройки из HA */
  setting: IScenarioTextSetting;
  /** Идёт запись */
  isPending: boolean;
  /** Placeholder в инпуте */
  placeholder?: string;
  /** Сохранить значение (обычно on blur) */
  onComplete: (value: string) => Promise<boolean>;
}
