import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import {
  formatSleepNightIssueTexts,
  sleepIssueEmoji,
  sleepScoreLabel,
} from '@/features/sleep/lib/formatSleepNightSummary';
import { sleepScoreEmoji, sleepScoreTextColor } from '@/features/sleep/lib/sleepScorePresentation';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmSheet } from '@/ui/CalmSheet';
import { typography } from '@/theme/tokens';

import { SLEEP_NIGHT_DETAIL_SUMMARY_SHEET } from './SleepNightDetail-SummarySheet.const';
import type { ISleepNightDetailSummarySheetProps } from './SleepNightDetail-SummarySheet.typings';
import { styles } from './SleepNightDetail-SummarySheet.styles';

export function SleepNightDetailSummarySheet({
  visible,
  title,
  night,
  score,
  metrics,
  onClose,
}: ISleepNightDetailSummarySheetProps) {
  const c = useThemeColors();
  const issueTexts = formatSleepNightIssueTexts(night.issues);
  const hasIssues = issueTexts.length > 0;
  const hasMetrics = metrics.length > 0;
  const scoreSummary = sleepScoreLabel(score);

  return (
    <CalmSheet visible={visible} title={title} titleStyle={typography.title} onClose={onClose}>
      <View style={styles.sheetContent} testID={SLEEP_NIGHT_DETAIL_SUMMARY_SHEET}>
        <View style={styles.issueRow}>
          <Text style={styles.issueEmoji}>{sleepScoreEmoji(score)}</Text>
          <Text
            style={[
              typography.body,
              styles.issueText,
              styles.scoreSummary,
              { color: sleepScoreTextColor(score, c) },
            ]}
          >
            {scoreSummary}
          </Text>
        </View>

        {hasIssues ? (
          <View style={styles.section}>
            <View style={styles.issuesList}>
              {night.issues.map((issueKey, index) => (
                <View key={issueKey} style={styles.issueRow}>
                  <Text style={styles.issueEmoji}>{sleepIssueEmoji(issueKey)}</Text>
                  <Text style={[typography.body, styles.issueText, { color: c.text }]}>
                    {issueTexts[index]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {hasMetrics ? (
          <View style={styles.metricsList}>
            {metrics.map((metric) => (
              <View
                key={metric.label}
                style={[
                  styles.metricCard,
                  { backgroundColor: c.accentMuted, borderColor: c.border },
                ]}
              >
                <Text style={styles.metricEmoji}>{metric.emoji}</Text>
                <View style={styles.metricBody}>
                  <Text style={[typography.caption, { color: c.textMuted }]}>{metric.label}</Text>
                  <Text style={[typography.subtitle, styles.metricValue, { color: c.text }]}>
                    {metric.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {!hasIssues && !hasMetrics ? (
          <Text style={[typography.body, styles.empty, { color: c.textMuted }]}>
            {copy.sleep.nightSummarySheetEmpty}
          </Text>
        ) : null}
      </View>
    </CalmSheet>
  );
}
