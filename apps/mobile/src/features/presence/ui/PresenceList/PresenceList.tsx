import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IPresenceListProps } from './PresenceList.typings';
import { styles } from './PresenceList.styles';

export function PresenceList({ members }: IPresenceListProps) {
  const c = useThemeColors();
  const atHome = members.filter((m) => m.isHome);

  if (atHome.length === 0) {
    return (
      <Text style={[typography.body, { color: c.textMuted }]}>{copy.presence.empty}</Text>
    );
  }

  return (
    <View style={styles.list}>
      {atHome.map((m) => (
        <View
          key={m.id}
          style={[styles.chip, { backgroundColor: c.accentMuted, borderColor: c.border }]}
        >
          <Text style={[typography.subtitle, { color: c.text }]}>{m.label}</Text>
        </View>
      ))}
    </View>
  );
}
