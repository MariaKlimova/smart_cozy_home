import type { StyleProp, ViewStyle } from 'react-native';

export interface ICalmTimePickerProps {
  /** Текущее время HH:mm */
  value: string;
  /** Обработчик выбора времени */
  onTimeChange: (time: string) => void;
  /** Подпись для accessibility */
  accessibilityLabel?: string;
  /** Неактивен */
  disabled?: boolean;
  /** Дополнительные стили */
  style?: StyleProp<ViewStyle>;
}
