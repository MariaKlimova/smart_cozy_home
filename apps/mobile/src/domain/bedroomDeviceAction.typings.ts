import type { THaLightColorPayload } from '@/ha/entityRegistry';

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
  /** Payload цвета для light.turn_on */
  haColor: THaLightColorPayload;
}

/** Команда управления устройством спальни (domain id + значение) */
export type TBedroomDeviceAction =
  | IBedroomDeviceSliderAction
  | IBedroomDeviceToggleAction
  | IBedroomDeviceSegmentAction
  | IBedroomDeviceColorLightAction;
