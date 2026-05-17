import { StyleSheet, Text, View } from 'react-native';

import type { IHaEntityRowProps } from '@/features/settings/ui/HaEntityRow/HaEntityRow.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

export function HaEntityRow({ item }: IHaEntityRowProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.row, { borderBottomColor: c.border }]}>
      <Text style={[typography.subtitle, { color: c.text }]} numberOfLines={1}>
        {item.friendlyName}
      </Text>
      <Text style={[typography.caption, { color: c.textMuted, marginTop: 2 }]} numberOfLines={1}>
        {item.entityId}
      </Text>
      <Text style={[typography.caption, { color: c.accent, marginTop: 4 }]}>
        {item.state}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
