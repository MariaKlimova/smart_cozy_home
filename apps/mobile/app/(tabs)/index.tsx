import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { HomeRitualsSection } from '@/features/home/ui/HomeRitualsSection';
import { GentleNotificationCard } from '@/features/notifications/ui/GentleNotificationCard';
import {
  formatBedroomMetrics,
  getBedroomStateTone,
  interpretBedroomState,
} from '@/features/now/lib/interpretState';
import { useBedroom } from '@/features/now/lib/useBedroom';
import { BedroomStateCard } from '@/features/now/ui/BedroomStateCard';
import { useGentleNotifications } from '@/hooks/useGentleNotifications';
import { useRitualRunner } from '@/hooks/useRitualRunner';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { CalmButton } from '@/ui/CalmButton';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

export default function NowScreen() {
  const c = useThemeColors();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const { runningId, runRitualById } = useRitualRunner();
  const { readings, isLoading: isBedroomLoading } = useBedroom();
  const hasSensorHydrated = useBedroomSensorStore((s) => s.hasHydrated);
  const isSensorsConfigured = useBedroomSensorStore((s) => s.isConfigured());

  const rituals = useHomeStore((s) => s.rituals);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const refresh = useHomeStore((s) => s.refresh);
  const { visibleNotifications, handleAccept, handleDismiss } = useGentleNotifications();

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  const resolvedReadings = readings ?? {};
  const phrase = interpretBedroomState(resolvedReadings);
  const metrics = formatBedroomMetrics(resolvedReadings);
  const tone = getBedroomStateTone(resolvedReadings);
  const showBedroomSkeleton = isConnected && isBedroomLoading;
  const showSetupCta = isConnected && hasSensorHydrated && !isSensorsConfigured;

  return (
    <ScreenLayout
      title={copy.now.screenTitle}
      onRefresh={isConnected ? refresh : undefined}
      isRefreshing={isRefreshing}
    >
      {!isConnected && (
        <Text style={[typography.caption, { color: c.warning }]}>{copy.connection.offline}</Text>
      )}

      <BedroomStateCard
        phrase={phrase}
        metrics={metrics}
        tone={tone}
        isLoading={showBedroomSkeleton}
      />

      {showSetupCta ? (
        <View>
          <Text style={[typography.body, { color: c.textMuted, marginBottom: 12 }]}>
            {copy.now.setupSensorsHint}
          </Text>
          <CalmButton
            label={copy.now.setupSensorsButton}
            variant="secondary"
            onPress={() => router.push('/bedroom-sensors')}
          />
        </View>
      ) : null}

      {visibleNotifications.map((n) => (
        <GentleNotificationCard
          key={n.id}
          notification={n}
          onAccept={handleAccept}
          onDismiss={handleDismiss}
        />
      ))}

      <HomeRitualsSection rituals={rituals} runningId={runningId} onRitualPress={runRitualById} />
    </ScreenLayout>
  );
}
