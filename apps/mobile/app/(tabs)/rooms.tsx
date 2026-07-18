import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { isVisibleRoomId } from '@/config/visibleRooms';
import { connectionFailureMessageKey } from '@/domain/connectionStatus';
import { RoomList } from '@/features/rooms/ui/RoomList';
import { RoomsStatusHint } from '@/features/rooms/ui/RoomsStatusHint';
import { PresenceList } from '@/features/presence/ui/PresenceList';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { spacing, typography } from '@/theme/tokens';

export default function RoomsScreen() {
  const c = useThemeColors();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const failureReason = useConnectionStore((s) => s.failureReason);
  const rooms = useHomeStore((s) => s.rooms);
  const presence = useHomeStore((s) => s.presence);
  const refresh = useHomeStore((s) => s.refresh);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const lastError = useHomeStore((s) => s.syncDebug.lastError);
  const lastSyncAt = useHomeStore((s) => s.syncDebug.lastSyncAt);

  useEffect(() => {
    void refresh();
  }, [isConnected, refresh]);

  let statusHint: string | null = null;
  if (!isConnected) {
    statusHint = copy.rooms.offlineHint;
    if (failureReason) {
      const failureKey = connectionFailureMessageKey(failureReason);
      statusHint = `${statusHint} ${copy.connection[failureKey]}`;
    }
  } else if (lastError) {
    statusHint = copy.rooms.syncErrorHint;
  }

  return (
    <ScreenLayout
      title={copy.rooms.sectionTitle}
      onRefresh={refresh}
      isRefreshing={isRefreshing}
    >
      {statusHint ? (
        <RoomsStatusHint message={statusHint} lastSyncAt={lastSyncAt} />
      ) : null}
      <View>
        <Text style={[typography.subtitle, { color: c.text, marginBottom: spacing.md }]}>
          {copy.presence.sectionTitle}
        </Text>
        <PresenceList members={presence} />
      </View>
      <RoomList
        rooms={rooms}
        onOpenRoom={(id) => {
          if (isVisibleRoomId(id) && id === 'bedroom') {
            router.push('/bedroom');
          }
        }}
      />
    </ScreenLayout>
  );
}
