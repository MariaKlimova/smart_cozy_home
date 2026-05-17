import type { IGentleNotification } from '@/domain/types';
import { useHomeStore } from '@/store/homeStore';

interface IUseGentleNotificationsResult {
  /** Уведомления, не скрытые пользователем на любом табе */
  visibleNotifications: IGentleNotification[];
  /** Принять (включить свет) и скрыть в store */
  handleAccept: (notificationId: string) => Promise<void>;
  /** Скрыть без действия, общий для всех табов */
  handleDismiss: (notificationId: string) => void;
}

export function useGentleNotifications(): IUseGentleNotificationsResult {
  const gentleNotifications = useHomeStore((s) => s.gentleNotifications);
  const dismissedIds = useHomeStore((s) => s.dismissedGentleNotificationIds);
  const acceptGentleNotification = useHomeStore((s) => s.acceptGentleNotification);
  const dismissGentleNotification = useHomeStore((s) => s.dismissGentleNotification);

  const dismissedSet = new Set(dismissedIds);
  const visibleNotifications = gentleNotifications.filter((n) => !dismissedSet.has(n.id));

  async function handleAccept(notificationId: string) {
    await acceptGentleNotification(notificationId);
  }

  function handleDismiss(notificationId: string) {
    dismissGentleNotification(notificationId);
  }

  return { visibleNotifications, handleAccept, handleDismiss };
}
