import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  initNetworkReachability,
  setNetworkAvailabilityListener,
} from '@/ha/networkReachability';
import { useConnectionStore } from '@/store/connectionStore';

/** Фоновая подписка на сеть и reconnect при возврате в приложение */
export function ConnectionLifecycle() {
  useEffect(() => {
    setNetworkAvailabilityListener((available) => {
      useConnectionStore.getState().setNetworkAvailable(available);
    });

    const unsubscribeNetInfo = initNetworkReachability((available) => {
      useConnectionStore.getState().setNetworkAvailable(available);
    });

    return () => {
      setNetworkAvailabilityListener(null);
      unsubscribeNetInfo();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        return;
      }
      const { profile, isConnected, isLoading } = useConnectionStore.getState();
      if (profile && !isConnected && !isLoading) {
        void useConnectionStore.getState().retry();
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}
