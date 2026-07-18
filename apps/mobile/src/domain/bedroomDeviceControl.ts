import type { IBedroomDeviceUserConfig } from '@/config/bedroomDeviceSlotMapping.typings';
import { isBedroomClimateSliderId } from '@/config/bedroomClimateDevices';
import { getHumidifierEntityCandidates } from '@/config/humidifierEntity';
import { resolveBedroomDevices } from '@/config/resolveBedroomDevices';
import type { IBedroomDeviceMapping } from '@/config/homeConfig.typings';
import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import type { TBedroomDeviceAction } from '@/domain/bedroomDeviceAction.typings';
import type { TLightColorValue } from '@/domain/lightColor.typings';
import {
  mapLogicalToDevicePct,
  clampVisibleMin,
  readVisibleMin,
} from '@/domain/lightBrightnessScale';
import {
  callHaService,
  fetchEntityStates,
  setClimateTemperature,
  setCoverPosition,
  setEntityPower,
  setLightBrightness,
  setLightColorBrightness,
} from '@/ha/haClient';
import { parseEntityDomain } from '@/ha/entityList';
import { domainColorToHaPayload } from '@/ha/mappers/lightColorMapper';
import type { IHaEntityState } from '@/ha/types';

/** Параметры вызова HA-сервиса для устройства спальни */
export interface IBedroomDeviceServiceCall {
  /** Домен HA: light, climate… */
  domain: string;
  /** Имя сервиса */
  service: string;
  /** Тело запроса */
  data: Record<string, unknown>;
}

/** Опции резолва команды устройству */
export interface IResolveBedroomDeviceServiceCallOptions {
  /**
   * Состояния HA для автофолбека увлажнителя и порога видимости света.
   * Если не переданы — выбирается primary / override; порог = 0.
   */
  states?: IHaEntityState[] | null;
  /**
   * Явный порог «свет виден с» (%). Если задан — сильнее states.
   */
  lightVisibleMin?: number;
}

function readLightVisibleMin(
  options?: IResolveBedroomDeviceServiceCallOptions,
): number {
  if (typeof options?.lightVisibleMin === 'number') {
    return clampVisibleMin(options.lightVisibleMin);
  }
  return readVisibleMin(
    HA_ENTITIES.devices.lightVisibleMin,
    (entityId) => options?.states?.find((s) => s.entityId === entityId)?.state,
  );
}

function findDeviceMapping(
  deviceId: string,
  config: IBedroomDeviceUserConfig | null,
  states: IHaEntityState[] | null,
): IBedroomDeviceMapping {
  const mapping = resolveBedroomDevices(config, { states }).find((d) => d.id === deviceId);
  if (!mapping) {
    throw new Error(`Unknown bedroom device: ${deviceId}`);
  }
  return mapping;
}

function resolveSliderAction(
  mapping: IBedroomDeviceMapping,
  value: number,
  lightVisibleMin: number,
): IBedroomDeviceServiceCall {
  if (mapping.control !== 'slider') {
    throw new Error(`Device ${mapping.id} is not a slider`);
  }

  if (mapping.id === 'light') {
    if (value <= 0) {
      return {
        domain: 'light',
        service: 'turn_off',
        data: { entity_id: mapping.entity },
      };
    }
    const devicePct = mapLogicalToDevicePct(value, lightVisibleMin);
    const brightness = Math.round((devicePct / 100) * 255);
    return {
      domain: 'light',
      service: 'turn_on',
      data: { entity_id: mapping.entity, brightness },
    };
  }

  if (isBedroomClimateSliderId(mapping.id)) {
    return {
      domain: 'climate',
      service: 'set_temperature',
      data: { entity_id: mapping.entity, temperature: value },
    };
  }

  throw new Error(`Unsupported slider device: ${mapping.id}`);
}

function resolveToggleAction(
  mapping: IBedroomDeviceMapping,
  isOn: boolean,
): IBedroomDeviceServiceCall {
  if (mapping.control !== 'toggle') {
    throw new Error(`Device ${mapping.id} is not a toggle`);
  }

  const domain = parseEntityDomain(mapping.entity);

  return {
    domain,
    service: isOn ? 'turn_on' : 'turn_off',
    data: { entity_id: mapping.entity },
  };
}

function resolveSegmentAction(
  mapping: IBedroomDeviceMapping,
  optionId: string,
): IBedroomDeviceServiceCall {
  if (mapping.control !== 'segmented') {
    throw new Error(`Device ${mapping.id} is not segmented`);
  }

  const segment = mapping.segments?.find((s) => s.id === optionId);
  if (!segment) {
    throw new Error(`Unknown segment option: ${optionId} for device ${mapping.id}`);
  }

  return {
    domain: 'cover',
    service: 'set_cover_position',
    data: { entity_id: mapping.entity, position: segment.value },
  };
}

