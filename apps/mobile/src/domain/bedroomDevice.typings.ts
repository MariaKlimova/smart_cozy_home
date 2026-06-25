/** Тип контрола устройства в domain (без привязки к config) */
export type TBedroomDeviceControlKind = 'slider' | 'toggle' | 'segmented';

/** Значение slider-устройства */
export interface IBedroomSliderValue {
  /** Текущее число */
  current: number;
  /** Единица, например % или °C */
  unit?: string;
}

/** Значение toggle-устройства */
export interface IBedroomToggleValue {
  /** Включено */
  isOn: boolean;
}

/** Значение segmented-устройства */
export interface IBedroomSegmentedValue {
  /** id активной опции */
  activeOptionId: string;
}

/** Границы slider для UI */
export interface IBedroomDeviceSliderBounds {
  /** Минимум */
  min: number;
  /** Максимум */
  max: number;
  /** Шаг */
  step: number;
}

/** Опция segmented без HA-значений */
export interface IBedroomDeviceSegmentOption {
  /** id опции */
  id: string;
  /** Подпись для UI */
  label: string;
}

/** Состояние одного устройства спальни для UI */
export interface IBedroomDeviceState {
  /** Domain id: light, climate… */
  id: string;
  /** Название из config */
  label: string;
  /** Тип контрола */
  control: TBedroomDeviceControlKind;
  /** Доступно в HA */
  isAvailable: boolean;
  /** Текущее значение */
  value?: IBedroomSliderValue | IBedroomToggleValue | IBedroomSegmentedValue;
  /** Варианты segmented */
  segmentOptions?: IBedroomDeviceSegmentOption[];
  /** Границы slider */
  slider?: IBedroomDeviceSliderBounds;
}
