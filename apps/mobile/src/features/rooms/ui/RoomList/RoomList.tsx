import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { CalmCard } from '@/ui/CalmCard';
import { CalmToggle } from '@/ui/CalmToggle';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IRoomListProps } from './RoomList.typings';
import { styles } from './RoomList.styles';

export function RoomList({ rooms, onToggleLight }: IRoomListProps) {
  const c = useThemeColors();

  return (
    <View style={styles.list}>
      {rooms.map((room) => (
        <CalmCard key={room.id} padding="md" style={styles.row}>
          <View style={styles.info}>
            <Text style={[typography.subtitle, { color: c.text }]}>{room.label}</Text>
            <Text style={[typography.caption, { color: c.textMuted }]}>
              {room.lightOn ? copy.rooms.lightOn : copy.rooms.lightOff}
              {room.temperature ? ` · ${room.temperature}` : ''}
            </Text>
          </View>
          <CalmToggle
            value={room.lightOn}
            onValueChange={() => onToggleLight(room.id)}
            accessibilityLabel={
              room.lightOn ? copy.rooms.lightOffA11y : copy.rooms.lightOnA11y
            }
          />
        </CalmCard>
      ))}
    </View>
  );
}
