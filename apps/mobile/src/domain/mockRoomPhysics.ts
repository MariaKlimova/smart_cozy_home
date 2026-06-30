import {
  MOCK_CLIMATE_DRIFT_RATE,
  MOCK_CO2_CLOSED_RATE,
  MOCK_CO2_MAX,
  MOCK_CO2_MIN,
  MOCK_CO2_OCCUPANCY_RATE,
  MOCK_CO2_VENTILATION_RATE,
  MOCK_CO2_WINDOW_RATE,
  MOCK_HUMIDITY_MAX,
  MOCK_HUMIDITY_MIN,
  MOCK_HUMIDITY_RATE_OFF,
  MOCK_HUMIDITY_RATE_ON,
  MOCK_HUMIDITY_WINDOW_RATE,
  MOCK_OUTDOOR_TEMPERATURE_FALLBACK,
  MOCK_WINDOW_TEMP_DRIFT,
} from '@/domain/mockRoomPhysics.const';

/** Снимок climate entity для физики */
export interface IClimatePhysicsSnapshot {
  /** entity_id */
  entityId: string;
  /** Уставка, °C */
  setpoint: number;
  /** Текущая температура, °C */
  current: number;
}

/** Вход симуляции комнаты */
export interface IRoomPhysicsInput {
  /** Увлажнитель включён */
  humidifierOn: boolean;
  /** Позиция окна 0–100 */
  windowPosition: number;
  /** Есть присутствие в комнате */
  occupancyOn: boolean;
  /** Приточка активна (state heat/cool и setpoint) */
  ventilationActive: boolean;
  /** Climate устройства спальни */
  climates: IClimatePhysicsSnapshot[];
  /** Текущая влажность, % */
  humidityPct: number;
  /** Текущий CO₂, ppm */
  co2Ppm: number;
  /** Уличная температура, °C */
  outdoorTemperatureC: number;
  /** entity_id кондиционера — отключается при открытом окне */
  airConditionerEntityId: string;
}

/** Результат одного tick симуляции */
export interface IRoomPhysicsOutput {
  /** Обновлённые climate с новым current */
  climates: IClimatePhysicsSnapshot[];
  /** Влажность, % */
  humidityPct: number;
  /** Температура комнаты (среднее climate), °C */
  temperatureC: number;
  /** CO₂, ppm */
  co2Ppm: number;
  /** entity_id кондиционера — нужно выставить state off при открытом окне */
  airConditionerOff: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function moveToward(current: number, target: number, rate: number): number {
  if (current < target) {
    return Math.min(target, current + rate);
  }
  if (current > target) {
    return Math.max(target, current - rate);
  }
  return current;
}

function driftClimate(
  climate: IClimatePhysicsSnapshot,
  windowOpen: boolean,
  outdoorTemperatureC: number,
): IClimatePhysicsSnapshot {
  if (windowOpen) {
    return {
      ...climate,
      current: moveToward(climate.current, outdoorTemperatureC, MOCK_WINDOW_TEMP_DRIFT),
    };
  }

  return {
    ...climate,
    current: moveToward(climate.current, climate.setpoint, MOCK_CLIMATE_DRIFT_RATE),
  };
}

function averageTemperature(climates: IClimatePhysicsSnapshot[]): number {
  if (climates.length === 0) return MOCK_OUTDOOR_TEMPERATURE_FALLBACK;
  const sum = climates.reduce((acc, item) => acc + item.current, 0);
  return sum / climates.length;
}

/** Один шаг физики комнаты (pure) */
export function tickRoomPhysics(input: IRoomPhysicsInput): IRoomPhysicsOutput {
  const windowOpen = input.windowPosition > 0;
  const windowFactor = input.windowPosition / 100;
  const humidifierRate = input.humidifierOn ? MOCK_HUMIDITY_RATE_ON : MOCK_HUMIDITY_RATE_OFF;
  const humidityRate = humidifierRate + windowFactor * MOCK_HUMIDITY_WINDOW_RATE;
  const humidityPct = clamp(
    input.humidityPct + humidityRate,
    MOCK_HUMIDITY_MIN,
    MOCK_HUMIDITY_MAX,
  );

  const climates = input.climates.map((climate) =>
    driftClimate(climate, windowOpen, input.outdoorTemperatureC),
  );

  let co2Delta = 0;
  if (windowOpen) {
    co2Delta += MOCK_CO2_WINDOW_RATE;
  } else {
    co2Delta += MOCK_CO2_CLOSED_RATE;
  }
  if (input.occupancyOn) {
    co2Delta += MOCK_CO2_OCCUPANCY_RATE;
  }
  if (input.ventilationActive && !windowOpen) {
    co2Delta += MOCK_CO2_VENTILATION_RATE;
  }
  const co2Ppm = clamp(input.co2Ppm + co2Delta, MOCK_CO2_MIN, MOCK_CO2_MAX);

  return {
    climates,
    humidityPct,
    temperatureC: averageTemperature(climates),
    co2Ppm,
    airConditionerOff: windowOpen,
  };
}
