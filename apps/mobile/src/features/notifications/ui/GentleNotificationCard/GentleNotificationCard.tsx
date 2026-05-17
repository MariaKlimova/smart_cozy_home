import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { CalmButton } from '@/ui/CalmButton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IGentleNotificationCardProps } from './GentleNotificationCard.typings';
import { styles } from './GentleNotificationCard.styles';

export function GentleNotificationCard({
  notification,
  onAccept,
  onDismiss,
}: IGentleNotificationCardProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: c.accentMuted, borderColor: c.border }]}>
      <Text style={[typography.body, { color: c.text }]}>{notification.message}</Text>
      <View style={styles.actions}>
        {notification.actionLabel && onAccept && (
          <CalmButton
            label={notification.actionLabel}
            variant="primary"
            onPress={() => onAccept(notification.id)}
            style={styles.btn}
          />
        )}
        {onDismiss && (
          <CalmButton
            label={copy.notifications.dismissLater}
            variant="ghost"
            onPress={() => onDismiss(notification.id)}
            style={styles.btn}
          />
        )}
      </View>
    </View>
  );
}
