import { Text, View } from 'react-native';

import { HomeStateCardHint } from './HomeStateCard-Hint';
import { CalmCard } from '@/ui/CalmCard';
import { MetricChip } from '@/ui/MetricChip';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IHomeStateCardProps } from './HomeStateCard.typings';
import { styles } from './HomeStateCard.styles';

export function HomeStateCard({ homeState }: IHomeStateCardProps) {
  const c = useThemeColors();

  return (
    <CalmCard padding="lg">
      <Text style={[typography.title, { color: c.text }]}>{homeState.title}</Text>
      <HomeStateCardHint text={homeState.hint} />
      <View style={styles.metrics}>
        {homeState.metrics.map((m) => (
          <MetricChip key={m.id} metric={m} />
        ))}
      </View>
    </CalmCard>
  );
}
