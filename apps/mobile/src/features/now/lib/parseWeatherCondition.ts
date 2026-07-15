import type { IHaEntityState } from '@/ha/types';

/**
 * Условие погоды из state weather.* (стандартные значения HA).
 * @see https://www.home-assistant.io/integrations/weather/
 */
export type TOutdoorWeatherCondition =
  | 'clear-night'
  | 'cloudy'
  | 'fog'
  | 'hail'
  | 'lightning'
  | 'lightning-rainy'
  | 'partlycloudy'
  | 'pouring'
  | 'rainy'
  | 'snowy'
  | 'snowy-rainy'
  | 'sunny'
  | 'windy'
  | 'windy-variant'
  | 'exceptional';

const WEATHER_CONDITIONS = new Set<string>([
  'clear-night',
  'cloudy',
  'fog',
  'hail',
  'lightning',
  'lightning-rainy',
  'partlycloudy',
  'pouring',
  'rainy',
  'snowy',
  'snowy-rainy',
  'sunny',
  'windy',
  'windy-variant',
  'exceptional',
]);

/** Парсит условие погоды из state weather entity */
export function parseWeatherConditionFromHaState(
  state: IHaEntityState | undefined,
): TOutdoorWeatherCondition | undefined {
  if (!state || state.state === 'unavailable' || state.state === 'unknown') {
    return undefined;
  }
  if (!WEATHER_CONDITIONS.has(state.state)) {
    return undefined;
  }
  return state.state as TOutdoorWeatherCondition;
}

/** Эмодзи по условию погоды; неизвестное → облачко с солнцем */
export function weatherConditionIcon(condition: TOutdoorWeatherCondition | undefined): string {
  switch (condition) {
    case 'sunny':
      return '☀️';
    case 'clear-night':
      return '🌙';
    case 'partlycloudy':
      return '🌤';
    case 'cloudy':
      return '☁️';
    case 'fog':
      return '🌫';
    case 'rainy':
    case 'pouring':
      return '🌧';
    case 'snowy':
      return '❄️';
    case 'snowy-rainy':
    case 'hail':
      return '🌨';
    case 'lightning':
    case 'lightning-rainy':
      return '⛈';
    case 'windy':
    case 'windy-variant':
      return '💨';
    case 'exceptional':
    case undefined:
      return '🌤';
  }
}
