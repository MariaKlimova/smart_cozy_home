import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConnectionStore } from '@/store/connectionStore';
import { CalmButton } from '@/ui/CalmButton';
import { CalmCard } from '@/ui/CalmCard';
import { typography } from '@/theme/tokens';

import { CONNECTION_BANNER } from './ConnectionBanner.const';
import { styles } from './ConnectionBanner.styles';

export function ConnectionBanner() {
  const c = useThemeColors();
  const { showBanner, message, canRetry, needsReconnect, status } = useConnectionStatus();
  const isLoading = useConnectionStore((s) => s.isLoading);
  const retry = useConnectionStore((s) => s.retry);

  if (!showBanner || !message) {
    return null;
  }

  const isChecking = status === 'connecting';

  return (
    <View testID={CONNECTION_BANNER}>
      <CalmCard tone="muted" padding="md" style={styles.root}>
        <Text style={[typography.body, styles.message, { color: c.textMuted }]}>{message}</Text>

        {canRetry || needsReconnect ? (
          <View style={styles.actions}>
            {canRetry ? (
              <CalmButton
                label={copy.connection.retryAction}
                variant="secondary"
                onPress={() => void retry()}
                isLoading={isLoading && !isChecking}
                disabled={isChecking}
              />
            ) : null}
            {needsReconnect ? (
              <CalmButton
                label={copy.connection.reconnectAction}
                variant="secondary"
                onPress={() => router.push('/(tabs)/settings')}
              />
            ) : null}
          </View>
        ) : null}
      </CalmCard>
    </View>
  );
}
