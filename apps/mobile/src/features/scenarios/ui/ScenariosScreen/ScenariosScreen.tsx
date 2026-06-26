import { View } from 'react-native';

import { copy } from '@/copy/ru';
import { ScenarioCard } from '@/features/scenarios/ui/ScenarioCard';
import { CalmToast } from '@/ui/CalmToast';
import { ScreenLayout } from '@/ui/ScreenLayout';

import type { IScenariosScreenProps } from './ScenariosScreen.typings';
import { styles } from './ScenariosScreen.styles';

export function ScenariosScreen({
  scenarios,
  runStateById,
  activeScenarioId,
  preparedScenarioId,
  lastError,
  onScenarioPress,
  onSettingsPress,
  onDismissError,
}: IScenariosScreenProps) {
  const isAnyRunning = Object.values(runStateById).some((state) => state === 'running');

  return (
    <View style={styles.root}>
      <ScreenLayout title={copy.scenarios.sectionTitle}>
        <View style={styles.grid}>
          {scenarios.map((scenario) => (
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
      </ScreenLayout>

      <CalmToast
        visible={!!lastError}
        message={lastError ?? ''}
        onDismiss={onDismissError}
      />
    </View>
  );
}
