import { View } from 'react-native';

import { copy } from '@/copy/ru';
import { ScenarioCard } from '@/features/scenarios/ui/ScenarioCard';
import { CalmButton } from '@/ui/CalmButton';

import { QUICK_ACTIONS } from './QuickActions.const';
import type { IQuickActionsProps } from './QuickActions.typings';
import { styles } from './QuickActions.styles';

export function QuickActions({
  scenarios,
  contextualScenarioId,
  runStateById,
  activeScenarioId,
  preparedScenarioId,
  onScenarioPress,
  onSettingsPress,
  onManualControlPress,
}: IQuickActionsProps) {
  const contextualScenario = contextualScenarioId
    ? scenarios.find((scenario) => scenario.id === contextualScenarioId)
    : undefined;
  const isAnyRunning = Object.values(runStateById).some((state) => state === 'running');

  return (
    <View style={styles.root} testID={QUICK_ACTIONS}>
      {contextualScenario ? (
        <ScenarioCard
          scenario={contextualScenario}
          runState={runStateById[contextualScenario.id] ?? 'idle'}
          activeScenarioId={activeScenarioId}
          preparedScenarioId={preparedScenarioId}
          onPress={onScenarioPress}
          onSettingsPress={onSettingsPress}
          isAnyRunning={isAnyRunning}
          fullWidth
          showSchedule={false}
        />
      ) : null}

      <CalmButton
        label={copy.quickActions.manualControl}
        variant="secondary"
        style={styles.button}
        onPress={onManualControlPress}
      />
    </View>
  );
}
