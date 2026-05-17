import { Text, View } from 'react-native';

import type { IHaEntityRowProps } from './HaEntityRow.typings';
import { styles } from './HaEntityRow.styles';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

export function HaEntityRow({ item }: IHaEntityRowProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.row, { borderBottomColor: c.border }]}>
      <Text style={[typography.subtitle, styles.friendlyName, { color: c.text }]} numberOfLines={1}>
        {item.friendlyName}
      </Text>
      <Text style={[typography.caption, styles.entityId, { color: c.textMuted }]} numberOfLines={1}>
        {item.entityId}
      </Text>
      <Text style={[typography.caption, styles.state, { color: c.accent }]}>{item.state}</Text>
    </View>
  );
}
