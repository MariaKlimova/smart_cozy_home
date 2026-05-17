import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { copy } from '@/copy/ru';
import { TimelineList } from '@/features/timeline/ui/TimelineList';
import { GentleNotificationCard } from '@/features/notifications/ui/GentleNotificationCard';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { loadRitualsConfig } from '@/config/ritualsConfig';
import { toggleLight } from '@/ha/haClient';

export default function TimelineScreen() {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const profile = useConnectionStore((s) => s.profile);
  const timeline = useHomeStore((s) => s.timeline);
  const gentleNotifications = useHomeStore((s) => s.gentleNotifications);
  const refresh = useHomeStore((s) => s.refresh);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  const visible = gentleNotifications.filter((n) => !dismissed.includes(n.id));

  async function handleAccept(id: string) {
    const rule = loadRitualsConfig().gentle_notifications.find((n) => n.id === id);
    if (rule && baseUrl && profile) {
      await toggleLight(baseUrl, profile.accessToken, rule.light_entity, true);
      await refresh();
    }
    setDismissed((d) => [...d, id]);
  }

  return (
    <ScreenLayout
      title={copy.timeline.sectionTitle}
      onRefresh={isConnected ? refresh : undefined}
      isRefreshing={isRefreshing}
    >
      {visible.map((n) => (
        <GentleNotificationCard
          key={n.id}
          notification={n}
          onAccept={handleAccept}
          onDismiss={(id) => setDismissed((d) => [...d, id])}
        />
      ))}
      <View>
        <TimelineList events={timeline} />
      </View>
    </ScreenLayout>
  );
}
