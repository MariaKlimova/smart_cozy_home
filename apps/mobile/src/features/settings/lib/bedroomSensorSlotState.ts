import type {
  IBedroomSensorMapping,
  TBedroomSensorSlot,
} from '@/config/bedroomSensorMapping.typings';

/** Состояние слота в UI настроек */
export type TBedroomSlotUiState = 'unset' | 'disabled' | 'active';

export function getBedroomSlotUiState(
  overrides: IBedroomSensorMapping | null,
  slot: TBedroomSensorSlot,
): TBedroomSlotUiState {
  if (!overrides || !(slot in overrides)) return 'unset';
  if (overrides[slot] === null) return 'disabled';
  return 'active';
}

export function getBedroomSlotEntityId(
  overrides: IBedroomSensorMapping | null,
  slot: TBedroomSensorSlot,
): string | null {
  if (!overrides || !(slot in overrides)) return null;
  const value = overrides[slot];
  if (value === null || value === undefined) return null;
  return value;
}
