import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import {
  getActiveBedroomSensorEntityIds,
  resolveBedroomSensors,
} from '@/config/resolveBedroomSensors';
import { copy } from '@/copy/ru';
import type { ISleepNightSummary } from '@/domain/sleepNight.typings';
import { pickDefaultNight } from '@/features/sleep/lib/pickDefaultNight';
import { sleepScoreColor } from '@/features/sleep/lib/sleepScorePresentation';
import { useSleepHistory } from '@/features/sleep/lib/useSleepHistory';
import { SleepNightDetail } from '@/features/sleep/ui/SleepNightDetail';
import { SleepWeekPage } from '@/features/sleep/ui/WeekGrid';
import { useHaBackend } from '@/hooks/useHaBackend';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { ScreenLayout } from '@/ui/ScreenLayout';
import { CalmButton } from '@/ui/CalmButton';
import { typography } from '@/theme/tokens';

import {
  SLEEP_SCREEN,
  SLEEP_SCREEN_HORIZONTAL_PADDING,
  SLEEP_WEEK_PAGE_GAP,
  SLEEP_WEEK_SCROLL_LEFT_VELOCITY,
} from './SleepScreen.const';
import { styles } from './SleepScreen.styles';

const LEGEND_ITEMS = [
  { score: 'good' as const, label: copy.sleep.legendGood },
  { score: 'fair' as const, label: copy.sleep.legendFair },
  { score: 'poor' as const, label: copy.sleep.legendPoor },
  { score: 'no_data' as const, label: copy.sleep.legendNoData },
];

const SCROLL_EDGE_THRESHOLD_RATIO = 0.2;

function buildWeekOffsets(loadedEarlierCount: number): number[] {
  return Array.from({ length: loadedEarlierCount + 1 }, (_, index) => loadedEarlierCount - index);
}

interface ISelectedSleepNight {
  /** Сводка по ночи */
  night: ISleepNightSummary;
  /** Смещение недели */
  weekOffset: number;
}

