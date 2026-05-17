import SliderBase from '@react-native-community/slider';
import type { SliderProps } from '@react-native-community/slider';
import type { FC } from 'react';
import { View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

import {
  CALM_SLIDER_DEFAULT_MAX,
  CALM_SLIDER_DEFAULT_MIN,
  CALM_SLIDER_DEFAULT_STEP,
} from './CalmSlider.const';
import type { ICalmSliderProps } from './CalmSlider.typings';
import { styles } from './CalmSlider.styles';

const Slider = SliderBase as unknown as FC<SliderProps>;

export function CalmSlider({
  value,
  onValueChange,
  minimumValue = CALM_SLIDER_DEFAULT_MIN,
  maximumValue = CALM_SLIDER_DEFAULT_MAX,
  step = CALM_SLIDER_DEFAULT_STEP,
  accessibilityLabel,
  disabled,
  style,
}: ICalmSliderProps) {
  const c = useThemeColors();

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
    >
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        disabled={disabled}
        minimumTrackTintColor={c.accent}
        maximumTrackTintColor={c.border}
        thumbTintColor={c.accent}
      />
    </View>
  );
}
