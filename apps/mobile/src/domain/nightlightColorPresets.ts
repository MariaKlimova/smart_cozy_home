import type { INightlightColorPreset } from '@/domain/bedroomDevice.typings';

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
