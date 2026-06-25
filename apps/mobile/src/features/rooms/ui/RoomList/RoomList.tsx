import { Text, View, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { copy } from '@/copy/ru';
import { CalmCard } from '@/ui/CalmCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IRoomListProps } from './RoomList.typings';
import { styles } from './RoomList.styles';

export function RoomList({ rooms, onOpenRoom }: IRoomListProps) {
  const c = useThemeColors();

  return (
    <View style={styles.list}>
      {rooms.map((room) => (
        <Pressable
          key={room.id}
          accessibilityRole="button"
          accessibilityLabel={`${room.label}. ${copy.rooms.openRoomA11y}`}
          onPress={() => onOpenRoom(room.id)}
        >
          <CalmCard padding="md" style={styles.row}>
            <View style={styles.info}>
              <Text style={[typography.subtitle, { color: c.text }]}>{room.label}</Text>
              {room.temperature ? (
                <Text style={[typography.caption, { color: c.textMuted }]}>{room.temperature}</Text>
              ) : null}
            </View>
            <FontAwesome name="chevron-right" size={14} color={c.textMuted} />
          </CalmCard>
        </Pressable>
      ))}
    </View>
  );
}
