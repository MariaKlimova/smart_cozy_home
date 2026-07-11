import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { ScenarioCard } from '@/features/scenarios/ui/ScenarioCard';
import { CalmButton } from '@/ui/CalmButton';
import { CalmCard } from '@/ui/CalmCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { NOW_HOME_SECTION } from './NowHomeSection.const';
import type { INowHomeSectionProps } from './NowHomeSection.typings';
import { styles } from './NowHomeSection.styles';

export function NowHomeSection({
  suggestion,
  scenarios,
  runStateById,
  activeScenarioId,
  preparedScenarioId,
  onScenarioPress,
  onSettingsPress,
  onManualControlPress,
  onDeviceActionPress,
  isDeviceActionRunning,
}: INowHomeSectionProps) {
  const c = useThemeColors();
  const isAnyRunning = Object.values(runStateById).some((state) => state === 'running');

  const scenarioSuggestion =
    suggestion.kind === 'scenario'
      ? scenarios.find((item) => item.id === suggestion.scenarioId)
      : undefined;

  return (
    <View style={styles.root} testID={NOW_HOME_SECTION}>
      {suggestion.kind === 'scenario' && scenarioSuggestion ? (
        <ScenarioCard
          scenario={scenarioSuggestion}
          runState={runStateById[scenarioSuggestion.id] ?? 'idle'}
          activeScenarioId={activeScenarioId}
          preparedScenarioId={preparedScenarioId}
          onPress={onScenarioPress}
          onSettingsPress={onSettingsPress}
          isAnyRunning={isAnyRunning}
          fullWidth
          showSchedule={false}
        />
      ) : null}

      {suggestion.kind === 'scenario' && !scenarioSuggestion ? (
        <CalmCard padding="md" tone="muted" style={styles.deviceCard}>
          <Text style={[typography.body, { color: c.textMuted }]}>
            {copy.now.scenarioUnavailable}
          </Text>
        </CalmCard>
      ) : null}

      {suggestion.kind === 'device' ? (
        <CalmCard padding="md" tone="muted" style={styles.deviceCard}>
          <Text style={[typography.body, { color: c.text }]}>{suggestion.message}</Text>
          <CalmButton
            label={suggestion.actionLabel}
            variant="primary"
            style={styles.button}
            onPress={() => void onDeviceActionPress()}
            disabled={isDeviceActionRunning}
          />
        </CalmCard>
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
