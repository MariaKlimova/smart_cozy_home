export interface ICalmToastProps {
  /** Текст уведомления */
  message: string;
  /** Видимость toast */
  visible: boolean;
  /** Закрыть по тапу или таймеру */
  onDismiss?: () => void;
}
