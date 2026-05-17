import type { StyleProp, ViewStyle } from 'react-native';

export interface ICalmToggleProps {
  /** Включено */
  value: boolean;
  /** Обработчик переключения */
  onValueChange: (next: boolean) => void;
  /** Подпись для accessibility */
  accessibilityLabel?: string;
  /** Неактивен */
  disabled?: boolean;
  /** Дополнительные стили обёртки */
  style?: StyleProp<ViewStyle>;
}
