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
  SLEEP_NIGHT_DETAIL_SKELETON,
  SLEEP_NIGHT_DETAIL_SKELETON_PULSE_MAX,
  SLEEP_NIGHT_DETAIL_SKELETON_PULSE_MIN,
  SLEEP_NIGHT_DETAIL_SKELETON_PULSE_MS,
} from './SleepNightDetail-Skeleton.const';
import { styles } from './SleepNightDetail-Skeleton.styles';

function SkeletonBlock({ style }: { style: object }) {
  const c = useThemeColors();
  const opacity = useSharedValue(SLEEP_NIGHT_DETAIL_SKELETON_PULSE_MIN);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(SLEEP_NIGHT_DETAIL_SKELETON_PULSE_MAX, {
        duration: SLEEP_NIGHT_DETAIL_SKELETON_PULSE_MS,
      }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[style, animatedStyle, { backgroundColor: c.accentMuted }]}
      accessibilityLabel={copy.common.loadingA11y}
    />
  );
}

export function SleepNightDetailSkeleton() {
  return (
    <View style={styles.container} testID={SLEEP_NIGHT_DETAIL_SKELETON}>
      <SkeletonBlock style={styles.insight} />
      <SkeletonBlock style={styles.segmented} />
      <SkeletonBlock style={styles.chart} />
    </View>
  );
}
