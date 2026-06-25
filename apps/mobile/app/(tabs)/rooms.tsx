import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { isVisibleRoomId } from '@/config/visibleRooms';
import { RoomList } from '@/features/rooms/ui/RoomList';
import { PresenceList } from '@/features/presence/ui/PresenceList';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

export default function RoomsScreen() {
  const c = useThemeColors();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const rooms = useHomeStore((s) => s.rooms);
  const presence = useHomeStore((s) => s.presence);
  const refresh = useHomeStore((s) => s.refresh);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  return (
    <ScreenLayout
      title={copy.rooms.sectionTitle}
      onRefresh={isConnected ? refresh : undefined}
      isRefreshing={isRefreshing}
    >
      <View>
        <Text style={[typography.subtitle, { color: c.text, marginBottom: 12 }]}>
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
