import { StyleSheet, Text } from 'react-native';

import type { IHomeStateCardHintProps } from '@/features/home/ui/HomeStateCard/HomeStateCard-Hint/HomeStateCard-Hint.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

export function HomeStateCardHint({ text }: IHomeStateCardHintProps) {
  const c = useThemeColors();
  return (
    <Text style={[typography.body, styles.hint, { color: c.textMuted }]}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: spacing.sm,
  },
});
