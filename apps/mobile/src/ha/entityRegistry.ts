import {
  createConnection,
  createLongLivedTokenAuth,
  type Connection,
} from 'home-assistant-js-websocket';

import { USE_HA_MOCKS } from '@/ha/haClient';
import { getMockLightFavoriteColors } from '@/ha/haMockStore';

const ENTITY_REGISTRY_TIMEOUT_MS = 10_000;

/** Поддерживаемый HA-формат цвета для вызова `light.turn_on`. */
export type THaLightColorPayload =
  | { rgb_color: [number, number, number] }
  | { hs_color: [number, number] }
  | { color_temp_kelvin: number }
  | { rgbw_color: [number, number, number, number] }
  | { rgbww_color: [number, number, number, number, number] };

/** Цветовая предустановка для отображения и передачи в Home Assistant. */
export interface IHaLightColorPreset {
  /** Нормализованный цвет для отображения в RGB. */
  rgb: [number, number, number];
  /** Исходный payload, который передаётся в `light.turn_on`. */
  payload: THaLightColorPayload;
}

/** Ответ WebSocket-метода `config/entity_registry/get`. */
interface IEntityRegistryEntry {
  /** Настройки entity, заданные в реестре Home Assistant. */
  options?: {
    /** Настройки для платформы light. */
    light?: {
      /** Избранные цвета, сохранённые в HA frontend. */
      favorite_colors?: unknown[];
    };
  };
}

const COLOR_TEMP_COUNT = 4;
const DEFAULT_COLOR_TEMP_MIN_K = 2000;
const DEFAULT_COLOR_TEMP_MAX_K = 6500;

/** Цветные пресеты как в HA frontend (`computeDefaultFavoriteColors`) */
const DEFAULT_HA_COLORED_COLORS: [number, number, number][] = [
  [127, 172, 255],
  [215, 150, 255],
  [255, 158, 243],
  [255, 110, 84],
];

const COLOR_MODES = new Set(['hs', 'xy', 'rgb', 'rgbw', 'rgbww']);

function supportsColorMode(attributes: Record<string, unknown> | undefined, mode: string): boolean {
  const modes = attributes?.supported_color_modes;
  return Array.isArray(modes) && modes.includes(mode);
}

/** Поддерживает ли свет цветной режим (для показа пресетов) */
export function lightSupportsColorModes(attributes: Record<string, unknown> | undefined): boolean {
  const modes = attributes?.supported_color_modes;
  if (!Array.isArray(modes) || modes.length === 0) {
    return true;
  }
  return modes.some((mode) => typeof mode === 'string' && COLOR_MODES.has(mode));
}

function supportsColor(attributes: Record<string, unknown> | undefined): boolean {
  const modes = attributes?.supported_color_modes;
  if (!Array.isArray(modes)) return true;
  return modes.some((mode) => typeof mode === 'string' && COLOR_MODES.has(mode));
}

function readKelvinRange(attributes: Record<string, unknown> | undefined): {
  min: number;
  max: number;
} {
  const min =
    typeof attributes?.min_color_temp_kelvin === 'number'
      ? attributes.min_color_temp_kelvin
      : DEFAULT_COLOR_TEMP_MIN_K;
  const max =
    typeof attributes?.max_color_temp_kelvin === 'number'
      ? attributes.max_color_temp_kelvin
      : DEFAULT_COLOR_TEMP_MAX_K;
  if (max <= min) {
    return { min: DEFAULT_COLOR_TEMP_MIN_K, max: DEFAULT_COLOR_TEMP_MAX_K };
  }
  return { min, max };
}

function clampRgb(value: number): number {
  return Math.round(Math.min(255, Math.max(0, value)));
}

function isNumberTuple(value: unknown, length: number): value is number[] {
  return Array.isArray(value) && value.length === length && value.every((item) => typeof item === 'number');
}