export function SleepScreen() {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const { haReady } = useHaBackend();
  const overrides = useBedroomSensorStore((s) => s.overrides);
  const hasSensors =
    getActiveBedroomSensorEntityIds(resolveBedroomSensors(overrides)).length > 0;

  const [loadedEarlierCount, setLoadedEarlierCount] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedNight, setSelectedNight] = useState<ISelectedSleepNight | null>(null);
  const pagerRef = useRef<ScrollView>(null);
  const hasInteractedRef = useRef(false);
  const isLoadingEarlierRef = useRef(false);
  const shouldRevealAfterPrependRef = useRef(false);
  const scrollXRef = useRef(0);
  const dragStartXRef = useRef(0);

  const pageWidth = width - SLEEP_SCREEN_HORIZONTAL_PADDING * 2;
  const pageStride = pageWidth + SLEEP_WEEK_PAGE_GAP;
  const weekOffsets = buildWeekOffsets(loadedEarlierCount);
  const visibleWeekOffset = weekOffsets[activePageIndex] ?? 0;
  const canGoToNewerWeek = activePageIndex < weekOffsets.length - 1;

  const { refetch, isRefreshing, nights: visibleWeekNights, isLoading: isVisibleWeekLoading } =
    useSleepHistory({ weekOffset: visibleWeekOffset, enabled: hasSensors });

  useEffect(() => {
    if (isVisibleWeekLoading || visibleWeekNights.length === 0) {
      return;
    }

    setSelectedNight((prev) => {
      if (prev?.weekOffset === visibleWeekOffset) {
        const existingNight = visibleWeekNights.find(
          (night) => night.window.nightDate === prev.night.window.nightDate,
        );
        if (existingNight) {
          return { night: existingNight, weekOffset: visibleWeekOffset };
        }
      }

      const defaultNight = pickDefaultNight(visibleWeekNights);
      if (!defaultNight) {
        return null;
      }

      return { night: defaultNight, weekOffset: visibleWeekOffset };
    });
  }, [isVisibleWeekLoading, visibleWeekNights, visibleWeekOffset]);

  const syncActivePageIndex = useCallback(
    (scrollX: number) => {
      const nextIndex = Math.round(scrollX / pageStride);
      const clampedIndex = Math.max(0, Math.min(nextIndex, weekOffsets.length - 1));
      setActivePageIndex(clampedIndex);
    },
    [pageStride, weekOffsets.length],
  );

  const scrollToPage = useCallback(
    (pageIndex: number) => {
      const targetX = pageIndex * pageStride;
      scrollXRef.current = targetX;
      setActivePageIndex(pageIndex);
      pagerRef.current?.scrollTo({ x: targetX, animated: true });
    },
    [pageStride],
  );


  const loadEarlierWeek = useCallback(() => {
    if (isLoadingEarlierRef.current) {
      return;
    }

    isLoadingEarlierRef.current = true;
    shouldRevealAfterPrependRef.current = true;
    setLoadedEarlierCount((current) => current + 1);

    requestAnimationFrame(() => {
      isLoadingEarlierRef.current = false;
    });
  }, []);

  const revealPrependedWeek = useCallback(() => {
    const previousScrollX = scrollXRef.current;
    const compensatedScrollX = previousScrollX + pageStride;

    pagerRef.current?.scrollTo({ x: compensatedScrollX, animated: false });

    requestAnimationFrame(() => {
      pagerRef.current?.scrollTo({ x: previousScrollX, animated: true });
    });
  }, [pageStride]);

  const handleContentSizeChange = useCallback(() => {
    if (!shouldRevealAfterPrependRef.current) {
      return;
    }

    shouldRevealAfterPrependRef.current = false;
    requestAnimationFrame(() => {
      revealPrependedWeek();
    });
  }, [revealPrependedWeek]);

  const maybeLoadEarlierBeyondLeftEdge = useCallback(
    (scrollX: number, velocityX: number, dragStartX: number) => {
      if (!hasInteractedRef.current) {
        return;
      }

      const edgeThreshold = pageStride * SCROLL_EDGE_THRESHOLD_RATIO;
      const startedAtLeftEdge = dragStartX <= edgeThreshold;

      if (!startedAtLeftEdge) {
        return;
      }

      if (scrollX > edgeThreshold) {
        return;
      }

      if (velocityX >= SLEEP_WEEK_SCROLL_LEFT_VELOCITY) {
        return;
      }

      loadEarlierWeek();
    },
    [loadEarlierWeek, pageStride],
  );

  const handleSelectNight = useCallback((night: ISleepNightSummary, weekOffset: number) => {
    setSelectedNight({ night, weekOffset });
  }, []);

  const handleScrollBeginDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    hasInteractedRef.current = true;
    dragStartXRef.current = event.nativeEvent.contentOffset.x;
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollXRef.current = event.nativeEvent.contentOffset.x;
  }, []);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, velocity } = event.nativeEvent;
      scrollXRef.current = contentOffset.x;
      maybeLoadEarlierBeyondLeftEdge(contentOffset.x, velocity?.x ?? 0, dragStartXRef.current);

      if (Math.abs(velocity?.x ?? 0) < 0.01) {
        syncActivePageIndex(contentOffset.x);
      }
    },
    [maybeLoadEarlierBeyondLeftEdge, syncActivePageIndex],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      scrollXRef.current = scrollX;
      syncActivePageIndex(scrollX);
    },
    [syncActivePageIndex],
  );

  const handleGoToOlderWeek = useCallback(() => {
    if (activePageIndex > 0) {
      scrollToPage(activePageIndex - 1);
      return;
    }

    loadEarlierWeek();
  }, [activePageIndex, loadEarlierWeek, scrollToPage]);

  const handleGoToNewerWeek = useCallback(() => {
    if (!canGoToNewerWeek) {
      return;
    }

    scrollToPage(activePageIndex + 1);
  }, [activePageIndex, canGoToNewerWeek, scrollToPage]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  let hint = '';
  if (haReady && !hasSensors) {
    hint = copy.sleep.noSensorsHint;
  }

  return (
    <ScreenLayout
      title={copy.sleep.screenTitle}
      onRefresh={haReady && hasSensors ? handleRefresh : undefined}
      isRefreshing={isRefreshing}
    >
      <View style={styles.content} testID={SLEEP_SCREEN}>
        <Text style={[typography.subtitle, { color: c.text }]}>{copy.sleep.sectionTitle}</Text>

        <View style={styles.legend}>
          <View style={styles.legendRow}>
            {LEGEND_ITEMS.map((item) => (
              <View key={item.score} style={styles.legendItem}>
                <View
                  style={[styles.legendSwatch, { backgroundColor: sleepScoreColor(item.score, c) }]}
                />
                <Text style={[typography.caption, { color: c.textMuted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {hint ? (
          <View style={styles.hintBlock}>
            <Text style={[typography.caption, styles.hint, { color: c.textMuted }]}>{hint}</Text>
            {haReady && !hasSensors ? (
              <CalmButton
                label={copy.now.setupSensorsButton}
                variant="secondary"
                onPress={() => router.push({ pathname: '/bedroom', params: { tab: 'sensors' } })}
              />
            ) : null}
          </View>
        ) : (
          <>
            <ScrollView
              ref={pagerRef}
              horizontal
              snapToInterval={pageStride}
              snapToAlignment="start"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScrollBeginDrag={handleScrollBeginDrag}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              onContentSizeChange={handleContentSizeChange}
              style={styles.pager}
              contentContainerStyle={{ paddingHorizontal: SLEEP_SCREEN_HORIZONTAL_PADDING }}
            >
              {weekOffsets.map((weekOffset, index) => (
                <View
                  key={weekOffset}
                  style={[
                    styles.weekPage,
                    {
                      width: pageWidth,
                      marginRight: index < weekOffsets.length - 1 ? SLEEP_WEEK_PAGE_GAP : 0,
                    },
                  ]}
                >
                  <SleepWeekPage
                    weekOffset={weekOffset}
                    pageWidth={pageWidth}
                    selectedNightDate={
                      selectedNight?.weekOffset === weekOffset
                        ? selectedNight.night.window.nightDate
                        : undefined
                    }
                    onSelectNight={(night) => handleSelectNight(night, weekOffset)}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.weekNav}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.sleep.weekNavOlderA11y}
                onPress={handleGoToOlderWeek}
                style={styles.weekNavButton}
              >
                <FontAwesome name="chevron-left" size={18} color={c.accent} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.sleep.weekNavNewerA11y}
                disabled={!canGoToNewerWeek}
                onPress={handleGoToNewerWeek}
                style={[styles.weekNavButton, !canGoToNewerWeek && styles.weekNavButtonDisabled]}
              >
                <FontAwesome
                  name="chevron-right"
                  size={18}
                  color={canGoToNewerWeek ? c.accent : c.textMuted}
                />
              </Pressable>
            </View>

            {selectedNight &&
            selectedNight.weekOffset === visibleWeekOffset &&
            !isVisibleWeekLoading &&
            visibleWeekNights.length > 0 ? (
              <SleepNightDetail
                night={selectedNight.night}
                weekOffset={selectedNight.weekOffset}
              />
            ) : null}
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
