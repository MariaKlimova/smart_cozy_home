import { useMemo, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import { useThemeColors } from '@/hooks/useThemeColors';
import { spacing, typography } from '@/theme/tokens';

import {
  CALM_LINE_CHART,
  CALM_LINE_CHART_AXIS_LABEL_FONT_SIZE,
  CALM_LINE_CHART_DEFAULT_HEIGHT,
  CALM_LINE_CHART_LINE_WIDTH,
  CALM_LINE_CHART_MIN_POINTS,
  CALM_LINE_CHART_NORM_OPACITY,
  CALM_LINE_CHART_OUT_OF_NORM_OPACITY,
  CALM_LINE_CHART_PADDING,
  CALM_LINE_CHART_PLOT_BG_OPACITY,
  CALM_LINE_CHART_PLOT_CLIP_ID,
  CALM_LINE_CHART_PLOT_RADIUS,
  CALM_LINE_CHART_X_LABEL_BOTTOM_OFFSET,
  CALM_LINE_CHART_Y_TICK_COUNT,
} from './CalmLineChart.const';
import { styles } from './CalmLineChart.styles';
import type { ICalmLineChartProps } from './CalmLineChart.typings';
import {
  buildLinePath,
  buildYTicks,
  formatYLabel,
  getXLabelAnchor,
  mapX,
  mapY,
} from './CalmLineChart.utils';

export function CalmLineChart({
  points,
  normBand,
  yDomain,
  xLabels,
  unit,
  height = CALM_LINE_CHART_DEFAULT_HEIGHT,
  emptyMessage,
  embedded = false,
}: ICalmLineChartProps) {
  const c = useThemeColors();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const chartContainerStyle = embedded
    ? styles.chartEmbedded
    : [styles.chartCard, { borderColor: c.border, backgroundColor: c.surface }];

  const svgWidth = containerWidth > 0 ? containerWidth : 1;
  const plotLeft = CALM_LINE_CHART_PADDING.left;
  const plotTop = CALM_LINE_CHART_PADDING.top;
  const chartWidth = svgWidth - CALM_LINE_CHART_PADDING.left - CALM_LINE_CHART_PADDING.right;
  const chartHeight = height - CALM_LINE_CHART_PADDING.top - CALM_LINE_CHART_PADDING.bottom;
  const plotBottom = plotTop + chartHeight;
  const svgHeight = height;

  const linePath = useMemo(
    () =>
      buildLinePath({
        points,
        plotLeft,
        chartWidth,
        plotTop,
        chartHeight,
        yDomainMin: yDomain.min,
        yDomainMax: yDomain.max,
      }),
    [chartHeight, chartWidth, plotLeft, plotTop, points, yDomain.max, yDomain.min],
  );

  if (containerWidth === 0) {
    return (
      <View
        style={chartContainerStyle}
        onLayout={handleLayout}
        testID={CALM_LINE_CHART}
      />
    );
  }

  if (points.length < CALM_LINE_CHART_MIN_POINTS) {
    return (
      <View
        style={[
          styles.empty,
          embedded ? styles.chartEmbedded : styles.chartCard,
          embedded ? null : { borderColor: c.border },
          { backgroundColor: embedded ? 'transparent' : c.accentMuted },
        ]}
        onLayout={handleLayout}
        testID={CALM_LINE_CHART}
      >
        <Text style={[typography.caption, { color: c.textMuted }]}>
          {emptyMessage ?? ''}
        </Text>
      </View>
    );
  }

  let normBandY: number = plotTop;
  let normBandHeight = chartHeight;
  let aboveNormHeight = 0;
  let belowNormHeight = 0;

  if (normBand) {
    const normTopValue = normBand.max ?? yDomain.max;
    const normBottomValue = normBand.min ?? yDomain.min;
    const topY = mapY({
      value: normTopValue,
      yDomainMin: yDomain.min,
      yDomainMax: yDomain.max,
      plotTop,
      chartHeight,
    });
    const bottomY = mapY({
      value: normBottomValue,
      yDomainMin: yDomain.min,
      yDomainMax: yDomain.max,
      plotTop,
      chartHeight,
    });
    normBandY = Math.min(topY, bottomY);
    normBandHeight = Math.abs(bottomY - topY);
    aboveNormHeight = Math.max(0, normBandY - plotTop);
    belowNormHeight = Math.max(0, plotBottom - (normBandY + normBandHeight));
  }

  const yTicks = buildYTicks({
    min: yDomain.min,
    max: yDomain.max,
    count: CALM_LINE_CHART_Y_TICK_COUNT,
  });

  return (
    <View
      style={chartContainerStyle}
      onLayout={handleLayout}
      testID={CALM_LINE_CHART}
    >
      <Svg width={svgWidth} height={svgHeight}>
        <Defs>
          <ClipPath id={CALM_LINE_CHART_PLOT_CLIP_ID}>
            <Rect
              x={plotLeft}
              y={plotTop}
              width={chartWidth}
              height={chartHeight}
              rx={CALM_LINE_CHART_PLOT_RADIUS}
              ry={CALM_LINE_CHART_PLOT_RADIUS}
            />
          </ClipPath>
        </Defs>

        <G clipPath={`url(#${CALM_LINE_CHART_PLOT_CLIP_ID})`}>
          <Rect
            x={plotLeft}
            y={plotTop}
            width={chartWidth}
            height={chartHeight}
            fill={normBand ? c.accentMuted : c.border}
            opacity={CALM_LINE_CHART_PLOT_BG_OPACITY}
          />

          {normBand?.highlightAboveMax && aboveNormHeight > 0 ? (
            <Rect
              x={plotLeft}
              y={plotTop}
              width={chartWidth}
              height={aboveNormHeight}
              fill={c.danger}
              opacity={CALM_LINE_CHART_OUT_OF_NORM_OPACITY}
            />
          ) : null}

          {normBand?.highlightBelowMin && belowNormHeight > 0 ? (
            <Rect
              x={plotLeft}
              y={plotBottom - belowNormHeight}
              width={chartWidth}
              height={belowNormHeight}
              fill={c.danger}
              opacity={CALM_LINE_CHART_OUT_OF_NORM_OPACITY}
            />
          ) : null}

          {normBand ? (
            <Rect
              x={plotLeft}
              y={normBandY}
              width={chartWidth}
              height={Math.max(normBandHeight, 1)}
              fill={c.success}
              opacity={CALM_LINE_CHART_NORM_OPACITY}
            />
          ) : null}

          <Path
            d={linePath}
            stroke={c.accent}
            strokeWidth={CALM_LINE_CHART_LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>

        {yTicks.map((tick, index) => (
          <SvgText
            key={`y-tick-${index}`}
            x={plotLeft - spacing.sm}
            y={
              mapY({
                value: tick,
                yDomainMin: yDomain.min,
                yDomainMax: yDomain.max,
                plotTop,
                chartHeight,
              }) + spacing.xs
            }
            fontSize={CALM_LINE_CHART_AXIS_LABEL_FONT_SIZE}
            fill={c.textMuted}
            textAnchor="end"
          >
            {formatYLabel({ value: tick, unit })}
          </SvgText>
        ))}

        {xLabels.map((label, index) => (
          <SvgText
            key={`${label.x}-${label.label}`}
            x={mapX({ normalizedX: label.x, plotLeft, chartWidth })}
            y={svgHeight - CALM_LINE_CHART_X_LABEL_BOTTOM_OFFSET}
            fontSize={CALM_LINE_CHART_AXIS_LABEL_FONT_SIZE}
            fill={c.textMuted}
            textAnchor={getXLabelAnchor({ index, total: xLabels.length })}
          >
            {label.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
