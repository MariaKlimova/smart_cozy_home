import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/hooks/useThemeColors';
import { copy } from '@/copy/ru';

import {
  WEEK_GRID_SKELETON_PULSE_MAX,
  WEEK_GRID_SKELETON_PULSE_MIN,
  WEEK_GRID_SKELETON_PULSE_MS,
} from './WeekGrid-Skeleton.const';
import { styles } from './WeekGrid-Skeleton.styles';

function WeekGridSkeletonCell() {
  const c = useThemeColors();
  const opacity = useSharedValue(WEEK_GRID_SKELETON_PULSE_MIN);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(WEEK_GRID_SKELETON_PULSE_MAX, { duration: WEEK_GRID_SKELETON_PULSE_MS }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.cell,
        animatedStyle,
        { backgroundColor: c.accentMuted, borderColor: c.border, borderWidth: 1 },
      ]}
      accessibilityLabel={copy.common.loadingA11y}
    >
      <View style={[styles.marker, { backgroundColor: c.border }]} />
      <View style={[styles.label, { backgroundColor: c.border }]} />
    </Animated.View>
  );
}

export { WeekGridSkeletonCell };