function hsToRgb(hue: number, saturation: number): [number, number, number] {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const normalizedSaturation = Math.min(100, Math.max(0, saturation)) / 100;
  const chroma = normalizedSaturation;
  const component = normalizedHue / 60;
  const x = chroma * (1 - Math.abs((component % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (component < 1) [red, green] = [chroma, x];
  else if (component < 2) [red, green] = [x, chroma];
  else if (component < 3) [green, blue] = [chroma, x];
  else if (component < 4) [green, blue] = [x, chroma];
  else if (component < 5) [red, blue] = [x, chroma];
  else [red, blue] = [chroma, x];

  return [clampRgb(red * 255), clampRgb(green * 255), clampRgb(blue * 255)];
}

function kelvinToRgb(kelvin: number): [number, number, number] {
  const temperature = Math.min(40_000, Math.max(1_000, kelvin)) / 100;
  const red = temperature <= 66 ? 255 : 329.698727446 * (temperature - 60) ** -0.1332047592;
  const green =
    temperature <= 66
      ? 99.4708025861 * Math.log(temperature) - 161.1195681661
      : 288.1221695283 * (temperature - 60) ** -0.0755148492;
  let blue: number;
  if (temperature >= 66) {
    blue = 255;
  } else if (temperature <= 19) {
    blue = 0;
  } else {
    blue = 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
  }
  return [clampRgb(red), clampRgb(green), clampRgb(blue)];
}

function normalizeColorPayload(value: unknown): IHaLightColorPreset | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const color = value as Record<string, unknown>;

  if (isNumberTuple(color.rgb_color, 3)) {
    return {
      rgb: [color.rgb_color[0], color.rgb_color[1], color.rgb_color[2]],
      payload: { rgb_color: [color.rgb_color[0], color.rgb_color[1], color.rgb_color[2]] },
    };
  }
  if (isNumberTuple(color.hs_color, 2)) {
    return {
      rgb: hsToRgb(color.hs_color[0], color.hs_color[1]),
      payload: { hs_color: [color.hs_color[0], color.hs_color[1]] },
    };
  }
  if (typeof color.color_temp_kelvin === 'number') {
    return {
      rgb: kelvinToRgb(color.color_temp_kelvin),
      payload: { color_temp_kelvin: color.color_temp_kelvin },
    };
  }
  if (typeof color.color_temp === 'number' && color.color_temp > 0) {
    const colorTempKelvin = Math.round(1_000_000 / color.color_temp);
    return {
      rgb: kelvinToRgb(colorTempKelvin),
      payload: { color_temp_kelvin: colorTempKelvin },
    };
  }
  if (isNumberTuple(color.rgbw_color, 4)) {
    const [red, green, blue, white] = color.rgbw_color;
    return {
      rgb: [clampRgb(red + white), clampRgb(green + white), clampRgb(blue + white)],
      payload: { rgbw_color: [red, green, blue, white] },
    };
  }
  if (isNumberTuple(color.rgbww_color, 5)) {
    const [red, green, blue, coldWhite, warmWhite] = color.rgbww_color;
    return {
      rgb: [
        clampRgb(red + coldWhite + warmWhite),
        clampRgb(green + coldWhite + warmWhite),
        clampRgb(blue + coldWhite + warmWhite),
      ],
      payload: { rgbww_color: [red, green, blue, coldWhite, warmWhite] },
    };
  }
  return undefined;
}

/** RGB текущего цвета из HA-атрибутов (для выделения активного пресета) */
export function extractDisplayRgbFromLightAttributes(
  attributes: Record<string, unknown> | undefined,
): [number, number, number] | undefined {
  if (!attributes) return undefined;

  const normalized = normalizeColorPayload(attributes);
  if (normalized) {
    return normalized.rgb;
  }

  return undefined;
}

/** Нормализует цвета из entity registry Home Assistant. */
export function normalizeHaLightFavoriteColors(colors: unknown[]): IHaLightColorPreset[] {
  return colors
    .map(normalizeColorPayload)
    .filter((preset): preset is IHaLightColorPreset => preset !== undefined);
}

/**
 * Дефолтная палитра как в HA UI (`computeDefaultFavoriteColors`),
 * когда в entity registry ещё нет `favorite_colors`.
 */
export function getDefaultHaLightColorPresets(
  attributes?: Record<string, unknown>,
): IHaLightColorPreset[] {
  const colors: IHaLightColorPreset[] = [];
  const hasColorTemp = supportsColorMode(attributes, 'color_temp');
  const hasColor = supportsColor(attributes);

  if (hasColorTemp) {
    const { min, max } = readKelvinRange(attributes);
    const step = (max - min) / (COLOR_TEMP_COUNT - 1);
    for (let i = 0; i < COLOR_TEMP_COUNT; i += 1) {
      const colorTempKelvin = Math.round(min + step * i);
      colors.push({
        rgb: kelvinToRgb(colorTempKelvin),
        payload: { color_temp_kelvin: colorTempKelvin },
      });
    }
  } else if (hasColor) {
    const step =
      (DEFAULT_COLOR_TEMP_MAX_K - DEFAULT_COLOR_TEMP_MIN_K) / (COLOR_TEMP_COUNT - 1);
    for (let i = 0; i < COLOR_TEMP_COUNT; i += 1) {
      const colorTempKelvin = Math.round(DEFAULT_COLOR_TEMP_MIN_K + step * i);
      const rgb = kelvinToRgb(colorTempKelvin);
      colors.push({
        rgb,
        payload: { rgb_color: rgb },
      });
    }
  }

  if (hasColor) {
    for (const rgb of DEFAULT_HA_COLORED_COLORS) {
      colors.push({
        rgb,
        payload: { rgb_color: rgb },
      });
    }
  }

  return colors;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

/**
 * Читает запись entity registry через `home-assistant-js-websocket`
 * (единый протокол auth/WS, не сырой WebSocket).
 */
async function getEntityRegistryEntry(
  baseUrl: string,
  token: string,
  entityId: string,
): Promise<IEntityRegistryEntry | undefined> {
  const auth = createLongLivedTokenAuth(normalizeBaseUrl(baseUrl), token);
  const connectPromise = createConnection({ auth });
  let connection: Connection | undefined;

  try {
    connection = await withTimeout(
      connectPromise,
      ENTITY_REGISTRY_TIMEOUT_MS,
      'HA entity registry request timed out',
    );
    return await withTimeout(
      connection.sendMessagePromise<IEntityRegistryEntry>({
        type: 'config/entity_registry/get',
        entity_id: entityId,
      }),
      ENTITY_REGISTRY_TIMEOUT_MS,
      'HA entity registry request timed out',
    );
  } catch (error) {
    void connectPromise.then((conn) => conn.close()).catch(() => undefined);
    throw error;
  } finally {
    connection?.close();
  }
}

/** Читает цвета из entity registry, подставляя стандартную палитру при отсутствии избранного. */
export async function fetchHaLightFavoriteColors(
  baseUrl: string,
  token: string,
  entityId: string,
  lightAttributes?: Record<string, unknown>,
): Promise<IHaLightColorPreset[]> {
  if (USE_HA_MOCKS) {
    const mockColors = getMockLightFavoriteColors(entityId);
    const presets = normalizeHaLightFavoriteColors(mockColors);
    return presets.length > 0 ? presets : getDefaultHaLightColorPresets(lightAttributes);
  }

  try {
    const entry = await getEntityRegistryEntry(baseUrl, token, entityId);
    const rawFavorites = entry?.options?.light?.favorite_colors ?? [];
    const presets = normalizeHaLightFavoriteColors(rawFavorites);
    if (presets.length > 0) {
      return presets;
    }
    return getDefaultHaLightColorPresets(lightAttributes);
  } catch {
    // REST может быть ок, а WS registry — нет (нет entity, таймаут). Не валим весь UI устройств.
    return getDefaultHaLightColorPresets(lightAttributes);
  }
}
