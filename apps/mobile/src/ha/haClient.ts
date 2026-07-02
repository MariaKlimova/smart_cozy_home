import { runMockScript } from '@/ha/mockScriptRunner';
import {
  applyMockHaService,
  getAllMockEntityStates,
  getMockEntityStates,
  updateMockEntityState,
} from '@/ha/haMockStore';
import type { IHaEntityState } from '@/ha/types';

const FETCH_TIMEOUT_MS = 30_000;

/**
 * Мок-режим HA: данные из scenarioMocks.ts, без сетевых запросов.
 * В test-раннере выключен, чтобы не ломать unit-тесты кастомных entity.
 * Для реального HA: EXPO_PUBLIC_USE_HA_MOCKS=false
 */
export const USE_HA_MOCKS =
  process.env.EXPO_PUBLIC_USE_HA_MOCKS === 'true' ||
  (process.env.EXPO_PUBLIC_USE_HA_MOCKS !== 'false' && process.env.NODE_ENV !== 'test');

/** Можно ли читать/писать HA (реальное подключение или моки) */
export function canUseHaBackend(
  isConnected: boolean,
  baseUrl: string | null | undefined,
  token: string | null | undefined,
): boolean {
  if (USE_HA_MOCKS) return true;
  return Boolean(isConnected && baseUrl && token);
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

type TRawHaState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
};

function mapRawState(e: TRawHaState): IHaEntityState {
  return {
    entityId: e.entity_id,
    state: e.state,
    attributes: e.attributes,
  };
}

function logMockService(domain: string, service: string, data?: Record<string, unknown>): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.info('[HA mock]', `${domain}.${service}`, data ?? {});
  }
}

/** Все состояния entities из HA */
export async function fetchAllEntityStates(
  baseUrl: string,
  token: string,
): Promise<IHaEntityState[]> {
  if (USE_HA_MOCKS) {
    return getAllMockEntityStates();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/api/states`, {
      headers: authHeaders(token),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HA states failed: ${res.status}`);
    }
    const all = (await res.json()) as TRawHaState[];
    return all.map(mapRawState);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchEntityStates(
  baseUrl: string,
  token: string,
  entityIds: string[],
): Promise<IHaEntityState[]> {
  if (entityIds.length === 0) return [];

  if (USE_HA_MOCKS) {
    return getMockEntityStates(entityIds);
  }

  const all = await fetchAllEntityStates(baseUrl, token);
  const idSet = new Set(entityIds);
  return all.filter((e) => idSet.has(e.entityId));
}

