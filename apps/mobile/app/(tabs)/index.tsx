import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { computeHomeState } from '@/domain/stateEngine';
import { HomeStateCard } from '@/features/home/ui/HomeStateCard';
import { GentleNotificationCard } from '@/features/notifications/ui/GentleNotificationCard';
import { RitualGrid } from '@/features/rituals/ui/RitualGrid';
import { runRitual } from '@/domain/ritualRunner';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';
import { loadRitualsConfig } from '@/config/ritualsConfig';
import { toggleLight } from '@/ha/haClient';

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
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const profile = useConnectionStore((s) => s.profile);

  const homeState = useHomeStore((s) => s.homeState);
  const rituals = useHomeStore((s) => s.rituals);
  const gentleNotifications = useHomeStore((s) => s.gentleNotifications);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const refresh = useHomeStore((s) => s.refresh);

  const [runningId, setRunningId] = useState<string>();
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  const displayState = homeState ?? DEMO_HOME;
  const visibleNotifications = gentleNotifications.filter((n) => !dismissed.includes(n.id));

  async function handleRitual(ritualId: string) {
    if (!baseUrl || !profile) return;
    setRunningId(ritualId);
    try {
      await runRitual(ritualId, baseUrl, profile.accessToken);
      await refresh();
    } finally {
      setRunningId(undefined);
    }
  }

  async function handleAcceptNotification(id: string) {
    const rule = loadRitualsConfig().gentle_notifications.find((n) => n.id === id);
    if (rule && baseUrl && profile) {
      await toggleLight(baseUrl, profile.accessToken, rule.light_entity, true);
      await refresh();
    }
    setDismissed((d) => [...d, id]);
  }

  return (
    <ScreenLayout title="Дом" onRefresh={isConnected ? refresh : undefined} isRefreshing={isRefreshing}>
      {!isConnected && (
        <Text style={[typography.caption, { color: c.warning }]}>{copy.connection.offline}</Text>
      )}

      <HomeStateCard homeState={displayState} />

      {visibleNotifications.map((n) => (
        <GentleNotificationCard
          key={n.id}
          notification={n}
          onAccept={handleAcceptNotification}
          onDismiss={(id) => setDismissed((d) => [...d, id])}
        />
      ))}

      <View>
        <Text style={[typography.subtitle, { color: c.text, marginBottom: 12 }]}>
          {copy.rituals.sectionTitle}
        </Text>
        <RitualGrid
          rituals={rituals.filter((r) => r.id === 'evening' || r.id === 'sleep')}
          runningId={runningId}
          onRitualPress={handleRitual}
        />
      </View>
    </ScreenLayout>
  );
}
