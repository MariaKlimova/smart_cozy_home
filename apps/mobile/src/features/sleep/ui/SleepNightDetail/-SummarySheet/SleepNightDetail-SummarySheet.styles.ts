import { StyleSheet } from 'react-native';

import { radii, spacing, typography } from '@/theme/tokens';

const ISSUE_LINE_HEIGHT = Math.ceil(typography.body.fontSize * 1.4);
const METRIC_VALUE_LINE_HEIGHT = Math.ceil(typography.subtitle.fontSize * 1.2);

export const styles = StyleSheet.create({
  sheetContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scoreSummary: {
    fontStyle: 'italic',
    lineHeight: ISSUE_LINE_HEIGHT,
  },
  section: {
    gap: spacing.sm,
  },
  issuesList: {
    gap: spacing.sm,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  issueEmoji: {
    width: 24,
    lineHeight: ISSUE_LINE_HEIGHT,
    textAlign: 'center',
  },
  issueText: {
    flex: 1,
    lineHeight: ISSUE_LINE_HEIGHT,
  },
  metricsList: {
    gap: spacing.sm,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  metricEmoji: {
    width: 28,
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
  },
  metricBody: {
    flex: 1,
    gap: spacing.xs,
  },
  metricValue: {
    lineHeight: METRIC_VALUE_LINE_HEIGHT,
  },
  empty: {
    lineHeight: ISSUE_LINE_HEIGHT,
  },
});
