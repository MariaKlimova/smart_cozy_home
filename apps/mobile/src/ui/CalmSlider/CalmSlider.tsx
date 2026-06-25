import SliderBase from '@react-native-community/slider';
import type { SliderProps } from '@react-native-community/slider';
import type { ComponentType } from 'react';
import type { AccessibilityProps } from 'react-native';
import { View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

import {
  CALM_SLIDER_DEFAULT_MAX,
  CALM_SLIDER_DEFAULT_MIN,
  CALM_SLIDER_DEFAULT_STEP,
} from './CalmSlider.const';
import type { ICalmSliderProps } from './CalmSlider.typings';
import { styles } from './CalmSlider.styles';

type NativeSliderProps = SliderProps & Pick<AccessibilityProps, 'accessibilityLabel'>;

const Slider = SliderBase as unknown as ComponentType<NativeSliderProps>;

export function CalmSlider({
  value,
  onValueChange,
  onSlidingComplete,
  minimumValue = CALM_SLIDER_DEFAULT_MIN,
  maximumValue = CALM_SLIDER_DEFAULT_MAX,
  step = CALM_SLIDER_DEFAULT_STEP,
  accessibilityLabel,
  accessibilityUnits,
  accessibilityIncrements,
  disabled,
  style,
}: ICalmSliderProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.wrap, style]} accessible={false} importantForAccessibility="no">
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityUnits={accessibilityUnits}
        accessibilityIncrements={accessibilityIncrements}
        minimumTrackTintColor={c.accent}
        maximumTrackTintColor={c.border}
        thumbTintColor={c.accent}
      />
    </View>
  );
}
