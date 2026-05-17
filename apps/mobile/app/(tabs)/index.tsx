import { useEffect } from 'react';
import { Text } from 'react-native';

import { copy } from '@/copy/ru';
import { computeHomeState } from '@/domain/stateEngine';
import { HomeRitualsSection } from '@/features/home/ui/HomeRitualsSection';
import { HomeStateCard } from '@/features/home/ui/HomeStateCard';
import { GentleNotificationCard } from '@/features/notifications/ui/GentleNotificationCard';
import { useGentleNotifications } from '@/hooks/useGentleNotifications';
import { useRitualRunner } from '@/hooks/useRitualRunner';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

const DEMO_HOME = computeHomeState({
  hour: 20,
  presence: [{ id: 'maria', label: 'Мария', isHome: true }],
  temperature: '22°',
  lightsOnCount: 1,
  lightsTotal: 2,
  securityStatus: 'ok',
});

export default function HomeScreen() {
  const c = useThemeColors();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const { runningId, runRitualById } = useRitualRunner();

  const homeState = useHomeStore((s) => s.homeState);
  const rituals = useHomeStore((s) => s.rituals);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const refresh = useHomeStore((s) => s.refresh);
  const { visibleNotifications, handleAccept, handleDismiss } = useGentleNotifications();

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  const displayState = homeState ?? DEMO_HOME;

  return (
    <ScreenLayout
      title={copy.home.screenTitle}
      onRefresh={isConnected ? refresh : undefined}
      isRefreshing={isRefreshing}
    >
      {!isConnected && (
        <Text style={[typography.caption, { color: c.warning }]}>{copy.connection.offline}</Text>
      )}

      <HomeStateCard homeState={displayState} />

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
