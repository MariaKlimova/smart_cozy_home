import { Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { WeekGridSkeletonCell } from './WeekGrid-SkeletonCell';
import { WEEK_GRID_SKELETON, WEEK_GRID_SKELETON_CELL_COUNT } from './WeekGrid-Skeleton.const';
import type { IWeekGridSkeletonProps } from './WeekGrid-Skeleton.typings';
import { styles } from './WeekGrid-Skeleton.styles';

export function WeekGridSkeleton({ pageWidth, weekRangeLabel }: IWeekGridSkeletonProps) {
  const c = useThemeColors();
  const pageStyle = pageWidth && pageWidth > 0 ? { width: pageWidth } : undefined;

  return (
    <View style={[styles.page, pageStyle]} testID={WEEK_GRID_SKELETON}>
      {weekRangeLabel ? (
        <Text style={[typography.caption, styles.weekLabel, { color: c.textMuted }]}>
          {weekRangeLabel}
        </Text>
      ) : null}
      <View style={styles.row}>
        {Array.from({ length: WEEK_GRID_SKELETON_CELL_COUNT }, (_, index) => (
          <WeekGridSkeletonCell key={index} />
        ))}
      </View>
    </View>
  );
}
