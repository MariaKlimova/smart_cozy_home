import { useMemo, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import { useThemeColors } from '@/hooks/useThemeColors';
import { typography, spacing } from '@/theme/tokens';

import {
  CALM_LINE_CHART,
  CALM_LINE_CHART_DEFAULT_HEIGHT,
  CALM_LINE_CHART_DOT_RADIUS,
  CALM_LINE_CHART_GRID_LINES,
  CALM_LINE_CHART_LINE_WIDTH,
  CALM_LINE_CHART_MIN_POINTS,
  CALM_LINE_CHART_NORM_OPACITY,
  CALM_LINE_CHART_OUT_OF_NORM_OPACITY,
  CALM_LINE_CHART_PADDING,
  CALM_LINE_CHART_PLOT_BG_OPACITY,
  CALM_LINE_CHART_PLOT_RADIUS,
  CALM_LINE_CHART_AXIS_LABEL_FONT_SIZE,
  CALM_LINE_CHART_X_LABEL_BOTTOM_OFFSET,
} from './CalmLineChart.const';
import type { ICalmLineChartPoint, ICalmLineChartProps } from './CalmLineChart.typings';
import { styles } from './CalmLineChart.styles';

const PLOT_CLIP_ID = 'calmLineChartPlotClip';

function mapX(normalizedX: number, plotLeft: number, chartWidth: number): number {
  return plotLeft + normalizedX * chartWidth;
}

function mapY(
  value: number,
  yDomainMin: number,
  yDomainMax: number,
  plotTop: number,
  chartHeight: number,
): number {
  const range = yDomainMax - yDomainMin;
  if (range === 0) {
    return plotTop + chartHeight / 2;
  }

  const ratio = (value - yDomainMin) / range;
  return plotTop + chartHeight - ratio * chartHeight;
}

function buildLinePath(
  points: ICalmLineChartPoint[],
  plotLeft: number,
  chartWidth: number,
  plotTop: number,
  chartHeight: number,
  yDomainMin: number,
  yDomainMax: number,
): string {
  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) => {
      const x = mapX(point.x, plotLeft, chartWidth);
      const y = mapY(point.y, yDomainMin, yDomainMax, plotTop, chartHeight);
      const command = index === 0 ? 'M' : 'L';
      return `${command}${x},${y}`;
    })
    .join(' ');
}

function formatYLabel(value: number, unit: string): string {
  const rounded = String(Math.round(value));
  if (unit === '°C') {
    return `${rounded}°`;
  }
  if (unit === '%') {
    return `${rounded}%`;
  }
  return rounded;
}

function getXLabelAnchor(
  index: number,
  total: number,
): 'start' | 'middle' | 'end' {
  if (index === 0) {
    return 'start';
  }
  if (index === total - 1) {
    return 'end';
  }
  return 'middle';
}

export function CalmLineChart({
  points,
  normBand,
  yDomain,
  xLabels,
  unit,
  height = CALM_LINE_CHART_DEFAULT_HEIGHT,
  emptyMessage,
}: ICalmLineChartProps) {
  const c = useThemeColors();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const svgWidth = containerWidth > 0 ? containerWidth : 1;
  const plotLeft = CALM_LINE_CHART_PADDING.left;
  const plotTop = CALM_LINE_CHART_PADDING.top;
  const chartWidth = svgWidth - CALM_LINE_CHART_PADDING.left - CALM_LINE_CHART_PADDING.right;
  const chartHeight = height - CALM_LINE_CHART_PADDING.top - CALM_LINE_CHART_PADDING.bottom;
  const plotBottom = plotTop + chartHeight;
  const svgHeight = height;

  const linePath = useMemo(
    () =>
      buildLinePath(points, plotLeft, chartWidth, plotTop, chartHeight, yDomain.min, yDomain.max),
    [chartHeight, chartWidth, plotLeft, plotTop, points, yDomain.max, yDomain.min],
  );

  const gridLineYs = useMemo(() => {
    return Array.from({ length: CALM_LINE_CHART_GRID_LINES }, (_, index) => {
      const ratio = index / (CALM_LINE_CHART_GRID_LINES - 1);
      return plotTop + chartHeight - ratio * chartHeight;
    });
  }, [chartHeight, plotTop]);

  if (containerWidth === 0) {
    return (
      <View
        style={[styles.chartCard, { borderColor: c.border, backgroundColor: c.surface }]}
        onLayout={handleLayout}
        testID={CALM_LINE_CHART}
      />
    );
  }

  if (points.length < CALM_LINE_CHART_MIN_POINTS) {
    return (
      <View
        style={[styles.empty, styles.chartCard, { borderColor: c.border, backgroundColor: c.accentMuted }]}
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
    const topY = mapY(normTopValue, yDomain.min, yDomain.max, plotTop, chartHeight);
    const bottomY = mapY(normBottomValue, yDomain.min, yDomain.max, plotTop, chartHeight);
    normBandY = Math.min(topY, bottomY);
    normBandHeight = Math.abs(bottomY - topY);
    aboveNormHeight = Math.max(0, normBandY - plotTop);
    belowNormHeight = Math.max(0, plotBottom - (normBandY + normBandHeight));
  }

  const yTicks = [yDomain.max, yDomain.min];

  return (
    <View
      style={[styles.chartCard, { borderColor: c.border, backgroundColor: c.surface }]}
      onLayout={handleLayout}
      testID={CALM_LINE_CHART}
    >
      <Svg width={svgWidth} height={svgHeight}>
        <Defs>
          <ClipPath id={PLOT_CLIP_ID}>
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

        <G clipPath={`url(#${PLOT_CLIP_ID})`}>
          <Rect
            x={plotLeft}
            y={plotTop}
            width={chartWidth}
            height={chartHeight}
            fill={c.accentMuted}
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

          {gridLineYs.map((y, index) => (
            <Line
              key={`grid-${index}`}
              x1={plotLeft}
              y1={y}
              x2={plotLeft + chartWidth}
              y2={y}
              stroke={c.border}
              strokeWidth={1}
              opacity={0.65}
            />
          ))}

          <Path
            d={linePath}
            stroke={c.accent}
            strokeWidth={CALM_LINE_CHART_LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {points.map((point, index) => {
            const x = mapX(point.x, plotLeft, chartWidth);
            const y = mapY(point.y, yDomain.min, yDomain.max, plotTop, chartHeight);

            return (
              <Circle
                key={`dot-${index}`}
                cx={x}
                cy={y}
                r={CALM_LINE_CHART_DOT_RADIUS}
                fill={c.accent}
                stroke={c.surface}
                strokeWidth={2}
              />
            );
          })}
        </G>

        {yTicks.map((tick) => (
          <SvgText
            key={tick}
            x={plotLeft - spacing.sm}
            y={mapY(tick, yDomain.min, yDomain.max, plotTop, chartHeight) + spacing.xs}
            fontSize={CALM_LINE_CHART_AXIS_LABEL_FONT_SIZE}
            fill={c.textMuted}
            textAnchor="end"
          >
            {formatYLabel(tick, unit)}
          </SvgText>
        ))}

        {xLabels.map((label, index) => (
          <SvgText
            key={`${label.x}-${label.label}`}
            x={mapX(label.x, plotLeft, chartWidth)}
            y={svgHeight - CALM_LINE_CHART_X_LABEL_BOTTOM_OFFSET}
            fontSize={CALM_LINE_CHART_AXIS_LABEL_FONT_SIZE}
            fill={c.textMuted}
            textAnchor={getXLabelAnchor(index, xLabels.length)}
          >
            {label.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
