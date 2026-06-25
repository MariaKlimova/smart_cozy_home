import type { TBedroomDeviceSlot } from '@/config/bedroomDeviceSlotMapping.typings';

/** id устройств спальни с уставкой температуры (climate.set_temperature) */
export const BEDROOM_CLIMATE_SLIDER_IDS = [
  'air_conditioner',
  'ventilation',
  'radiator',
] as const;

/** id климатического slider-устройства */
export type TBedroomClimateSliderId = (typeof BEDROOM_CLIMATE_SLIDER_IDS)[number];

export function isBedroomClimateSliderId(deviceId: string): deviceId is TBedroomClimateSliderId {
  return (BEDROOM_CLIMATE_SLIDER_IDS as readonly string[]).includes(deviceId);
}

export function isBedroomClimateSliderSlot(slot: TBedroomDeviceSlot): boolean {
  return isBedroomClimateSliderId(slot);
}
