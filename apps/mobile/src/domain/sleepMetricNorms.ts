/** Идентификатор метрики среды за ночь */
export type TSleepMetricId = 'co2' | 'temperature' | 'humidity';

/** Норма метрики для графика и расчёта % времени в норме */
export interface ISleepMetricNorm {
  /** id метрики */
  id: TSleepMetricId;
  /** Нижняя граница нормы (включительно), если задана */
  min?: number;
  /** Верхняя граница нормы (включительно), если задана */
  max?: number;
  /** Единица измерения для подписи оси */
  unit: string;
}

/** CO₂ выше порога, ppm */
export const SLEEP_CO2_NORM_MAX_PPM = 1000;

/** Масштаб оси Y на графике сна */
export interface ISleepMetricChartScale {
  /** Дефолтный минимум оси, если все точки внутри диапазона */
  defaultMin: number;
  /** Дефолтный максимум оси, если все точки внутри диапазона */
  defaultMax: number;
  /** Отступ от крайней точки данных, если точки выходят за дефолтный диапазон */
  edgePadding: number;
}

/** Дефолтные шкалы графиков по метрикам */
export const SLEEP_METRIC_CHART_SCALES: Record<TSleepMetricId, ISleepMetricChartScale> = {
  co2: {
    defaultMin: 300,
    defaultMax: 1200,
    edgePadding: 50,
  },
  temperature: {
    defaultMin: 14,
    defaultMax: 26,
    edgePadding: 1,
  },
  humidity: {
    defaultMin: 20,
    defaultMax: 70,
    edgePadding: 5,
  },
};

/** CO₂: длительность отклонения для issue, ms */
export const SLEEP_CO2_DEVIATION_MIN_MS = 30 * 60 * 1000;

/** Влажность ниже порога, % */
export const SLEEP_HUMIDITY_NORM_MIN_PCT = 30;

/** Влажность: длительность отклонения для issue, ms */
export const SLEEP_HUMIDITY_DEVIATION_MIN_MS = 60 * 60 * 1000;

/** Температура: нижняя граница комфорта, °C */
export const SLEEP_TEMP_NORM_MIN_C = 16;

/** Температура: верхняя граница комфорта, °C */
export const SLEEP_TEMP_NORM_MAX_C = 22;

/** Нормы по метрикам для UI и scoring */
export const SLEEP_METRIC_NORMS: Record<TSleepMetricId, ISleepMetricNorm> = {
  co2: {
    id: 'co2',
    max: SLEEP_CO2_NORM_MAX_PPM,
    unit: 'ppm',
  },
  temperature: {
    id: 'temperature',
    min: SLEEP_TEMP_NORM_MIN_C,
    max: SLEEP_TEMP_NORM_MAX_C,
    unit: '°C',
  },
  humidity: {
    id: 'humidity',
    min: SLEEP_HUMIDITY_NORM_MIN_PCT,
    unit: '%',
  },
};
