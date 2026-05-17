import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

export interface ICalmButtonProps extends Omit<PressableProps, 'style'> {
  /** Дополнительные стили */
  style?: StyleProp<ViewStyle>;
  /** Текст кнопки */
  label: string;
  /** Вариант оформления */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Загрузка */
  isLoading?: boolean;
}
