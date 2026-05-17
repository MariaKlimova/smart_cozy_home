import type { IGentleNotification } from '@/domain/types';

export interface IGentleNotificationCardProps {
  /** Уведомление */
  notification: IGentleNotification;
  /** Принять предложение */
  onAccept?: (id: string) => void;
  /** Отклонить */
  onDismiss?: (id: string) => void;
}
