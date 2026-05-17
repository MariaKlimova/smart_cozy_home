import type { ReactNode } from 'react';

export interface IScreenLayoutProps {
  /** Заголовок экрана */
  title: string;
  /** Содержимое */
  children: ReactNode;
  /** Поднимать контент над клавиатурой (формы, onboarding) */
  keyboardAware?: boolean;
}

export interface IScreenLayoutWithRefreshProps extends IScreenLayoutProps {
  /** Pull to refresh */
  onRefresh?: () => void;
  /** Идёт обновление */
  isRefreshing?: boolean;
}
