import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import { formatSleepWeekRangeFromEnd } from '@/features/sleep/lib/formatSleepWeekRange';
import { SleepNightCell } from '@/features/sleep/ui/SleepNightCell';
import { useSleepHistory } from '@/features/sleep/lib/useSleepHistory';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

import { WeekGridSkeleton } from './-Skeleton';
import { WEEK_GRID } from './WeekGrid.const';
import type { IWeekGridPageProps, ISleepWeekPageProps } from './WeekGrid.typings';
import { styles } from './WeekGrid.styles';

function WeekGridPage({
  nights,
  pageWidth,
  weekRangeLabel,
  onSelectNight,
  selectedNightDate,
  isLoading,
}: IWeekGridPageProps) {
  const c = useThemeColors();
  const pageStyle = pageWidth > 0 ? { width: pageWidth } : undefined;

  if (isLoading) {
    return <WeekGridSkeleton pageWidth={pageWidth} weekRangeLabel={weekRangeLabel} />;
  }

  if (nights.length === 0) {
    return (
      <View style={[styles.page, styles.loading, pageStyle]} testID={WEEK_GRID}>
        <Text style={[typography.caption, styles.weekLabel, { color: c.textMuted }]}>
          {weekRangeLabel}
        </Text>
        <Text style={[typography.caption, { color: c.textMuted }]}>{copy.sleep.emptyWeek}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.page, pageStyle]} testID={WEEK_GRID}>
      <Text style={[typography.caption, styles.weekLabel, { color: c.textMuted }]}>
        {weekRangeLabel}
      </Text>
      <View style={styles.row}>
        {nights.map((night) => (
          <SleepNightCell
            key={night.window.nightDate}
            night={night}
            selected={night.window.nightDate === selectedNightDate}
            onPress={onSelectNight}
          />
        ))}
      </View>
    </View>
  );
}

export function SleepWeekPage({
  weekOffset,
  pageWidth,
  onSelectNight,
  selectedNightDate,
}: ISleepWeekPageProps) {
  const { nights, weekEnd, isLoading, isFetching } = useSleepHistory({ weekOffset });
  const weekRangeLabel = formatSleepWeekRangeFromEnd(weekEnd);
  const showSkeleton = isLoading || (isFetching && nights.length === 0);

  return (
    <WeekGridPage
      nights={nights}
      pageWidth={pageWidth}
      weekRangeLabel={weekRangeLabel}
      onSelectNight={onSelectNight}
      selectedNightDate={selectedNightDate}
      isLoading={showSkeleton}
    />
  );
}
