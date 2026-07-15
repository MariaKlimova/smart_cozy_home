import { copy } from '@/copy/ru';
import {
  BEDROOM_CO2_ELEVATED_PPM,
  BEDROOM_CO2_STUFFY_PPM,
  SLEEP_CO2_NORM_MAX_PPM,
  SLEEP_HUMIDITY_NORM_MIN_PCT,
  SLEEP_TEMP_NORM_MAX_C,
  SLEEP_TEMP_NORM_MIN_C,
  isBedroomCo2Elevated,
} from '@/domain/sleepMetricNorms';

import type { IBedroomReadings } from './bedroomReadings.typings';
import { weatherConditionIcon } from './parseWeatherCondition';

/** Контекст интерпретации показаний спальни */
export interface IBedroomInterpretContext {
  /** Сейчас ночь по пользовательскому расписанию */
  isNight: boolean;
}

/** Визуальный тон карточки по доминирующему отклонению */
export type TBedroomStateTone = 'neutral' | 'comfort' | 'air' | 'warm' | 'cool' | 'dry';

/** Доминирующее отклонение показаний спальни ночью */
type TBedroomNightDeviation = 'stuffy' | 'slightlyStuffy' | 'warm' | 'cool' | 'dry' | 'comfort';

/** Есть хотя бы одно числовое показание датчиков спальни */
export function hasAnyBedroomReading(readings: IBedroomReadings): boolean {
  return (
    readings.co2Ppm !== undefined ||
    readings.temperatureC !== undefined ||
    readings.humidityPct !== undefined ||
    readings.pressureMmhg !== undefined
  );
}

/** Есть хотя бы одно показание внешних условий */
export function hasAnyOutdoorReading(readings: IBedroomReadings): boolean {
  return (
    readings.outdoorTemperatureC !== undefined ||
    readings.outdoorWeatherCondition !== undefined ||
    readings.sunEvent !== undefined
  );
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
  /** Показать « mmHg » рядом со значением */
  showMmhgUnit?: boolean;
}

/** Метрика датчиков спальни */
export type IBedroomMetricView = IMetricChipView & {
  /** Идентификатор метрики спальни */
  id: 'temperature' | 'humidity' | 'co2' | 'pressure';
};

/** Метрика внешних условий */
export type IOutdoorMetricView = IMetricChipView & {
  /** Идентификатор внешней метрики */
  id: 'outdoorTemperature' | 'sunEvent';
};

function resolveBedroomNightDeviation(readings: IBedroomReadings): TBedroomNightDeviation {
  const { co2Ppm, temperatureC, humidityPct } = readings;

  if (temperatureC !== undefined) {
    if (temperatureC > SLEEP_TEMP_NORM_MAX_C) return 'warm';
    if (temperatureC < SLEEP_TEMP_NORM_MIN_C) return 'cool';
  }

  if (co2Ppm !== undefined) {
    if (co2Ppm > SLEEP_CO2_NORM_MAX_PPM) return 'stuffy';
    if (co2Ppm >= BEDROOM_CO2_ELEVATED_PPM) return 'slightlyStuffy';
  }

  if (humidityPct !== undefined && humidityPct < SLEEP_HUMIDITY_NORM_MIN_PCT) {
    return 'dry';
  }

  return 'comfort';
}

function nightDeviationToPhrase(deviation: TBedroomNightDeviation): string {
  const phrases = copy.now.phrases;

  if (deviation === 'stuffy') return phrases.stuffyForSleep;
  if (deviation === 'slightlyStuffy') return phrases.slightlyStuffyForSleep;
  if (deviation === 'warm') return phrases.warmForSleep;
  if (deviation === 'cool') return phrases.coolForSleep;
  if (deviation === 'dry') return phrases.dryForSleep;

  return phrases.comfortableForSleep;
}

function nightDeviationToTone(deviation: TBedroomNightDeviation): TBedroomStateTone {
  if (deviation === 'stuffy' || deviation === 'slightlyStuffy') return 'air';
  if (deviation === 'warm') return 'warm';
  if (deviation === 'cool') return 'cool';
  if (deviation === 'dry') return 'dry';

  return 'comfort';
}

/** Интерпретация показаний спальни одной фразой (ночь: температура → CO₂ → влажность; день: CO₂ → температура → влажность) */
export function interpretBedroomState(
  readings: IBedroomReadings,
  context: IBedroomInterpretContext = { isNight: false },
): string {
  const { co2Ppm, temperatureC, humidityPct } = readings;
  const phrases = copy.now.phrases;

  if (!hasAnyBedroomReading(readings)) {
    return phrases.noData;
  }

  if (context.isNight) {
    return nightDeviationToPhrase(resolveBedroomNightDeviation(readings));
  }

  if (co2Ppm !== undefined) {
    if (co2Ppm > BEDROOM_CO2_STUFFY_PPM) return phrases.stuffyVentilate;
    if (isBedroomCo2Elevated(co2Ppm)) return phrases.slightlyStuffy;
  }

  if (temperatureC !== undefined) {
    if (temperatureC > SLEEP_TEMP_NORM_MAX_C) return phrases.warmBedroom;
    if (temperatureC < 17) return phrases.coolBedroom;
  }

  if (humidityPct !== undefined && humidityPct < SLEEP_HUMIDITY_NORM_MIN_PCT) {
    return phrases.dryHumidifier;
  }

  return phrases.comfortable;
}

/** Тон акцента карточки (синхронен с приоритетом interpretBedroomState) */
export function getBedroomStateTone(
  readings: IBedroomReadings,
  context: IBedroomInterpretContext = { isNight: false },
): TBedroomStateTone {
  const { co2Ppm, temperatureC, humidityPct } = readings;

  if (!hasAnyBedroomReading(readings)) return 'neutral';

  if (context.isNight) {
    return nightDeviationToTone(resolveBedroomNightDeviation(readings));
  }

  if (isBedroomCo2Elevated(co2Ppm)) return 'air';
  if (temperatureC !== undefined && temperatureC > SLEEP_TEMP_NORM_MAX_C) return 'warm';
  if (temperatureC !== undefined && temperatureC < 17) return 'cool';
  if (humidityPct !== undefined && humidityPct < SLEEP_HUMIDITY_NORM_MIN_PCT) return 'dry';

  return 'comfort';
}

/** Метрики датчиков спальни (четыре чипа, сетка 2×2) */
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
    {
      id: 'pressure',
      icon: '🌀',
      label: labels.pressure,
      value:
        readings.pressureMmhg !== undefined ? `${Math.round(readings.pressureMmhg)}` : dash,
      showMmhgUnit: true,
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
      icon: weatherConditionIcon(readings.outdoorWeatherCondition),
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
