import { useMemo, useState } from 'react';

import type { TSleepMetricId } from '@/domain/sleepMetricNorms';
import {
  buildRoomMetricChartPoints,
  buildRoomMetricNormBand,
  buildRoomMetricYDomain,
  buildRoomRangeXLabels,
  getRoomMetricUnit,
} from '@/features/sleep/lib/buildRoomMetricChartData';
import type {
  ICalmLineChartNormBand,
  ICalmLineChartPoint,
  ICalmLineChartXLabel,
  ICalmLineChartYDomain,
} from '@/ui/CalmLineChart';

import type { IRoomConditionsChartProps } from '../RoomConditionsChart.typings';

export interface IUseRoomConditionChartParams {
  /** Точки показаний датчиков */
  samples: IRoomConditionsChartProps['samples'];
  /** Границы оси X графика */
  range: IRoomConditionsChartProps['range'];
  /** Insight над segmented */
  insight: IRoomConditionsChartProps['insight'];
  /** Показывать полосу нормы */
  showNormBand: boolean;
}

export interface IUseRoomConditionChartResult {
  /** Активная метрика */
  activeMetric: TSleepMetricId;
  /** Смена активной метрики */
  setActiveMetric: (metricId: TSleepMetricId) => void;
  /** Точки линии */
  chartPoints: ICalmLineChartPoint[];
  /** Домен оси Y */
  yDomain: ICalmLineChartYDomain;
  /** Подписи оси X */
  xLabels: ICalmLineChartXLabel[];
  /** Полоса нормы или undefined */
  normBand: ICalmLineChartNormBand | undefined;
  /** Текст insight для активной метрики */
  insightText: string | undefined;
  /** Единица измерения активной метрики */
  unit: string;
}

/** Состояние и производные данные графика условий */
export function useRoomConditionChart(
  params: IUseRoomConditionChartParams,
): IUseRoomConditionChartResult {
  const { samples, range, insight, showNormBand } = params;
  const [activeMetric, setActiveMetric] = useState<TSleepMetricId>('co2');

  const chartPoints = useMemo(
    () => buildRoomMetricChartPoints(samples, range, activeMetric),
    [activeMetric, range, samples],
  );

  const yDomain = useMemo(
    () => buildRoomMetricYDomain(chartPoints, activeMetric),
    [activeMetric, chartPoints],
  );

  const xLabels = useMemo(() => buildRoomRangeXLabels(range), [range]);

  const normBand = useMemo(() => {
    if (!showNormBand) {
      return undefined;
    }
    return buildRoomMetricNormBand(activeMetric);
  }, [activeMetric, showNormBand]);

  let insightText: string | undefined;
  if (typeof insight === 'function') {
    insightText = insight(activeMetric);
  } else {
    insightText = insight;
  }

  return {
    activeMetric,
    setActiveMetric,
    chartPoints,
    yDomain,
    xLabels,
    normBand,
    insightText,
    unit: getRoomMetricUnit(activeMetric),
  };
}
