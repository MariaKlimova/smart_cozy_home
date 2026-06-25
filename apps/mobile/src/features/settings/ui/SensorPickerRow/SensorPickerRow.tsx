import { Pressable, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import {
  formatSensorPreviewValue,
  isNumericSensorState,
} from '@/features/settings/lib/sensorPickerFilters';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { ISensorPickerRowProps } from './SensorPickerRow.typings';
import { styles } from './SensorPickerRow.styles';

export function SensorPickerRow({ slot, item, onPress }: ISensorPickerRowProps) {
  const c = useThemeColors();
  const isUnavailable = item.state === 'unavailable' || item.state === 'unknown';
  const preview = formatSensorPreviewValue(slot, item.state);
  const showNonNumeric = !isUnavailable && !isNumericSensorState(item.state);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: c.border, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={[typography.subtitle, { color: c.text, flex: 1 }]} numberOfLines={2}>
          {item.friendlyName}
        </Text>
        <Text style={[styles.value, { color: c.accent }]}>{preview}</Text>
      </View>
      {isUnavailable ? (
        <View style={[styles.badge, { backgroundColor: c.accentMuted }]}>
          <Text style={[typography.caption, { color: c.warning }]}>
            {copy.bedroom.unavailable}
          </Text>
        </View>
      ) : null}
      {showNonNumeric ? (
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {copy.sensorPicker.nonNumericHint}
        </Text>
      ) : null}
    </Pressable>
  );
}
