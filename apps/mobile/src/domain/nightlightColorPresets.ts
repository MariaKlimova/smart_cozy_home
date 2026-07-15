import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';
import type { IHaLightColorPreset } from '@/ha/entityRegistry';

/** Преобразует HA-пресеты в domain-пресеты с стабильными id */
export function toNightlightColorPresets(presets: IHaLightColorPreset[]): INightlightColorPreset[] {
  return presets.map((preset, index) => ({
    id: `color-${index}`,
    displayRgb: preset.rgb,
    haColor: preset.payload,
  }));
}

/** Находит id ближайшего пресета по RGB */
export function findNearestNightlightPresetId(
  rgb: [number, number, number] | undefined,
  presets: INightlightColorPreset[],
): string | undefined {
  if (!rgb || presets.length === 0) return undefined;

  let bestId = presets[0].id;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const preset of presets) {
    const distance = preset.displayRgb.reduce(
      (sum, component, index) => sum + (component - rgb[index]) ** 2,
      0,
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = preset.id;
    }
  }

  return bestId;
}

/** RGB текущего цвета из HA-атрибутов (для выделения активного пресета) */
export function extractDisplayRgbFromLightAttributes(
  attributes: Record<string, unknown> | undefined,
): [number, number, number] | undefined {
  if (!attributes) return undefined;

  const rgb = attributes.rgb_color;
  if (Array.isArray(rgb) && rgb.length >= 3 && rgb.every((v) => typeof v === 'number')) {
    return [rgb[0], rgb[1], rgb[2]];
  }

  const hs = attributes.hs_color;
  if (Array.isArray(hs) && hs.length >= 2 && typeof hs[0] === 'number' && typeof hs[1] === 'number') {
    return hsToRgb(hs[0], hs[1]);
  }

  return undefined;
}

function hsToRgb(hue: number, saturation: number): [number, number, number] {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const s = Math.min(100, Math.max(0, saturation)) / 100;
  const c = s;
  const x = c * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (normalizedHue < 60) {
    r = c;
    g = x;
  } else if (normalizedHue < 120) {
    r = x;
    g = c;
  } else if (normalizedHue < 180) {
    g = c;
    b = x;
  } else if (normalizedHue < 240) {
    g = x;
    b = c;
  } else if (normalizedHue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const COLOR_MODES = new Set(['hs', 'xy', 'rgb', 'rgbw', 'rgbww']);

/** Поддерживает ли свет цветной режим (для показа пресетов) */
export function lightSupportsColorModes(attributes: Record<string, unknown> | undefined): boolean {
  const modes = attributes?.supported_color_modes;
  if (!Array.isArray(modes) || modes.length === 0) {
    return true;
  }
  return modes.some((mode) => typeof mode === 'string' && COLOR_MODES.has(mode));
}
