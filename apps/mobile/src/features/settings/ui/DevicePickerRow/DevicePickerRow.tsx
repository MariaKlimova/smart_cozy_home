import { Pressable, Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { formatDevicePreviewValue } from '@/features/settings/lib/devicePickerFilters';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IDevicePickerRowProps } from './DevicePickerRow.typings';
import { styles } from './DevicePickerRow.styles';

export function DevicePickerRow({ item, onPress }: IDevicePickerRowProps) {
  const c = useThemeColors();
  const isUnavailable = item.state === 'unavailable' || item.state === 'unknown';
  const preview = formatDevicePreviewValue(item.state);

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
    </Pressable>
  );
}
