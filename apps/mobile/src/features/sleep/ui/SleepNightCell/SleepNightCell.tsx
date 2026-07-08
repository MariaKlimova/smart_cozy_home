import { Pressable, Text } from 'react-native';

import { weekdayLabel } from '@/config/weekdayLabel';
import { copy } from '@/copy/ru';
import { sleepScoreColor } from '@/features/sleep/lib/sleepScorePresentation';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { SLEEP_NIGHT_CELL } from './SleepNightCell.const';
import type { ISleepNightCellProps } from './SleepNightCell.typings';
import { styles } from './SleepNightCell.styles';

export function SleepNightCell({ night, onPress, selected = false }: ISleepNightCellProps) {
  const c = useThemeColors();
  const backgroundColor = sleepScoreColor(night.score, c);
  const isNoData = night.score === 'no_data';
  const marker = isNoData ? copy.sleep.noDataCell : '●';
  const labelColor = isNoData ? c.textMuted : c.onAccent;
  const weekday = weekdayLabel(night.window.weekdayId);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={copy.sleep.nightCellA11y.replace('{weekday}', weekday)}
      onPress={() => onPress(night)}
      style={[
        styles.cell,
        { backgroundColor },
        selected ? { borderColor: c.text, borderWidth: 2 } : null,
      ]}
      testID={SLEEP_NIGHT_CELL}
    >
      <Text style={[typography.subtitle, styles.marker, { color: labelColor }]}>{marker}</Text>
      <Text style={[typography.caption, styles.label, { color: labelColor }]}>{weekday}</Text>
    </Pressable>
  );
}
