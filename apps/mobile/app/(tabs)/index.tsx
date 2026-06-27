import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { GentleNotificationCard } from '@/features/notifications/ui/GentleNotificationCard';
import {
  formatBedroomMetrics,
  getBedroomStateTone,
  interpretBedroomState,
} from '@/features/now/lib/interpretState';
import { useBedroom } from '@/features/now/lib/useBedroom';
import { useQuickActions } from '@/features/now/lib/useQuickActions';
import { AdjustSheet } from '@/features/now/ui/AdjustSheet';
import { BedroomStateCard } from '@/features/now/ui/BedroomStateCard';
import { QuickActions } from '@/features/now/ui/QuickActions';
import { useGentleNotifications } from '@/hooks/useGentleNotifications';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { CalmButton } from '@/ui/CalmButton';
import { CalmToast } from '@/ui/CalmToast';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

export default function NowScreen() {
  const c = useThemeColors();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const {
    contextualScenarioId,
    isManualControlOpen,
    closeManualControl,
    openManualControl,
    lastError,
    clearError,
    showManualControlError,
    runStateById,
    activeScenarioId,
    preparedScenarioId,
    runScenarioById,
  } = useQuickActions();
  const { readings, isLoading: isBedroomLoading } = useBedroom();
  const hasSensorHydrated = useBedroomSensorStore((s) => s.hasHydrated);
  const isSensorsConfigured = useBedroomSensorStore((s) => s.isConfigured());

  const scenarios = useHomeStore((s) => s.scenarios);
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

  const handleSettingsPress = (scenarioId: string) => {
    router.push({ pathname: '/scenario-settings', params: { id: scenarioId } });
  };

  return (
    <View style={{ flex: 1 }}>
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

      {isConnected ? (
        <QuickActions
          scenarios={scenarios}
          contextualScenarioId={contextualScenarioId}
          runStateById={runStateById}
          activeScenarioId={activeScenarioId}
          preparedScenarioId={preparedScenarioId}
          onScenarioPress={runScenarioById}
          onSettingsPress={handleSettingsPress}
          onManualControlPress={openManualControl}
        />
      ) : null}

      {showSetupCta ? (
        <View>
          <Text style={[typography.body, { color: c.textMuted, marginBottom: 12 }]}>
            {copy.now.setupSensorsHint}
          </Text>
          <CalmButton
            label={copy.now.setupSensorsButton}
            variant="secondary"
            onPress={() => router.push({ pathname: '/bedroom', params: { tab: 'sensors' } })}
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
    </ScreenLayout>

    <AdjustSheet
      visible={isManualControlOpen}
      onClose={closeManualControl}
      onManualControlError={showManualControlError}
    />

    <CalmToast
      visible={!!lastError}
      message={lastError ?? ''}
      onDismiss={clearError}
    />
    </View>
  );
}
