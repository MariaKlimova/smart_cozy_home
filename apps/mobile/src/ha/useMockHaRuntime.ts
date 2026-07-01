import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { MOCK_ROOM_TICK_MS } from '@/domain/mockRoomPhysics.const';
import { USE_HA_MOCKS } from '@/ha/haClient';
import { tickMockRoom } from '@/ha/mockRoomSimulator';
import { useHomeStore } from '@/store/homeStore';

/** Запускает интервал симуляции комнаты в mock-режиме */
export function useMockHaRuntime(): void {
  const queryClient = useQueryClient();
  const refresh = useHomeStore((s) => s.refresh);

  useEffect(() => {
    if (!USE_HA_MOCKS) return;

    const invalidateBedroomQueries = () => {
      void queryClient.invalidateQueries({ queryKey: ['bedroom-sensors'] });
      void queryClient.invalidateQueries({ queryKey: ['bedroom-devices'] });
      void refresh({ silent: true });
    };

    tickMockRoom();
    invalidateBedroomQueries();

    const timer = setInterval(() => {
      tickMockRoom();
      invalidateBedroomQueries();
    }, MOCK_ROOM_TICK_MS);

    return () => {
      clearInterval(timer);
    };
  }, [queryClient, refresh]);
}
