import type { ReactNode } from 'react';

export interface ICalmSheetProps {
  /** Видимость sheet */
  visible: boolean;
  /** Заголовок */
  title: string;
  /** Подзаголовок под title */
  subtitle?: string;
  /** Закрыть sheet */
  onClose: () => void;
  /** Содержимое */
  children: ReactNode;
}
