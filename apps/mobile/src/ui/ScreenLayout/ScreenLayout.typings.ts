import type { ReactNode } from 'react';

export interface IScreenLayoutProps {
  /** Заголовок экрана (только для variant=tab) */
  title?: string;
  /** tab — без navigation header; stack — заголовок в navigation bar */
  variant?: 'tab' | 'stack';
  /** Содержимое */
  children: ReactNode;
  /** Поднимать контент над клавиатурой (формы, onboarding) */
  keyboardAware?: boolean;
  /** Показывать баннер статуса подключения */
  showConnectionBanner?: boolean;
}

export interface IScreenLayoutWithRefreshProps extends IScreenLayoutProps {
  /** Pull to refresh */
  onRefresh?: () => void;
  /** Идёт обновление */
  isRefreshing?: boolean;
}
