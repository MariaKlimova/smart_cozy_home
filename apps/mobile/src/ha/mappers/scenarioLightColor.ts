import type { TLightColorValue } from '@/domain/lightColor.typings';
import { normalizeHaLightFavoriteColors } from '@/ha/entityRegistry';
import {
  domainColorToHaPayload,
  haPayloadToDomainColor,
} from '@/ha/mappers/lightColorMapper';

/** Дефолтный тёплый цвет ночника для sleep (совпадает с initial в inputs.yaml) */
export const DEFAULT_SLEEP_NIGHTLIGHT_COLOR: TLightColorValue = {
  kind: 'rgb',
  rgb: [242, 145, 61],
};

/** RGB дефолтного цвета для сопоставления с пресетами */
export const DEFAULT_SLEEP_NIGHTLIGHT_DISPLAY_RGB: [number, number, number] = [242, 145, 61];

/** Сериализует domain-цвет в JSON для input_text (HA light.turn_on payload) */
export function serializeScenarioLightColor(color: TLightColorValue): string {
  return JSON.stringify(domainColorToHaPayload(color));
}

/** Результат разбора JSON цвета сценария */
export interface IParsedScenarioLightColor {
  /** Domain-цвет */
  color: TLightColorValue;
  /** RGB для swatch / nearest preset */
  displayRgb: [number, number, number];
}

/** Парсит JSON из input_text.sleep_nightlight_color */
export function parseScenarioLightColor(raw: string): IParsedScenarioLightColor | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const [preset] = normalizeHaLightFavoriteColors([parsed]);
  if (!preset) {
    return null;
  }

  return {
    color: haPayloadToDomainColor(preset.payload),
    displayRgb: preset.rgb,
  };
}
