import { StyleSheet, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import type { IPresenceListProps } from '@/features/presence/ui/PresenceList/PresenceList.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

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

const styles = StyleSheet.create({
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
});
