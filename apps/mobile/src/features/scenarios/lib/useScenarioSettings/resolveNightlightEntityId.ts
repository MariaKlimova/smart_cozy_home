import type { IBedroomDeviceUserConfig } from '@/config/bedroomDeviceSlotMapping.typings';
import { resolveBedroomDevices } from '@/config/resolveBedroomDevices';
import { getScenarioFieldDefinitions } from '@/config/scenarioSettingsFields';

/** Entity_id ночника, если у сценария есть цветовое поле */
export function resolveNightlightEntityId(
  scenarioId: string,
  bedroomConfig: IBedroomDeviceUserConfig | null,
): string | undefined {
  const needsColorPresets = getScenarioFieldDefinitions(scenarioId).some(
    (field) => field.kind === 'color',
  );
  if (!needsColorPresets) return undefined;

  return resolveBedroomDevices(bedroomConfig).find((device) => device.id === 'nightlight')?.entity;
}
