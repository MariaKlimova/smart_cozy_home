import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import type { IRoomListProps } from '@/features/rooms/ui/RoomList/RoomList.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, touchMin, typography } from '@/theme/tokens';

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
            accessibilityLabel={room.lightOn ? 'Выключить свет' : 'Включить свет'}
            onPress={() => onToggleLight(room.id)}
            style={[styles.action, { minHeight: touchMin, minWidth: touchMin }]}
          >
            <FontAwesome
              name={room.lightOn ? 'lightbulb-o' : 'lightbulb-o'}
              size={22}
              color={room.lightOn ? c.accent : c.textMuted}
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
  },
  info: { flex: 1 },
  action: { alignItems: 'center', justifyContent: 'center' },
});
