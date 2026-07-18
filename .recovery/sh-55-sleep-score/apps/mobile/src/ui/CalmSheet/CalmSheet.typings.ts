import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

export interface ICalmSheetProps {
  /** Видимость sheet */
  visible: boolean;
  /** Заголовок; пустая строка — без title в шапке */
  title: string;
  /** Подзаголовок под title */
  subtitle?: string;
  /** Дополнительный стиль заголовка */
  titleStyle?: StyleProp<TextStyle>;
  /** Закрыть sheet */
  onClose: () => void;
  /** Содержимое */
  children: ReactNode;
}
