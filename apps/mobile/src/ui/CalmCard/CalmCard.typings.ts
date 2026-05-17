import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ICalmCardProps {
  /** Содержимое карточки */
  children: ReactNode;
  /** Дополнительные стили контейнера */
  style?: StyleProp<ViewStyle>;
  /** Внутренние отступы */
  padding?: 'md' | 'lg';
  /** Вариант оформления */
  variant?: 'elevated' | 'outline';
  /** Фон: surface или приглушённый акцент */
  tone?: 'default' | 'muted';
}
