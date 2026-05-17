import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { formatRelativeTime, humanizeTimelineEvent } from '@/copy/timeline';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { ITimelineListProps } from './TimelineList.typings';
import { styles } from './TimelineList.styles';

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
        <View key={event.id} style={[styles.row, { borderBottomColor: c.border }]}>
          <Text style={[typography.body, { color: c.text }]}>
            {humanizeTimelineEvent(event)}
          </Text>
          <Text style={[typography.caption, styles.time, { color: c.textMuted }]}>
            {formatRelativeTime(event.at)}
          </Text>
        </View>
      ))}
    </View>
  );
}
