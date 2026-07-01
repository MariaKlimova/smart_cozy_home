import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { WEEKDAY_IDS } from '@/domain/scenarioWeeklySchedule';
import type { IScenarioWeeklySchedule, TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';
import { isSchedulePendingKey } from '@/features/scenarios/lib/scenarioSettingsSchedule';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmCard } from '@/ui/CalmCard';
import { CalmTimePicker } from '@/ui/CalmTimePicker';
import { CalmToggle } from '@/ui/CalmToggle';
import { typography } from '@/theme/tokens';

import type { IScenarioWeeklyScheduleProps } from './ScenarioWeeklySchedule.typings';
import { styles } from './ScenarioWeeklySchedule.styles';

function weekdayLabel(weekdayId: TWeekdayId): string {
  const labels = copy.scenarios.weekdays as Record<TWeekdayId, string>;
  return labels[weekdayId] ?? weekdayId;
}

export function ScenarioWeeklySchedule({
  schedule,
  pendingFieldKey,
  onScheduleEnabledChange,
  onWeekdayEnabledChange,
  onWeekdayTimeChange,
}: IScenarioWeeklyScheduleProps) {
  const c = useThemeColors();
  const disabled = !schedule.isAvailable;
  const isScheduleBusy = isSchedulePendingKey(pendingFieldKey);
  const [localSchedule, setLocalSchedule] = useState<IScenarioWeeklySchedule>(schedule);

  useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  async function handleScheduleEnabledChange(enabled: boolean) {
    const previous = localSchedule;
    setLocalSchedule({ ...localSchedule, enabled });
    const applied = await onScheduleEnabledChange(enabled);
    if (!applied) {
      setLocalSchedule(previous);
    }
  }

  async function handleWeekdayEnabledChange(weekdayId: TWeekdayId, enabled: boolean) {
    const previous = localSchedule;
    setLocalSchedule({
      ...localSchedule,
      weekdays: {
        ...localSchedule.weekdays,
        [weekdayId]: { ...localSchedule.weekdays[weekdayId], enabled },
      },
    });
    const applied = await onWeekdayEnabledChange(weekdayId, enabled);
    if (!applied) {
      setLocalSchedule(previous);
    }
  }

  async function handleWeekdayTimeChange(weekdayId: TWeekdayId, time: string) {
    const previous = localSchedule;
    setLocalSchedule({
      ...localSchedule,
      weekdays: {
        ...localSchedule.weekdays,
        [weekdayId]: { ...localSchedule.weekdays[weekdayId], time },
      },
    });
    const applied = await onWeekdayTimeChange(weekdayId, time);
    if (!applied) {
      setLocalSchedule(previous);
    }
  }

  return (
    <CalmCard padding="md">
      <View style={styles.masterRow}>
        <Text style={[typography.body, { color: c.text }]}>
          {copy.scenarios.settingsFields.scheduleEnabled}
        </Text>
        <CalmToggle
          value={localSchedule.enabled}
          disabled={disabled || isScheduleBusy}
          accessibilityLabel={copy.scenarios.settingsFields.scheduleEnabled}
          onValueChange={handleScheduleEnabledChange}
        />
      </View>

      {localSchedule.enabled ? (
        <View style={styles.days}>
          {WEEKDAY_IDS.map((weekdayId) => {
            const entry = localSchedule.weekdays[weekdayId];
            const rowDisabled = disabled || isScheduleBusy;

            return (
              <View key={weekdayId} style={styles.dayRow}>
                <Text
                  style={[
                    typography.subtitle,
                    styles.dayLabel,
                    {
                      color: entry.enabled ? c.text : c.textMuted,
                      opacity: entry.enabled ? 1 : 0.55,
                    },
                  ]}
                >
                  {weekdayLabel(weekdayId)}
                </Text>
                <View style={styles.dayToggle}>
                  <CalmToggle
                    value={entry.enabled}
                    disabled={rowDisabled}
                    accessibilityLabel={`${weekdayLabel(weekdayId)} ${copy.scenarios.settingsFields.scheduleEnabled}`}
                    onValueChange={(enabled) => handleWeekdayEnabledChange(weekdayId, enabled)}
                  />
                </View>
                <View style={styles.dayTime}>
                  <CalmTimePicker
                    value={entry.time}
                    disabled={rowDisabled || !entry.enabled}
                    accessibilityLabel={`${weekdayLabel(weekdayId)} ${copy.scenarios.settingsFields.scheduleTime}`}
                    onTimeChange={(time) => handleWeekdayTimeChange(weekdayId, time)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </CalmCard>
  );
}
