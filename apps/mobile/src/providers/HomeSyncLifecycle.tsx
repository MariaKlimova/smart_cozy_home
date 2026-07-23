import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { USE_HA_MOCKS } from '@/ha/haClient';
import { startEntityStateSubscription } from '@/ha/entityStateSubscription';
import type { IEntityStateSubscriptionHandle } from '@/ha/entityStateSubscription.typings';
import { collectHomeSyncEntityIds } from '@/ha/mappers/domainMapper';
import { useHaBackend } from '@/hooks/useHaBackend';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';

function refreshHomeSilent(): void {
  void useHomeStore.getState().refresh({ silent: true });
}

/**
 * Синхронизация homeStore с HA:
 * - WebSocket subscribeEntities на watched entities (без foreground poll)
 * - AppState → silent refresh как failover после фона + retry WS при сбое connect
 * - mock: WS не открываем (MockHaRuntime уже крутит refresh)
 */
export function HomeSyncLifecycle() {
  const { haReady, baseUrl, token } = useHaBackend();
  const isConnected = useConnectionStore((s) => s.isConnected);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const subscriptionActiveRef = useRef(false);
  const [wsRetryEpoch, setWsRetryEpoch] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackground =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';
      appStateRef.current = nextState;

      if (nextState !== 'active' || !wasBackground) {
        return;
      }

      const { isConnected: connected } = useConnectionStore.getState();
      if (!connected) {
        return;
      }

      refreshHomeSilent();

      if (!USE_HA_MOCKS && !subscriptionActiveRef.current) {
        setWsRetryEpoch((epoch) => epoch + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!haReady) {
      subscriptionActiveRef.current = false;
      return;
    }

    refreshHomeSilent();

    if (USE_HA_MOCKS) {
      return;
    }

    if (!isConnected) {
      subscriptionActiveRef.current = false;
      return;
    }

    let cancelled = false;
    let handle: IEntityStateSubscriptionHandle | null = null;

    void startEntityStateSubscription({
      baseUrl,
      accessToken: token,
      entityIds: collectHomeSyncEntityIds(),
      onWatchedChange: refreshHomeSilent,
    })
      .then((started) => {
        if (cancelled) {
          started.stop();
          return;
        }
        handle = started;
        subscriptionActiveRef.current = true;
      })
      .catch(() => {
        subscriptionActiveRef.current = false;
      });

    return () => {
      cancelled = true;
      subscriptionActiveRef.current = false;
      handle?.stop();
    };
  }, [haReady, isConnected, baseUrl, token, wsRetryEpoch]);

  return null;
}
