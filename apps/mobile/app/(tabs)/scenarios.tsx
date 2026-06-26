import { router } from 'expo-router';

import { ScenariosScreen } from '@/features/scenarios/ui/ScenariosScreen';
import { useRunScenario } from '@/features/scenarios/lib/useRunScenario';
import { useHomeStore } from '@/store/homeStore';

export default function ScenariosTab() {
  const scenarios = useHomeStore((s) => s.scenarios);
  const { runStateById, activeScenarioId, preparedScenarioId, lastError, runScenarioById, clearError } =
    useRunScenario();

  const handleSettingsPress = (scenarioId: string) => {
    router.push({ pathname: '/scenario-settings', params: { id: scenarioId } });
  };

  return (
    <ScenariosScreen
      scenarios={scenarios}
      runStateById={runStateById}
      activeScenarioId={activeScenarioId}
      preparedScenarioId={preparedScenarioId}
      lastError={lastError}
      onScenarioPress={runScenarioById}
      onSettingsPress={handleSettingsPress}
      onDismissError={clearError}
    />
  );
}
