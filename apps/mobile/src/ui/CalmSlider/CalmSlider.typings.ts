import type { StyleProp, ViewStyle } from 'react-native';

export interface ICalmSliderProps {
  /** Текущее значение */
  value: number;
  /** Обработчик изменения */
  onValueChange: (value: number) => void;
  /** Минимум */
  minimumValue?: number;
  /** Максимум */
  maximumValue?: number;
  /** Шаг */
  step?: number;
  /** Подпись для screen reader (на нативном Slider) */
  accessibilityLabel?: string;
  /**
   * Единица для VoiceOver (множественное число), напр. «процентов».
   * Работает вместе с `accessibilityIncrements`.
   */
  accessibilityUnits?: string;
  /**
   * Подписи шагов для VoiceOver; длина должна соответствовать диапазону слайдера.
   */
  accessibilityIncrements?: string[];
  /** Неактивен */
  disabled?: boolean;
  /** Дополнительные стили обёртки */
  style?: StyleProp<ViewStyle>;
}
