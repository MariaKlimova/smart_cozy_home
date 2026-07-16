import type { IScenarioColorSetting } from '@/domain/scenarioSettings.typings';
import type { TLightColorValue } from '@/domain/lightColor.typings';

export interface IScenarioSettingsScreenColorFieldProps {
  /** Подпись поля */
  label: string;
  /** Цветовая настройка */
  setting: IScenarioColorSetting;
  /** Идёт запись */
  isPending: boolean;
  /** Выбор цвета */
  onSelect: (color: TLightColorValue) => Promise<boolean>;
}
