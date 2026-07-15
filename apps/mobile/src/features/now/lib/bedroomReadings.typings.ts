import type { ISunEventReading } from './parseSunEvent';
import type { TOutdoorWeatherCondition } from './parseWeatherCondition';

/** Показания датчиков спальни (числа или отсутствуют при недоступном датчике) */
export interface IBedroomReadings {
  /** Температура в °C */
  temperatureC?: number;
  /** Влажность в % */
  humidityPct?: number;
  /** CO₂ в ppm */
  co2Ppm?: number;
  /** Атмосферное давление в мм рт. ст. */
  pressureMmhg?: number;
  /** Температура на улице в °C */
  outdoorTemperatureC?: number;
  /** Условие погоды с улицы (sunny, rainy, …) */
  outdoorWeatherCondition?: TOutdoorWeatherCondition;
  /** Ближайший закат или восход */
  sunEvent?: ISunEventReading;
}
