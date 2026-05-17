import { StyleSheet, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { formatRelativeTime, humanizeTimelineEvent } from '@/copy/timeline';
import type { ITimelineListProps } from '@/features/timeline/ui/TimelineList/TimelineList.typings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

export function TimelineList({ events }: ITimelineListProps) {
  const c = useThemeColors();

  if (events.length === 0) {
    return (
      <Text style={[typography.body, { color: c.textMuted }]}>{copy.timeline.empty}</Text>
    );
  }

  return (
    <View style={styles.list}>
      {events.map((event) => (
        <View
          key={event.id}
          style={[styles.row, { borderBottomColor: c.border }]}
        >
          <Text style={[typography.body, { color: c.text }]}>
            {humanizeTimelineEvent(event)}
          </Text>
          <Text style={[typography.caption, { color: c.textMuted, marginTop: 4 }]}>
            {formatRelativeTime(event.at)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
