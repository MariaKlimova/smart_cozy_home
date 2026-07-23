import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { copy } from '@/copy/ru';
import { useThemeColors } from '@/hooks/useThemeColors';

import {
  ROOM_CONDITIONS_CHART_SKELETON,
  ROOM_CONDITIONS_CHART_SKELETON_PULSE_MAX,
  ROOM_CONDITIONS_CHART_SKELETON_PULSE_MIN,
  ROOM_CONDITIONS_CHART_SKELETON_PULSE_MS,
} from './RoomConditionsChart-Skeleton.const';
import { styles } from './RoomConditionsChart-Skeleton.styles';
import type { IRoomConditionsChartSkeletonProps } from './RoomConditionsChart-Skeleton.typings';

function SkeletonBlock({ style }: { style: object }) {
  const c = useThemeColors();
  const opacity = useSharedValue(ROOM_CONDITIONS_CHART_SKELETON_PULSE_MIN);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(ROOM_CONDITIONS_CHART_SKELETON_PULSE_MAX, {
        duration: ROOM_CONDITIONS_CHART_SKELETON_PULSE_MS,
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

export function RoomConditionsChartSkeleton({ showInsight }: IRoomConditionsChartSkeletonProps) {
  return (
    <View style={styles.container} testID={ROOM_CONDITIONS_CHART_SKELETON}>
      {showInsight ? <SkeletonBlock style={styles.insight} /> : null}
      <SkeletonBlock style={styles.segmented} />
      <SkeletonBlock style={styles.chart} />
    </View>
  );
}
