import type { IBedroomDeviceUserConfig } from '@/config/bedroomDeviceSlotMapping.typings';
import { isBedroomClimateSliderId } from '@/config/bedroomClimateDevices';
import { resolveBedroomDevices } from '@/config/resolveBedroomDevices';
import type { IBedroomDeviceMapping } from '@/config/homeConfig.typings';
import type { TBedroomDeviceAction } from '@/domain/bedroomDeviceAction.typings';
import {
  callHaService,
  setClimateTemperature,
  setCoverPosition,
  setEntityPower,
  setLightBrightness,
} from '@/ha/haClient';
import { parseEntityDomain } from '@/ha/entityList';

/** Параметры вызова HA-сервиса для устройства спальни */
export interface IBedroomDeviceServiceCall {
  /** Домен HA: light, climate… */
  domain: string;
  /** Имя сервиса */
  service: string;
  /** Тело запроса */
  data: Record<string, unknown>;
}

function findDeviceMapping(
  deviceId: string,
  config: IBedroomDeviceUserConfig | null,
): IBedroomDeviceMapping {
  const mapping = resolveBedroomDevices(config).find((d) => d.id === deviceId);
  if (!mapping) {
    throw new Error(`Unknown bedroom device: ${deviceId}`);
  }
  return mapping;
}

function resolveSliderAction(
  mapping: IBedroomDeviceMapping,
  value: number,
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
    const brightness = Math.round((value / 100) * 255);
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

/** Собирает domain/service/data для управления устройством (для тестов и runtime) */
export function resolveBedroomDeviceServiceCall(
  deviceId: string,
  action: TBedroomDeviceAction,
  config: IBedroomDeviceUserConfig | null = null,
): IBedroomDeviceServiceCall {
  const mapping = findDeviceMapping(deviceId, config);

  if (action.kind === 'slider') {
    return resolveSliderAction(mapping, action.value);
  }
  if (action.kind === 'toggle') {
    return resolveToggleAction(mapping, action.isOn);
  }
  return resolveSegmentAction(mapping, action.optionId);
}

/** Отправляет команду устройству спальни в Home Assistant */
export async function setBedroomDevice(
  deviceId: string,
  action: TBedroomDeviceAction,
  baseUrl: string,
  token: string,
  config: IBedroomDeviceUserConfig | null = null,
): Promise<void> {
  const mapping = findDeviceMapping(deviceId, config);
  const { domain, service, data } = resolveBedroomDeviceServiceCall(deviceId, action, config);

  if (action.kind === 'slider' && mapping.id === 'light') {
    await setLightBrightness(baseUrl, token, mapping.entity, action.value);
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

  await callHaService(baseUrl, token, domain, service, data);
}
