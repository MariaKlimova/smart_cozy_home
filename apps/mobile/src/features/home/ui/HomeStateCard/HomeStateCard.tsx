import { StyleSheet, Text, View } from 'react-native';

import { HomeStateCardHint } from '@/features/home/ui/HomeStateCard/HomeStateCard-Hint';
import type { IHomeStateCardProps } from '@/features/home/ui/HomeStateCard/HomeStateCard.typings';
import { MetricChip } from '@/ui/MetricChip';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

export function HomeStateCard({ homeState }: IHomeStateCardProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[typography.title, { color: c.text }]}>{homeState.title}</Text>
      <HomeStateCardHint text={homeState.hint} />
      <View style={styles.metrics}>
        {homeState.metrics.map((m) => (
          <MetricChip key={m.id} metric={m} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
