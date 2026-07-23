import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  type Connection,
  type HassEntities,
  type UnsubscribeFunc,
} from 'home-assistant-js-websocket';

import {
  ENTITY_STATE_CHANGE_DEBOUNCE_MS,
  ENTITY_STATE_WS_CONNECT_TIMEOUT_MS,
  ENTITY_STATE_WS_SETUP_RETRY,
} from '@/ha/entityStateSubscription.const';
import type {
  IEntityStateSubscriptionHandle,
  IEntityStateSubscriptionParams,
} from '@/ha/entityStateSubscription.typings';
import { USE_HA_MOCKS } from '@/ha/haClient';
import { normalizeHaBaseUrl, withHaTimeout } from '@/ha/haWsUtils';
import { maskUrl } from '@/lib/maskSensitive';

export type {
  IEntityStateSubscriptionHandle,
  IEntityStateSubscriptionParams,
} from '@/ha/entityStateSubscription.typings';

/** Снимок state/last_updated только для watched entity_id */
function buildWatchedFingerprint(entities: HassEntities, watchedIds: string[]): string {
  const parts: string[] = [];
  for (const id of watchedIds) {
    const entity = entities[id];
    if (!entity) {
      parts.push(`${id}:missing`);
      continue;
    }
    parts.push(`${id}:${entity.state}:${entity.last_updated}`);
  }
  return parts.join('|');
}

/**
 * Persistent WebSocket + subscribeEntities по watched entities.
 * В mock-режиме не открывает соединение (no-op handle).
 * UI не должен вызывать это напрямую — только lifecycle в providers / ha.
 */
export async function startEntityStateSubscription(
  params: IEntityStateSubscriptionParams,
): Promise<IEntityStateSubscriptionHandle> {
  if (USE_HA_MOCKS) {
    return { stop: () => undefined };
  }

  const watchedIds = [...new Set(params.entityIds.filter((id) => id.trim().length > 0))];
  if (watchedIds.length === 0) {
    return { stop: () => undefined };
  }

  const normalizedUrl = normalizeHaBaseUrl(params.baseUrl);
  const auth = createLongLivedTokenAuth(normalizedUrl, params.accessToken);
  const connectPromise = createConnection({
    auth,
    setupRetry: ENTITY_STATE_WS_SETUP_RETRY,
  });

  let connection: Connection;
  try {
    connection = await withHaTimeout(
      connectPromise,
      ENTITY_STATE_WS_CONNECT_TIMEOUT_MS,
      `HA entity state WS timed out (${maskUrl(normalizedUrl)})`,
    );
  } catch (error) {
    void connectPromise.then((conn) => conn.close()).catch(() => undefined);
    throw error;
  }

  let stopped = false;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let lastFingerprint = '';
  let isFirstEntitiesEvent = true;
  let readyCount = 0;

  const clearDebounce = (): void => {
    if (debounceTimer === undefined) {
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  };

  const scheduleNotify = (): void => {
    clearDebounce();
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      if (stopped) {
        return;
      }
      params.onWatchedChange();
    }, ENTITY_STATE_CHANGE_DEBOUNCE_MS);
  };

  const onReady = (): void => {
    readyCount += 1;
    if (readyCount <= 1) {
      return;
    }
    // После reconnect — REST-refresh на случай пропущенных событий
    scheduleNotify();
  };

  connection.addEventListener('ready', onReady);

  const unsubscribeEntities: UnsubscribeFunc = subscribeEntities(connection, (entities) => {
    if (stopped) {
      return;
    }

    const fingerprint = buildWatchedFingerprint(entities, watchedIds);
    if (isFirstEntitiesEvent) {
      isFirstEntitiesEvent = false;
      lastFingerprint = fingerprint;
      return;
    }

    if (fingerprint === lastFingerprint) {
      return;
    }

    lastFingerprint = fingerprint;
    scheduleNotify();
  });

  return {
    stop: () => {
      if (stopped) {
        return;
      }
      stopped = true;
      clearDebounce();
      connection.removeEventListener('ready', onReady);
      unsubscribeEntities();
      connection.close();
    },
  };
}
