import type { IHaEntityState } from '@/ha/types';

const FETCH_TIMEOUT_MS = 30_000;

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

/** Все состояния entities из HA */
export async function fetchAllEntityStates(
  baseUrl: string,
  token: string,
): Promise<IHaEntityState[]> {
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
  const res = await fetch(`${baseUrl}/api/services/${domain}/${service}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data ?? {}),
  });
  if (!res.ok) {
    throw new Error(`HA service failed: ${res.status}`);
  }
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

export async function fetchLogbook(
  baseUrl: string,
  token: string,
  entityIds: string[],
): Promise<Array<{ when: string; name: string; message: string; entity_id?: string }>> {
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
