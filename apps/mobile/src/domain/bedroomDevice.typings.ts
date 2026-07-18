import type { TLightColorValue } from '@/domain/lightColor.typings';

/** Тип контрола устройства в domain (без привязки к config) */
export type TBedroomDeviceControlKind = 'slider' | 'toggle' | 'segmented' | 'color_light';

/** Значение slider-устройства */
export interface IBedroomSliderValue {
  /** Текущее число */
  current: number;
  /** Единица, например % или °C */
  unit?: string;
  /**
   * Порог «свет виден с» (%) — только для основного света.
   * Логическая яркость пересчитывается в диапазон [visibleMin, 100] на железе.
   */
  visibleMin?: number;
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

/** Нормализованный избранный цвет ночника для UI */
export interface INightlightColorPreset {
  /** Стабильный id в рамках текущего списка */
  id: string;
  /** RGB для swatch в UI */
  displayRgb: [number, number, number];
  /** Нейтральный цвет пресета; в HA-форму переводится только в `src/ha/` */
  color: TLightColorValue;
}

/** Значение color_light (ночник) */
export interface IBedroomColorLightValue {
  /** Яркость 0–100; 0 = выкл */
  brightness: number;
  /** id активного пресета; undefined если не матчится */
  colorPresetId?: string;
  /** Список пресетов из HA favorites (или fallback) */
  colorPresets: INightlightColorPreset[];
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
  value?:
    | IBedroomSliderValue
    | IBedroomToggleValue
    | IBedroomSegmentedValue
    | IBedroomColorLightValue;
  /** Варианты segmented */
  segmentOptions?: IBedroomDeviceSegmentOption[];
  /** Границы slider */
  slider?: IBedroomDeviceSliderBounds;
}
