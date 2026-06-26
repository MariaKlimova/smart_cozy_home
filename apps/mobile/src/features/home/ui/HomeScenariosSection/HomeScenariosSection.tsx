import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { ScenarioCard } from '@/features/scenarios/ui/ScenarioCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { HOME_FEATURED_SCENARIO_IDS } from './HomeScenariosSection.const';
import type { IHomeScenariosSectionProps } from './HomeScenariosSection.typings';
import { styles } from './HomeScenariosSection.styles';

export function HomeScenariosSection({
  scenarios,
  runStateById,
  activeScenarioId,
  preparedScenarioId,
  onScenarioPress,
  onSettingsPress,
}: IHomeScenariosSectionProps) {
  const c = useThemeColors();
  const featured = scenarios.filter((s) =>
    HOME_FEATURED_SCENARIO_IDS.includes(s.id as (typeof HOME_FEATURED_SCENARIO_IDS)[number]),
  );
  const isAnyRunning = Object.values(runStateById).some((state) => state === 'running');

  return (
    <View style={styles.root}>
      <Text style={[typography.subtitle, styles.title, { color: c.text }]}>
        {copy.scenarios.sectionTitle}
      </Text>
      <View style={styles.grid}>
        {featured.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            runState={runStateById[scenario.id] ?? 'idle'}
            activeScenarioId={activeScenarioId}
            preparedScenarioId={preparedScenarioId}
            onPress={onScenarioPress}
            onSettingsPress={onSettingsPress}
            isAnyRunning={isAnyRunning}
          />
        ))}
      </View>
    </View>
  );
}
