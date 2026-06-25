/** Показания датчиков спальни (числа или отсутствуют при недоступном датчике) */
export interface IBedroomReadings {
  /** Температура в °C */
  temperatureC?: number;
  /** Влажность в % */
  humidityPct?: number;
  /** CO₂ в ppm */
  co2Ppm?: number;
}
