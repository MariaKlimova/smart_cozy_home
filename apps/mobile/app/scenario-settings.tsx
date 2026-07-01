import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { getScenarioDefinition } from '@/config/scenarios';
import { copy } from '@/copy/ru';
import { useRunScenario } from '@/features/scenarios/lib/useRunScenario';
import { useScenarioSettings } from '@/features/scenarios/lib/useScenarioSettings';
import { ScenarioSettingsScreen } from '@/features/scenarios/ui/ScenarioSettingsScreen';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmToast } from '@/ui/CalmToast';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { typography } from '@/theme/tokens';

export default function ScenarioSettingsRoute() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenarioId = typeof id === 'string' ? id : '';
  const scenario = getScenarioDefinition(scenarioId);
  const title = scenario?.label ?? copy.scenarios.sectionTitle;

  const {
    settings,
    isLoading,
    isError,
    isRefreshing,
    pendingFieldKey,
    hasMissingFields,
    writeError,
    setNumber,
    setBoolean,
    setScheduleEnabled,
    setWeekdayEnabled,
    setWeekdayTime,
    refresh,
    dismissWriteError,
  } = useScenarioSettings(scenarioId);

  const { runStateById, runScenarioById } = useRunScenario();
  const runState = runStateById[scenarioId] ?? 'idle';

  const descriptions = copy.scenarios.descriptions as Record<string, string>;
  const description = descriptions[scenarioId] ?? '';

  if (!scenario) {
    return (
      <>
        <Stack.Screen options={{ title, headerBackTitle: copy.scenarios.sectionTitle }} />
        <ScreenLayout variant="stack">
          <View>
            <Text style={[typography.body, { color: c.textMuted }]}>{copy.scenarios.notFound}</Text>
          </View>
        </ScreenLayout>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title, headerBackTitle: copy.scenarios.sectionTitle }} />
      <ScenarioSettingsScreen
        scenarioId={scenarioId}
        title={title}
        description={description}
        settings={settings}
        isLoading={isLoading}
        isError={isError}
        isRefreshing={isRefreshing}
        pendingFieldKey={pendingFieldKey}
        hasMissingFields={hasMissingFields}
        runState={runState}
        onNumberChange={setNumber}
        onBooleanChange={setBoolean}
        onScheduleEnabledChange={setScheduleEnabled}
        onWeekdayEnabledChange={setWeekdayEnabled}
        onWeekdayTimeChange={setWeekdayTime}
        onRunNow={() => {
          void runScenarioById(scenarioId);
        }}
        onRefresh={() => {
          void refresh();
        }}
      />
      <CalmToast
        visible={!!writeError}
        message={writeError ?? ''}
        onDismiss={dismissWriteError}
      />
    </>
  );
}
