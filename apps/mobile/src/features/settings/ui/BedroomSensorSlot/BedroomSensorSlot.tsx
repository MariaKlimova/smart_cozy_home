import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { CalmButton } from '@/ui/CalmButton';
import { CalmCard } from '@/ui/CalmCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import type { IBedroomSensorSlotProps } from './BedroomSensorSlot.typings';
import { styles } from './BedroomSensorSlot.styles';

export function BedroomSensorSlot({
  label,
  deviceName,
  preview,
  isUnset,
  isDisabled,
  onChange,
  onClear,
}: IBedroomSensorSlotProps) {
  const c = useThemeColors();
  const slotCopy = copy.settings.bedroomSensors;

  let statusText = deviceName;
  if (isUnset) {
    statusText = slotCopy.notSelected;
  } else if (isDisabled) {
    statusText = slotCopy.notUsed;
  }

  return (
    <CalmCard padding="md" style={styles.row}>
      <View style={styles.header}>
        <Text style={[typography.subtitle, { color: c.text }]}>{label}</Text>
        <Text
          style={[
            typography.body,
            styles.deviceName,
            { color: isUnset || isDisabled ? c.textMuted : c.text },
          ]}
          numberOfLines={2}
        >
          {statusText}
        </Text>
        {preview && !isUnset && !isDisabled ? (
          <Text style={[typography.title, styles.preview, { color: c.accent }]}>{preview}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <CalmButton
          label={slotCopy.change}
          variant="secondary"
          onPress={onChange}
          style={styles.actionBtn}
        />
        {!isUnset && !isDisabled ? (
          <CalmButton
            label={slotCopy.clear}
            variant="ghost"
            onPress={onClear}
            style={styles.actionBtn}
          />
        ) : null}
      </View>
    </CalmCard>
  );
}
