import { USE_HA_MOCKS } from '@/ha/haClient';
import { getMockLightFavoriteColors } from '@/ha/haMockStore';
import type { IHaEntityState } from '@/ha/types';

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

const DESIGN_COLOR_HEX = ['#F2913D', '#F6C291', '#FAE5D4', '#FFFFFF', '#86A8F9', '#C691F3', '#F79EF4'];
const DEFAULT_COLOR_TEMPERATURES_KELVIN = [2000, 2700, 4000, 6500];

function clampRgb(value: number): number {
  return Math.round(Math.min(255, Math.max(0, value)));
}

function isNumberTuple(value: unknown, length: number): value is number[] {
  return Array.isArray(value) && value.length === length && value.every((item) => typeof item === 'number');
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
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
    return { rgb: [color.rgb_color[0], color.rgb_color[1], color.rgb_color[2]], payload: { rgb_color: [color.rgb_color[0], color.rgb_color[1], color.rgb_color[2]] } };
  }
  if (isNumberTuple(color.hs_color, 2)) {
    return { rgb: hsToRgb(color.hs_color[0], color.hs_color[1]), payload: { hs_color: [color.hs_color[0], color.hs_color[1]] } };
  }
  if (typeof color.color_temp_kelvin === 'number') {
    return { rgb: kelvinToRgb(color.color_temp_kelvin), payload: { color_temp_kelvin: color.color_temp_kelvin } };
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
    return { rgb: [clampRgb(red + white), clampRgb(green + white), clampRgb(blue + white)], payload: { rgbw_color: [red, green, blue, white] } };
  }
  if (isNumberTuple(color.rgbww_color, 5)) {
    const [red, green, blue, coldWhite, warmWhite] = color.rgbww_color;
    return { rgb: [clampRgb(red + coldWhite + warmWhite), clampRgb(green + coldWhite + warmWhite), clampRgb(blue + coldWhite + warmWhite)], payload: { rgbww_color: [red, green, blue, coldWhite, warmWhite] } };
  }
  return undefined;
}

/** Нормализует цвета из entity registry Home Assistant. */
export function normalizeHaLightFavoriteColors(colors: unknown[]): IHaLightColorPreset[] {
  return colors
    .map(normalizeColorPayload)
    .filter((preset): preset is IHaLightColorPreset => preset !== undefined);
}

/** Стандартная палитра HA при отсутствии избранных цветов в registry. */
export function getDefaultHaLightColorPresets(): IHaLightColorPreset[] {
  const colorTemperatures = DEFAULT_COLOR_TEMPERATURES_KELVIN.map((color_temp_kelvin) => ({
    rgb: kelvinToRgb(color_temp_kelvin),
    payload: { color_temp_kelvin } as THaLightColorPayload,
  }));
  const colors = DESIGN_COLOR_HEX.map((hex) => {
    const rgb = hexToRgb(hex);
    return { rgb, payload: { rgb_color: rgb } as THaLightColorPayload };
  });
  return [...colorTemperatures, ...colors];
}

function toWebSocketUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/api/websocket';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    throw new Error('HA entity registry request failed');
  }
}

async function getEntityRegistryEntry(
  baseUrl: string,
  token: string,
  entityId: string,
): Promise<IEntityRegistryEntry | undefined> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(toWebSocketUrl(baseUrl));
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error('HA entity registry request timed out'));
    }, ENTITY_REGISTRY_TIMEOUT_MS);
    let authenticated = false;

    const finish = (entry?: IEntityRegistryEntry): void => {
      clearTimeout(timer);
      socket.close();
      resolve(entry);
    };
    const fail = (): void => {
      clearTimeout(timer);
      socket.close();
      reject(new Error('HA entity registry request failed'));
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      let message: Record<string, unknown>;
      try {
        message = JSON.parse(event.data) as Record<string, unknown>;
      } catch {
        fail();
        return;
      }
      if (message.type === 'auth_required') {
        socket.send(JSON.stringify({ type: 'auth', access_token: token }));
        return;
      }
      if (message.type === 'auth_ok') {
        authenticated = true;
        socket.send(JSON.stringify({ id: 1, type: 'config/entity_registry/get', entity_id: entityId }));
        return;
      }
      if (message.type === 'auth_invalid' || !authenticated) {
        fail();
        return;
      }
      if (message.id === 1 && message.success === true) {
        finish(message.result as IEntityRegistryEntry);
        return;
      }
      if (message.id === 1) fail();
    };
    socket.onerror = fail;
  });
}

/** Читает цвета из entity registry, подставляя стандартную палитру при отсутствии избранного. */
export async function fetchHaLightFavoriteColors(
  baseUrl: string,
  token: string,
  entityId: string,
): Promise<IHaLightColorPreset[]> {
  if (USE_HA_MOCKS) {
    const mockColors = getMockLightFavoriteColors(entityId);
    const presets = normalizeHaLightFavoriteColors(mockColors);
    return presets.length > 0 ? presets : getDefaultHaLightColorPresets();
  }

  const entry = await getEntityRegistryEntry(baseUrl, token, entityId);
  const presets = normalizeHaLightFavoriteColors(entry?.options?.light?.favorite_colors ?? []);
  return presets.length > 0 ? presets : getDefaultHaLightColorPresets();
}

/** Находит ближайшую предустановку к текущему цвету света. */
export function findNearestHaLightColorPreset(
  state: IHaEntityState,
  presets: IHaLightColorPreset[],
): IHaLightColorPreset | undefined {
  const current = normalizeColorPayload(state.attributes);
  if (!current || presets.length === 0) return undefined;

  return presets.reduce((nearest, preset) => {
    const nearestDistance = nearest.rgb.reduce(
      (sum, component, index) => sum + (component - current.rgb[index]) ** 2,
      0,
    );
    const candidateDistance = preset.rgb.reduce(
      (sum, component, index) => sum + (component - current.rgb[index]) ** 2,
      0,
    );
    return candidateDistance < nearestDistance ? preset : nearest;
  });
}
