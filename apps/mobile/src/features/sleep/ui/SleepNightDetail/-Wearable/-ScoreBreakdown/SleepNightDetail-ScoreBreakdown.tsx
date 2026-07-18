import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { TSleepScoreExplainComponent } from '@/health/sleepScore.typings';
import { typography } from '@/theme/tokens';

import { SLEEP_NIGHT_DETAIL_SCORE_BREAKDOWN } from './SleepNightDetail-ScoreBreakdown.const';
import type { ISleepNightDetailScoreBreakdownProps } from './SleepNightDetail-ScoreBreakdown.typings';
import { styles } from './SleepNightDetail-ScoreBreakdown.styles';

type TBreakdownRow = {
  key: string;
  label: string;
  value: number | null;
  collecting: boolean;
  explainComponent?: TSleepScoreExplainComponent;
};

export function SleepNightDetailScoreBreakdown({
  components,
  isColdStart,
  onExplainComponent,
}: ISleepNightDetailScoreBreakdownProps) {
  const c = useThemeColors();

  const rows: TBreakdownRow[] = [
    {
      key: 'duration',
      label: copy.sleep.wearableScoreDuration,
      value: components.duration,
      collecting: false,
      explainComponent: 'duration' as const,
    },
    {
      key: 'efficiency',
      label: copy.sleep.wearableScoreEfficiency,
      value: components.efficiency,
      collecting: false,
    },
    {
      key: 'continuity',
      label: copy.sleep.wearableScoreContinuity,
      value: components.continuity,
      collecting: false,
    },
    {
      key: 'consistency',
      label: copy.sleep.wearableScoreConsistency,
      value: components.consistency,
      collecting: isColdStart || components.consistency === null,
      explainComponent: 'consistency' as const,
    },
  ].filter((row) => {
    if (row.collecting) {
      return true;
    }
    return row.value !== null;
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.list} testID={SLEEP_NIGHT_DETAIL_SCORE_BREAKDOWN}>
      {rows.map((row) => {
        const canExplain =
          row.explainComponent !== undefined && onExplainComponent !== undefined;

        let valueContent = (
          <Text style={[typography.caption, styles.value, { color: c.text }]}>
            {copy.sleep.wearableScoreComponentValue.replace('{score}', String(row.value))}
          </Text>
        );

        if (row.collecting) {
          valueContent = (
            <View style={[styles.collectingBadge, { backgroundColor: c.accentMuted }]}>
              <Text style={[typography.caption, { color: c.textMuted }]}>
                {copy.sleep.wearableScoreCollecting}
              </Text>
            </View>
          );
        }

        const rowInner = (
          <>
            <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>
              {row.label}
            </Text>
            <View style={styles.valueRow}>
              {valueContent}
              {canExplain ? (
                <Feather name="info" size={14} color={c.textMuted} />
              ) : null}
            </View>
          </>
        );

        if (canExplain && row.explainComponent) {
          const explainComponent = row.explainComponent;
          return (
            <Pressable
              key={row.key}
              accessibilityRole="button"
              accessibilityLabel={copy.sleep.wearableScoreExplainA11y.replace(
                '{label}',
                row.label,
              )}
              onPress={() => onExplainComponent(explainComponent)}
              style={({ pressed }) => [
                styles.row,
                styles.rowPressable,
                pressed ? { opacity: 0.7 } : null,
              ]}
            >
              {rowInner}
            </Pressable>
          );
        }

        return (
          <View key={row.key} style={styles.row}>
            {rowInner}
          </View>
        );
      })}
    </View>
  );
}
