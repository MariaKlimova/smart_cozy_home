import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { RitualGrid } from '@/features/rituals/ui/RitualGrid';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { HOME_FEATURED_RITUAL_IDS } from './HomeRitualsSection.const';
import type { IHomeRitualsSectionProps } from './HomeRitualsSection.typings';
import { styles } from './HomeRitualsSection.styles';

export function HomeRitualsSection({ rituals, runningId, onRitualPress }: IHomeRitualsSectionProps) {
  const c = useThemeColors();
  const featured = rituals.filter((r) =>
    HOME_FEATURED_RITUAL_IDS.includes(r.id as (typeof HOME_FEATURED_RITUAL_IDS)[number]),
  );

  return (
    <View style={styles.root}>
      <Text style={[typography.subtitle, styles.title, { color: c.text }]}>
        {copy.rituals.sectionTitle}
      </Text>
      <RitualGrid rituals={featured} runningId={runningId} onRitualPress={onRitualPress} />
    </View>
  );
}
