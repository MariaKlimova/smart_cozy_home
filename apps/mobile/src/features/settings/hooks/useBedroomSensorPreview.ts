import { useQuery } from '@tanstack/react-query';

import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import { fetchEntityStates } from '@/ha/haClient';
import { formatSensorPreviewValue } from '@/features/settings/lib/sensorPickerFilters';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useConnectionStore } from '@/store/connectionStore';

/** Превью значений выбранных датчиков на экране настройки */
export function useBedroomSensorPreview() {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const token = useConnectionStore((s) => s.profile?.accessToken);
  const getActiveEntityIds = useBedroomSensorStore((s) => s.getActiveEntityIds);
  const overrides = useBedroomSensorStore((s) => s.overrides);

  const entityIds = getActiveEntityIds();

  const query = useQuery({
    queryKey: ['bedroom-sensor-preview', baseUrl, overrides, entityIds],
    enabled: Boolean(isConnected && baseUrl && token && entityIds.length > 0),
    staleTime: 15_000,
    queryFn: async () => {
      const states = await fetchEntityStates(baseUrl!, token!, entityIds);
      const map = new Map(states.map((s) => [s.entityId, s.state]));
      return map;
    },
  });

  function getPreview(slot: TBedroomSensorSlot, entityId: string | null): string | null {
    if (!entityId || !query.data) return null;
    const state = query.data.get(entityId);
    if (state === undefined) return null;
    return formatSensorPreviewValue(slot, state);
  }

  return {
    isLoading: query.isPending,
    getPreview,
  };
}
