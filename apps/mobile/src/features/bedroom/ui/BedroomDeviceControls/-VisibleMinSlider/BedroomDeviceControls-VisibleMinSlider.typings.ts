export interface IBedroomDeviceControlsVisibleMinSliderProps {
  /** Текущее локальное значение порога */
  value: number;
  /** Слайдер недоступен */
  disabled: boolean;
  /** Изменение во время жеста */
  onValueChange: (value: number) => void;
  /** Отпускание; false — откатить */
  onSlidingComplete: (value: number) => void;
}
