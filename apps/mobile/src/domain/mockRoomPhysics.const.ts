/** Скорость изменения влажности при включённом увлажнителе, %/tick */
export const MOCK_HUMIDITY_RATE_ON = 0.8;

/** Скорость падения влажности при выключенном увлажнителе, %/tick */
export const MOCK_HUMIDITY_RATE_OFF = -0.2;

/** Доп. падение влажности при открытом окне (на 100% открытия), %/tick */
export const MOCK_HUMIDITY_WINDOW_RATE = -1.8;

/** Минимальная влажность в симуляции, % */
export const MOCK_HUMIDITY_MIN = 25;

/** Максимальная влажность в симуляции, % */
export const MOCK_HUMIDITY_MAX = 65;

/** Скорость движения current_temperature к уставке, °C/tick */
export const MOCK_CLIMATE_DRIFT_RATE = 0.15;

/** Базовый рост CO₂ при закрытом окне, ppm/tick */
export const MOCK_CO2_CLOSED_RATE = 4;

/** Доп. рост CO₂ при присутствии, ppm/tick */
export const MOCK_CO2_OCCUPANCY_RATE = 10;

/** Снижение CO₂ при открытом окне, ppm/tick */
export const MOCK_CO2_WINDOW_RATE = -25;

/** Доп. снижение CO₂ при активной приточке, ppm/tick */
export const MOCK_CO2_VENTILATION_RATE = -20;

/** Минимальный CO₂, ppm */
export const MOCK_CO2_MIN = 400;

/** Максимальный CO₂, ppm */
export const MOCK_CO2_MAX = 2000;

/** Дефолтная уличная температура, если sensor недоступен, °C */
export const MOCK_OUTDOOR_TEMPERATURE_FALLBACK = 12;

/** Скорость притока уличного воздуха при открытом окне, °C/tick */
export const MOCK_WINDOW_TEMP_DRIFT = 0.08;

/** Интервал симулятора комнаты, мс */
export const MOCK_ROOM_TICK_MS = 3000;
