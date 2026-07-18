import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { LIGHT_VISIBLE_MIN_MAX } from '@/domain/lightBrightnessScale';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CalmSlider } from '@/ui/CalmSlider';
import { typography } from '@/theme/tokens';

import { styles } from './BedroomDeviceControls-VisibleMinSlider.styles';
import type { IBedroomDeviceControlsVisibleMinSliderProps } from './BedroomDeviceControls-VisibleMinSlider.typings';

export function BedroomDeviceControlsVisibleMinSlider({
  value,
  disabled,
  onValueChange,
  onSlidingComplete,
}: IBedroomDeviceControlsVisibleMinSliderProps) {
  const c = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[typography.caption, { color: c.textMuted }]}>
        {copy.bedroom.lightVisibleMinLabel}: {Math.round(value)} %
      </Text>
      <CalmSlider
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumValue={0}
        maximumValue={LIGHT_VISIBLE_MIN_MAX}
        step={1}
        disabled={disabled}
        accessibilityLabel={copy.bedroom.lightVisibleMinLabel}
      />
    </View>
  );
}
