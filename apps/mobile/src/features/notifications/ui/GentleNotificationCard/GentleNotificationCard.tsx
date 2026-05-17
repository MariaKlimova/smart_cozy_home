import { StyleSheet, Text, View } from 'react-native';

import type { IGentleNotificationCardProps } from '@/features/notifications/ui/GentleNotificationCard/GentleNotificationCard.typings';
import { CalmButton } from '@/ui/CalmButton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

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
            label="Не сейчас"
            variant="ghost"
            onPress={() => onDismiss(notification.id)}
            style={styles.btn}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.md,
  },
  actions: { gap: spacing.sm },
  btn: { alignSelf: 'stretch' },
});
