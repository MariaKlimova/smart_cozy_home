import { loadHomeConfig } from '@/config/homeConfig';
import type { IBedroomDeviceMapping } from '@/config/homeConfig.typings';
import type {
  IBedroomDeviceSegmentOption,
  IBedroomDeviceState,
  IBedroomSegmentedValue,
  IBedroomSliderValue,
  IBedroomToggleValue,
} from '@/domain/bedroomDevice.typings';
import type { IHaEntityState } from '@/ha/types';

function stateMap(states: IHaEntityState[]): Map<string, IHaEntityState> {
  return new Map(states.map((s) => [s.entityId, s]));
}

function isUnavailable(state: IHaEntityState | undefined): boolean {
  if (!state) return true;
  return state.state === 'unavailable' || state.state === 'unknown';
}

function mapLightBrightness(state: IHaEntityState, bounds: { min: number; max: number }): number {
  if (state.state === 'off') {
    return bounds.min;
  }
  const brightness = state.attributes?.brightness;
  if (typeof brightness === 'number') {
    const pct = Math.round((brightness / 255) * 100);
    return Math.min(bounds.max, Math.max(bounds.min, pct));
  }
  return bounds.max;
}

function mapClimateTemperature(
  state: IHaEntityState,
  bounds: { min: number; max: number },
): number | undefined {
  const current = state.attributes?.current_temperature;
  if (typeof current === 'number') {
    return Math.min(bounds.max, Math.max(bounds.min, current));
  }
  const parsed = Number.parseFloat(state.state);
  if (!Number.isNaN(parsed)) {
    return Math.min(bounds.max, Math.max(bounds.min, parsed));
  }
  return undefined;
}

function mapCoverPosition(state: IHaEntityState): number | undefined {
  const position = state.attributes?.current_position;
  if (typeof position === 'number') {
    return position;
  }
  if (state.state === 'open') {
    return 100;
  }
  if (state.state === 'closed') {
    return 0;
  }
  return undefined;
}

function findClosestSegment(
  position: number,
  segments: IBedroomDeviceMapping['segments'],
): IBedroomSegmentedValue | undefined {
  if (!segments || segments.length === 0) return undefined;

  let closest = segments[0];
  let minDistance = Math.abs(position - closest.value);

  for (let i = 1; i < segments.length; i += 1) {
    const segment = segments[i];
    const distance = Math.abs(position - segment.value);
    if (distance < minDistance) {
      minDistance = distance;
      closest = segment;
    }
  }

  return { activeOptionId: closest.id };
}

function mapSliderValue(
  mapping: IBedroomDeviceMapping,
  state: IHaEntityState | undefined,
): IBedroomSliderValue | undefined {
  if (!state || isUnavailable(state) || !mapping.slider) {
    return undefined;
  }

  if (mapping.id === 'light') {
    return {
      current: mapLightBrightness(state, mapping.slider),
      unit: '%',
    };
  }

  if (mapping.id === 'climate') {
    const current = mapClimateTemperature(state, mapping.slider);
    if (current === undefined) return undefined;
    const unit = state.attributes?.unit_of_measurement;
    return {
      current,
      unit: typeof unit === 'string' ? unit : '°C',
    };
  }

  const parsed = Number.parseFloat(state.state);
  if (Number.isNaN(parsed)) return undefined;
  return {
    current: Math.min(mapping.slider.max, Math.max(mapping.slider.min, parsed)),
  };
}

function mapToggleValue(state: IHaEntityState | undefined): IBedroomToggleValue | undefined {
  if (!state || isUnavailable(state)) {
    return undefined;
  }
  return { isOn: state.state === 'on' };
}

function mapSegmentedValue(
  mapping: IBedroomDeviceMapping,
  state: IHaEntityState | undefined,
): IBedroomSegmentedValue | undefined {
  if (!state || isUnavailable(state)) {
    return undefined;
  }
  const position = mapCoverPosition(state);
  if (position === undefined) {
    return undefined;
  }
  return findClosestSegment(position, mapping.segments);
}

function toSegmentOptions(
  segments: IBedroomDeviceMapping['segments'],
): IBedroomDeviceSegmentOption[] | undefined {
  if (!segments) return undefined;
  return segments.map((s) => ({ id: s.id, label: s.label }));
}

function mapSingleDevice(
  mapping: IBedroomDeviceMapping,
  states: Map<string, IHaEntityState>,
): IBedroomDeviceState {
  const state = states.get(mapping.entity);
  const available = !isUnavailable(state);

  const base: IBedroomDeviceState = {
    id: mapping.id,
    label: mapping.label,
    control: mapping.control,
    isAvailable: available,
    segmentOptions: toSegmentOptions(mapping.segments),
    slider: mapping.slider,
  };

  if (!available || !state) {
    return base;
  }

  if (mapping.control === 'slider') {
    const value = mapSliderValue(mapping, state);
    if (value) {
      return { ...base, value };
    }
    return base;
  }

  if (mapping.control === 'toggle') {
    const value = mapToggleValue(state);
    if (value) {
      return { ...base, value };
    }
    return base;
  }

  const value = mapSegmentedValue(mapping, state);
  if (value) {
    return { ...base, value };
  }

  return base;
}

/** Собирает domain-состояния устройств спальни из стейтов HA */
export function mapBedroomDevices(states: IHaEntityState[]): IBedroomDeviceState[] {
  const config = loadHomeConfig();
  const map = stateMap(states);
  return config.bedroom_devices.devices.map((device) => mapSingleDevice(device, map));
}

/** entity_id устройств спальни для запроса в HA */
export function collectBedroomDeviceEntityIds(): string[] {
  const devices = loadHomeConfig().bedroom_devices.devices;
  return devices.map((d) => d.entity);
}
