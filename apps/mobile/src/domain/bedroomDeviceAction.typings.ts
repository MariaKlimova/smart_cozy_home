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

/** Команда управления устройством спальни (domain id + значение) */
export type TBedroomDeviceAction =
  | IBedroomDeviceSliderAction
  | IBedroomDeviceToggleAction
  | IBedroomDeviceSegmentAction;
