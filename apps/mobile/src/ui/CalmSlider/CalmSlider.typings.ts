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
  /** Подпись для accessibility */
  accessibilityLabel?: string;
  /** Неактивен */
  disabled?: boolean;
  /** Дополнительные стили обёртки */
  style?: StyleProp<ViewStyle>;
}
