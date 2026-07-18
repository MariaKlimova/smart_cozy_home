import type { TLightColorValue } from '@/domain/lightColor.typings';

/** Действие slider-устройства */
export interface IBedroomDeviceSliderAction {
  /** Тип действия */
  kind: 'slider';
  /** Числовое значение (%, °C) */
  value: number;
}

/** Действие toggle-устройства */
export interface IBedroomDeviceToggleAction {
  /** Тип действия */
  kind: 'toggle';
  /** Включить */
  isOn: boolean;
}

/** Действие segmented-устройства */
export interface IBedroomDeviceSegmentAction {
  /** Тип действия */
  kind: 'segment';
  /** id выбранной опции */
  optionId: string;
}

/** Действие color_light (ночник): яркость + выбранный пресет цвета */
export interface IBedroomDeviceColorLightAction {
  /** Тип действия */
  kind: 'color_light';
  /** Яркость 0–100 */
  brightness: number;
  /** id пресета из списка favorites */
  colorPresetId: string;
  /** Нейтральный цвет пресета; в HA keys маппится в `src/ha/` / control */
  color: TLightColorValue;
}

/** Калибровка порога «свет виден с» для основного света */
export interface IBedroomDeviceVisibleMinAction {
  /** Тип действия */
  kind: 'visible_min';
  /** Порог видимости 0–99 */
  value: number;
}

/** Команда управления устройством спальни (domain id + значение) */
export type TBedroomDeviceAction =
  | IBedroomDeviceSliderAction
  | IBedroomDeviceToggleAction
  | IBedroomDeviceSegmentAction
  | IBedroomDeviceColorLightAction
  | IBedroomDeviceVisibleMinAction;
