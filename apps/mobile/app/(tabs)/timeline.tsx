import { useEffect } from 'react';
import { View } from 'react-native';

import { copy } from '@/copy/ru';
import { TimelineList } from '@/features/timeline/ui/TimelineList';
import { GentleNotificationCard } from '@/features/notifications/ui/GentleNotificationCard';
import { useGentleNotifications } from '@/hooks/useGentleNotifications';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { ScreenLayout } from '@/ui/ScreenLayout';

export default function TimelineScreen() {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const timeline = useHomeStore((s) => s.timeline);
  const refresh = useHomeStore((s) => s.refresh);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const { visibleNotifications, handleAccept, handleDismiss } = useGentleNotifications();

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  return (
    <ScreenLayout
      title={copy.timeline.sectionTitle}
      onRefresh={isConnected ? refresh : undefined}
      isRefreshing={isRefreshing}
    >
      {visibleNotifications.map((n) => (
        <GentleNotificationCard
          key={n.id}
          notification={n}
          onAccept={handleAccept}
          onDismiss={handleDismiss}
        />
      ))}
      <View>
        <TimelineList events={timeline} />
      </View>
    </ScreenLayout>
  );
}
