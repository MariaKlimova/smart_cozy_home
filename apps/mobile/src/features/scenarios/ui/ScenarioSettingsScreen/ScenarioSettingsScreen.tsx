import { ActivityIndicator, Text, View } from 'react-native';

import { getScenarioFieldDefinitions } from '@/config/scenarioSettingsFields';
import { copy } from '@/copy/ru';
import { getScenarioFieldLabel } from '@/features/scenarios/lib/scenarioFieldLabels';
import { ScenarioWeeklySchedule } from '@/features/scenarios/ui/ScenarioWeeklySchedule';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmButton } from '@/ui/CalmButton';
import { CalmCard } from '@/ui/CalmCard';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { spacing, typography } from '@/theme/tokens';

import { ScenarioSettingsScreenBooleanField } from './ScenarioSettingsScreen-BooleanField';
import { ScenarioSettingsScreenColorField } from './ScenarioSettingsScreen-ColorField';
import { ScenarioSettingsScreenNumberField } from './ScenarioSettingsScreen-NumberField';
import type { IScenarioSettingsScreenProps } from './ScenarioSettingsScreen.typings';
import { styles } from './ScenarioSettingsScreen.styles';

export function ScenarioSettingsScreen({
  scenarioId,
  description,
  settings,
  isLoading,
  isError,
  isRefreshing,
  pendingFieldKey,
  hasMissingFields,
  runState,
  onNumberChange,
  onBooleanChange,
  onColorChange,
  onScheduleEnabledChange,
  onWeekdayEnabledChange,
  onWeekdayTimeChange,
  onRunNow,
  onRefresh,
}: IScenarioSettingsScreenProps) {
  const c = useThemeColors();
  const fieldDefs = getScenarioFieldDefinitions(scenarioId);
  const isRunning = runState === 'running';

  return (
    <ScreenLayout variant="stack" onRefresh={onRefresh} isRefreshing={isRefreshing}>
      <Text style={[typography.body, styles.description, { color: c.textMuted }]}>
        {description}
      </Text>

      {hasMissingFields ? (
        <CalmCard padding="md" variant="outline" style={styles.banner} tone="muted">
          <Text style={[typography.subtitle, { color: c.text }]}>
            {copy.scenarios.missingHelper}
          </Text>
          <Text style={[typography.body, { color: c.textMuted, marginTop: spacing.xs }]}>
            {copy.scenarios.missingHelperHint}
          </Text>
        </CalmCard>
      ) : null}

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={c.accent} />
        </View>
      ) : null}

      {isError ? (
        <Text style={[typography.body, { color: c.warning }]}>{copy.connection.haUnavailable}</Text>
      ) : null}

      {settings ? (
        <>
          {fieldDefs.length > 0 ? (
            <View style={styles.section}>
              <Text style={[typography.subtitle, styles.sectionTitle, { color: c.text }]}>
                {copy.scenarios.paramsSectionTitle}
              </Text>
              {fieldDefs.map((field) => {
                if (field.kind === 'number') {
                  const numberSetting = settings.numbers.find((n) => n.key === field.key);
                  if (!numberSetting) return null;
                  return (
                    <ScenarioSettingsScreenNumberField
                      key={field.key}
                      label={getScenarioFieldLabel(field)}
                      setting={numberSetting}
                      isPending={pendingFieldKey === field.key}
                      onComplete={(value) => onNumberChange(field.key, value)}
                    />
                  );
                }

                if (field.kind === 'color') {
                  const colorSetting = settings.colors.find((item) => item.key === field.key);
                  if (!colorSetting) return null;
                  return (
                    <ScenarioSettingsScreenColorField
                      key={field.key}
                      label={getScenarioFieldLabel(field)}
                      setting={colorSetting}
                      isPending={pendingFieldKey === field.key}
                      onSelect={(color) => onColorChange(field.key, color)}
                    />
                  );
                }

                const booleanSetting = settings.booleans.find((b) => b.key === field.key);
                if (!booleanSetting) return null;
                return (
                  <ScenarioSettingsScreenBooleanField
                    key={field.key}
                    label={getScenarioFieldLabel(field)}
                    value={booleanSetting.value}
                    disabled={!booleanSetting.isAvailable || pendingFieldKey === field.key}
                    onChange={(value) => onBooleanChange(field.key, value)}
                  />
                );
              })}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[typography.subtitle, styles.sectionTitle, { color: c.text }]}>
              {copy.scenarios.scheduleSectionTitle}
            </Text>
            <ScenarioWeeklySchedule
              schedule={settings.schedule}
              pendingFieldKey={pendingFieldKey}
              onScheduleEnabledChange={onScheduleEnabledChange}
              onWeekdayEnabledChange={onWeekdayEnabledChange}
              onWeekdayTimeChange={onWeekdayTimeChange}
            />
          </View>

          <CalmButton
            label={copy.scenarios.runNow}
            isLoading={isRunning}
            disabled={isRunning}
            onPress={onRunNow}
            style={styles.runButton}
          />
        </>
      ) : null}
    </ScreenLayout>
  );
}