function resolveColorLightAction(
  mapping: IBedroomDeviceMapping,
  brightness: number,
  color: TLightColorValue,
): IBedroomDeviceServiceCall {
  if (mapping.control !== 'color_light') {
    throw new Error(`Device ${mapping.id} is not a color light`);
  }

  if (brightness <= 0) {
    return {
      domain: 'light',
      service: 'turn_off',
      data: { entity_id: mapping.entity },
    };
  }

  const brightnessByte = Math.round((brightness / 100) * 255);
  const haColor = domainColorToHaPayload(color);
  return {
    domain: 'light',
    service: 'turn_on',
    data: { entity_id: mapping.entity, brightness: brightnessByte, ...haColor },
  };
}

/** Собирает domain/service/data для управления устройством (для тестов и runtime) */
export function resolveBedroomDeviceServiceCall(
  deviceId: string,
  action: TBedroomDeviceAction,
  config: IBedroomDeviceUserConfig | null = null,
  options?: IResolveBedroomDeviceServiceCallOptions,
): IBedroomDeviceServiceCall {
  const mapping = findDeviceMapping(deviceId, config, options?.states ?? null);

  if (action.kind === 'slider') {
    return resolveSliderAction(mapping, action.value, readLightVisibleMin(options));
  }
  if (action.kind === 'toggle') {
    return resolveToggleAction(mapping, action.isOn);
  }
  if (action.kind === 'segment') {
    return resolveSegmentAction(mapping, action.optionId);
  }
  if (action.kind === 'color_light') {
    return resolveColorLightAction(mapping, action.brightness, action.color);
  }
  throw new Error(`Unsupported bedroom device action: ${action.kind}`);
}

/**
 * Актуальные states кандидатов увлажнителя (не кэш опроса устройств —
 * primary мог стать unavailable с момента последнего poll).
 */
async function loadHumidifierResolveStates(
  baseUrl: string,
  token: string,
  config: IBedroomDeviceUserConfig | null,
): Promise<IHaEntityState[] | null> {
  const candidates = getHumidifierEntityCandidates(config);
  if (candidates.length <= 1) {
    return null;
  }
  return fetchEntityStates(baseUrl, token, candidates);
}

/** Отправляет команду устройству спальни в Home Assistant */
export async function setBedroomDevice(
  deviceId: string,
  action: TBedroomDeviceAction,
  baseUrl: string,
  token: string,
  config: IBedroomDeviceUserConfig | null = null,
): Promise<void> {
  let states: IHaEntityState[] | null = null;
  if (deviceId === 'humidifier') {
    states = await loadHumidifierResolveStates(baseUrl, token, config);
  }
  if (deviceId === 'light' && action.kind === 'slider') {
    states = await fetchEntityStates(baseUrl, token, [HA_ENTITIES.devices.lightVisibleMin]);
  }

  const mapping = findDeviceMapping(deviceId, config, states);

  if (action.kind === 'slider' && mapping.id === 'light') {
    const devicePct = mapLogicalToDevicePct(action.value, readLightVisibleMin({ states }));
    await setLightBrightness(baseUrl, token, mapping.entity, devicePct);
    return;
  }
  if (action.kind === 'slider' && isBedroomClimateSliderId(mapping.id)) {
    await setClimateTemperature(baseUrl, token, mapping.entity, action.value);
    return;
  }
  if (action.kind === 'toggle') {
    await setEntityPower(baseUrl, token, mapping.entity, action.isOn);
    return;
  }
  if (action.kind === 'segment') {
    const segment = mapping.segments?.find((s) => s.id === action.optionId);
    if (!segment) {
      throw new Error(`Unknown segment option: ${action.optionId}`);
    }
    await setCoverPosition(baseUrl, token, mapping.entity, segment.value);
    return;
  }
  if (action.kind === 'color_light') {
    await setLightColorBrightness(
      baseUrl,
      token,
      mapping.entity,
      action.brightness,
      domainColorToHaPayload(action.color),
    );
    return;
  }
  if (action.kind === 'visible_min') {
    throw new Error('visible_min must go through setBedroomLightVisibleMin');
  }

  const { domain, service, data } = resolveBedroomDeviceServiceCall(deviceId, action, config, {
    states,
  });
  await callHaService(baseUrl, token, domain, service, data);
}
