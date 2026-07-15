import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';
import type { TLightColorValue } from '@/domain/lightColor.typings';
import type { IHaLightColorPreset, THaLightColorPayload } from '@/ha/entityRegistry';

/** HA payload → нейтральный domain-цвет */
export function haPayloadToDomainColor(payload: THaLightColorPayload): TLightColorValue {
  if ('rgb_color' in payload) {
    return { kind: 'rgb', rgb: payload.rgb_color };
  }
  if ('hs_color' in payload) {
    return { kind: 'hs', hue: payload.hs_color[0], saturation: payload.hs_color[1] };
  }
  if ('color_temp_kelvin' in payload) {
    return { kind: 'color_temp_kelvin', kelvin: payload.color_temp_kelvin };
  }
  if ('rgbw_color' in payload) {
    return { kind: 'rgbw', rgbw: payload.rgbw_color };
  }
  return { kind: 'rgbww', rgbww: payload.rgbww_color };
}

/** Нейтральный domain-цвет → HA payload для `light.turn_on` */
export function domainColorToHaPayload(color: TLightColorValue): THaLightColorPayload {
  if (color.kind === 'rgb') {
    return { rgb_color: color.rgb };
  }
  if (color.kind === 'hs') {
    return { hs_color: [color.hue, color.saturation] };
  }
  if (color.kind === 'color_temp_kelvin') {
    return { color_temp_kelvin: color.kelvin };
  }
  if (color.kind === 'rgbw') {
    return { rgbw_color: color.rgbw };
  }
  return { rgbww_color: color.rgbww };
}

/** HA-пресеты → domain-пресеты с стабильными id */
export function mapHaLightPresetsToDomain(presets: IHaLightColorPreset[]): INightlightColorPreset[] {
  return presets.map((preset, index) => ({
    id: `color-${index}`,
    displayRgb: preset.rgb,
    color: haPayloadToDomainColor(preset.payload),
  }));
}
