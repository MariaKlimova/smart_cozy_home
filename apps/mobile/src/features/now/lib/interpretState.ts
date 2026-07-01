import { copy } from '@/copy/ru';

import type { IBedroomReadings } from './bedroomReadings.typings';

/** Визуальный тон карточки по доминирующему отклонению */
export type TBedroomStateTone = 'neutral' | 'comfort' | 'air' | 'warm' | 'cool' | 'dry';

/** Есть хотя бы одно числовое показание датчиков спальни */
export function hasAnyBedroomReading(readings: IBedroomReadings): boolean {
  return (
    readings.co2Ppm !== undefined ||
    readings.temperatureC !== undefined ||
    readings.humidityPct !== undefined
  );
}

/** Есть хотя бы одно показание внешних условий */
export function hasAnyOutdoorReading(readings: IBedroomReadings): boolean {
  return readings.outdoorTemperatureC !== undefined || readings.sunEvent !== undefined;
}

/** Одна метрика для чипа */
export interface IMetricChipView {
  /** Идентификатор метрики */
  id: string;
  /** Эмодзи-иконка */
  icon: string;
  /** Подпись под значением */
  label: string;
  /** Отформатированное значение */
  value: string;
  /** Показать « ppm » рядом со значением */
  showPpmUnit?: boolean;
}

/** Метрика датчиков спальни */
export type IBedroomMetricView = IMetricChipView & {
  /** Идентификатор метрики спальни */
  id: 'temperature' | 'humidity' | 'co2';
};

/** Метрика внешних условий */
export type IOutdoorMetricView = IMetricChipView & {
  /** Идентификатор внешней метрики */
  id: 'outdoorTemperature' | 'sunEvent';
};

/** Интерпретация показаний спальни одной фразой (приоритет: CO₂ → температура → влажность) */
export function interpretBedroomState(readings: IBedroomReadings): string {
  const { co2Ppm, temperatureC, humidityPct } = readings;
  const phrases = copy.now.phrases;

  if (!hasAnyBedroomReading(readings)) {
    return phrases.noData;
  }

  if (co2Ppm !== undefined) {
    if (co2Ppm > 1200) return phrases.stuffyVentilate;
    if (co2Ppm >= 800) return phrases.slightlyStuffy;
  }

  if (temperatureC !== undefined) {
    if (temperatureC > 22) return phrases.warmForSleep;
    if (temperatureC < 17) return phrases.coolBedroom;
  }

  if (humidityPct !== undefined && humidityPct < 30) {
    return phrases.dryHumidifier;
  }

  return phrases.comfortable;
}

/** Тон акцента карточки (синхронен с приоритетом interpretBedroomState) */
export function getBedroomStateTone(readings: IBedroomReadings): TBedroomStateTone {
  const { co2Ppm, temperatureC, humidityPct } = readings;

  if (!hasAnyBedroomReading(readings)) return 'neutral';

  if (co2Ppm !== undefined && co2Ppm >= 800) return 'air';
  if (temperatureC !== undefined && temperatureC > 22) return 'warm';
  if (temperatureC !== undefined && temperatureC < 17) return 'cool';
  if (humidityPct !== undefined && humidityPct < 30) return 'dry';

  return 'comfort';
}

/** Метрики датчиков спальни (три чипа) */
export function formatBedroomMetrics(readings: IBedroomReadings): IBedroomMetricView[] {
  const dash = copy.now.metricsUnavailable;
  const labels = copy.now.metrics;

  return [
    {
      id: 'temperature',
      icon: '🌡',
      label: labels.temperature,
      value:
        readings.temperatureC !== undefined ? `${Math.round(readings.temperatureC)}°` : dash,
    },
    {
      id: 'humidity',
      icon: '💧',
      label: labels.humidity,
      value:
        readings.humidityPct !== undefined ? `${Math.round(readings.humidityPct)}%` : dash,
    },
    {
      id: 'co2',
      icon: '🌬',
      label: labels.co2,
      value: readings.co2Ppm !== undefined ? `${Math.round(readings.co2Ppm)}` : dash,
      showPpmUnit: true,
    },
  ];
}

/** Метрики внешних условий (улица + солнце) */
export function formatOutdoorMetrics(readings: IBedroomReadings): IOutdoorMetricView[] {
  const dash = copy.now.metricsUnavailable;
  const labels = copy.now.outdoorMetrics;
  const sunEvent = readings.sunEvent;
  const sunIcon = sunEvent?.kind === 'sunset' ? '🌇' : '🌅';

  let sunLabel: string = dash;
  if (sunEvent?.kind === 'sunset') {
    sunLabel = labels.sunset;
  } else if (sunEvent?.kind === 'sunrise') {
    sunLabel = labels.sunrise;
  }

  return [
    {
      id: 'outdoorTemperature',
      icon: '🌤',
      label: labels.temperature,
      value:
        readings.outdoorTemperatureC !== undefined
          ? `${Math.round(readings.outdoorTemperatureC)}°`
          : dash,
    },
    {
      id: 'sunEvent',
      icon: sunIcon,
      label: sunLabel,
      value: sunEvent?.time ?? dash,
    },
  ];
}
