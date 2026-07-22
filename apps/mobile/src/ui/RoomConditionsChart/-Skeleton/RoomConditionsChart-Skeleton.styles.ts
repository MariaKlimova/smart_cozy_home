import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme/tokens';

import { ROOM_CONDITIONS_CHART_SKELETON_CHART_HEIGHT } from './RoomConditionsChart-Skeleton.const';

export const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  insight: {
    height: 18,
    width: '85%',
    borderRadius: radii.sm,
  },
  segmented: {
    height: 40,
    borderRadius: radii.sm,
  },
  chart: {
    height: ROOM_CONDITIONS_CHART_SKELETON_CHART_HEIGHT,
    borderRadius: radii.sm,
  },
});
