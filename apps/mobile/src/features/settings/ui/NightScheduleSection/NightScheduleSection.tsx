import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmTimePicker } from '@/ui/CalmTimePicker';
import { typography } from '@/theme/tokens';

import { NIGHT_SCHEDULE_SECTION } from './NightScheduleSection.const';
import type { INightScheduleSectionProps } from './NightScheduleSection.typings';
import { styles } from './NightScheduleSection.styles';

export function NightScheduleSection({
  bedtime,
  wakeTime,
  onBedtimeChange,
  onWakeTimeChange,
}: INightScheduleSectionProps) {
  const c = useThemeColors();
  const labels = copy.settings.nightSchedule;

  return (
    <View
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
      testID={NIGHT_SCHEDULE_SECTION}
    >
      <Text style={[typography.subtitle, { color: c.text }]}>{labels.title}</Text>
      <Text style={[typography.caption, { color: c.textMuted }]}>{labels.hint}</Text>

      <View style={styles.row}>
        <Text style={[typography.body, styles.label, { color: c.text }]}>
          {labels.bedtimeLabel}
        </Text>
        <CalmTimePicker
          value={bedtime}
          onTimeChange={onBedtimeChange}
          accessibilityLabel={labels.bedtimeLabel}
        />
      </View>

      <View style={styles.row}>
        <Text style={[typography.body, styles.label, { color: c.text }]}>
          {labels.wakeTimeLabel}
        </Text>
        <CalmTimePicker
          value={wakeTime}
          onTimeChange={onWakeTimeChange}
          accessibilityLabel={labels.wakeTimeLabel}
        />
      </View>
    </View>
  );
}