export async function callHaService(
  baseUrl: string,
  token: string,
  domain: string,
  service: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (USE_HA_MOCKS) {
    logMockService(domain, service, data);
    applyMockHaService(domain, service, data);
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data ?? {}),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HA service failed: ${res.status}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/** Вызов script.* через стандартный script.turn_on */
export async function runHaScript(
  baseUrl: string,
  token: string,
  scriptEntityId: string,
): Promise<void> {
  if (USE_HA_MOCKS) {
    runMockScript(scriptEntityId);
    logMockService('script', 'turn_on', { entity_id: scriptEntityId });
    return;
  }

  await callHaService(baseUrl, token, 'script', 'turn_on', { entity_id: scriptEntityId });
}

/** Установить option у input_select */
export async function setInputSelectOption(
  baseUrl: string,
  token: string,
  entityId: string,
  option: string,
): Promise<void> {
  await callHaService(baseUrl, token, 'input_select', 'select_option', {
    entity_id: entityId,
    option,
  });
}

/** Записать значение input_number */
export async function setNumberValue(
  baseUrl: string,
  token: string,
  entityId: string,
  value: number,
): Promise<void> {
  if (USE_HA_MOCKS) {
    updateMockEntityState(entityId, String(value));
    logMockService('input_number', 'set_value', { entity_id: entityId, value });
    return;
  }

  await callHaService(baseUrl, token, 'input_number', 'set_value', {
    entity_id: entityId,
    value,
  });
}

/** Вкл/выкл input_boolean */
export async function setBooleanState(
  baseUrl: string,
  token: string,
  entityId: string,
  value: boolean,
): Promise<void> {
  if (USE_HA_MOCKS) {
    updateMockEntityState(entityId, value ? 'on' : 'off');
    logMockService('input_boolean', value ? 'turn_on' : 'turn_off', { entity_id: entityId });
    return;
  }

  const service = value ? 'turn_on' : 'turn_off';
  await callHaService(baseUrl, token, 'input_boolean', service, { entity_id: entityId });
}

/** Записать время input_datetime (только time, без даты) */
export async function setInputDatetime(
  baseUrl: string,
  token: string,
  entityId: string,
  time: string,
): Promise<void> {
  const [hours, minutes] = time.split(':');
  const timeValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;

  if (USE_HA_MOCKS) {
    updateMockEntityState(entityId, timeValue);
    logMockService('input_datetime', 'set_datetime', { entity_id: entityId, time: timeValue });
    return;
  }

  await callHaService(baseUrl, token, 'input_datetime', 'set_datetime', {
    entity_id: entityId,
    time: timeValue,
  });
}

/** Записать значение input_text */
export async function setTextValue(
  baseUrl: string,
  token: string,
  entityId: string,
  value: string,
): Promise<void> {
  if (USE_HA_MOCKS) {
    updateMockEntityState(entityId, value);
    logMockService('input_text', 'set_value', { entity_id: entityId, value });
    return;
  }

  await callHaService(baseUrl, token, 'input_text', 'set_value', {
    entity_id: entityId,
    value,
  });
}

export async function toggleLight(
  baseUrl: string,
  token: string,
  entityId: string,
  turnOn: boolean,
): Promise<void> {
  const service = turnOn ? 'turn_on' : 'turn_off';
  await callHaService(baseUrl, token, 'light', service, { entity_id: entityId });
}

/** Яркость света 0–100 %; при 0 — выключить */
export async function setLightBrightness(
  baseUrl: string,
  token: string,
  entityId: string,
  percent: number,
): Promise<void> {
  if (percent <= 0) {
    await callHaService(baseUrl, token, 'light', 'turn_off', { entity_id: entityId });
    return;
  }
  const brightness = Math.round((percent / 100) * 255);
  await callHaService(baseUrl, token, 'light', 'turn_on', {
    entity_id: entityId,
    brightness,
  });
}

/** Уставка температуры климата */
export async function setClimateTemperature(
  baseUrl: string,
  token: string,
  entityId: string,
  temperature: number,
): Promise<void> {
  await callHaService(baseUrl, token, 'climate', 'set_temperature', {
    entity_id: entityId,
    temperature,
  });
}

/** Позиция штор/окна 0–100 */
export async function setCoverPosition(
  baseUrl: string,
  token: string,
  entityId: string,
  position: number,
): Promise<void> {
  await callHaService(baseUrl, token, 'cover', 'set_cover_position', {
    entity_id: entityId,
    position,
  });
}

/** Вкл/выкл entity с turn_on/turn_off (switch, fan, humidifier…) */
export async function setEntityPower(
  baseUrl: string,
  token: string,
  entityId: string,
  turnOn: boolean,
): Promise<void> {
  const domain = entityId.includes('.') ? entityId.slice(0, entityId.indexOf('.')) : entityId;
  const service = turnOn ? 'turn_on' : 'turn_off';
  await callHaService(baseUrl, token, domain, service, { entity_id: entityId });
}

export async function fetchLogbook(
  baseUrl: string,
  token: string,
  entityIds: string[],
): Promise<{ when: string; name: string; message: string; entity_id?: string }[]> {
  if (USE_HA_MOCKS) {
    return [];
  }

  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    end_time: end.toISOString(),
    start_time: start.toISOString(),
  });
  for (const id of entityIds) {
    params.append('entity', id);
  }

  const res = await fetch(`${baseUrl}/api/logbook?${params.toString()}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}
