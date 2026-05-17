import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { touchMin, typography } from '@/theme/tokens';

import { ROOM_LIST_LIGHT_ICON_SIZE } from './RoomList.const';
import type { IRoomListProps } from './RoomList.typings';
import { styles } from './RoomList.styles';

export function RoomList({ rooms, onToggleLight }: IRoomListProps) {
  const c = useThemeColors();

  return (
    <View style={styles.list}>
      {rooms.map((room) => (
        <View
          key={room.id}
          style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <View style={styles.info}>
            <Text style={[typography.subtitle, { color: c.text }]}>{room.label}</Text>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              {room.lightOn ? copy.rooms.lightOn : copy.rooms.lightOff}
              {room.temperature ? ` · ${room.temperature}` : ''}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={room.lightOn ? copy.rooms.lightOffA11y : copy.rooms.lightOnA11y}
            onPress={() => onToggleLight(room.id)}
            style={[styles.action, { minHeight: touchMin, minWidth: touchMin }]}
          >
            <FontAwesome
              name="lightbulb-o"
              size={ROOM_LIST_LIGHT_ICON_SIZE}
              color={room.lightOn ? c.accent : c.textMuted}
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
