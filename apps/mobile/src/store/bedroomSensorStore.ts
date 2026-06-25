import { create } from 'zustand';

import type {
  IBedroomSensorMapping,
  TBedroomSensorSlot,
} from '@/config/bedroomSensorMapping.typings';
import {
  loadBedroomSensorMapping,
  saveBedroomSensorMapping,
} from '@/config/bedroomSensorMappingStorage';
import {
  getActiveBedroomSensorEntityIds,
  resolveBedroomSensors,
} from '@/config/resolveBedroomSensors';

interface IBedroomSensorStore {
  /** Пользовательские привязки */
  overrides: IBedroomSensorMapping | null;
  /** Загрузка из storage завершена */
  hasHydrated: boolean;
  /** Загрузить сохранённые привязки */
  hydrate: () => Promise<void>;
  /** Установить entity для слота; null — «не использовать» */
  setSlot: (slot: TBedroomSensorSlot, entityId: string | null) => Promise<void>;
  /** Пользователь хотя бы раз настраивал датчики */
  isConfigured: () => boolean;
  /** Резолвленный маппинг для HA */
  getResolvedMapping: () => ReturnType<typeof resolveBedroomSensors>;
  /** entity_id для запроса */
  getActiveEntityIds: () => string[];
}

let hydratePromise: Promise<void> | null = null;

export const useBedroomSensorStore = create<IBedroomSensorStore>((set, get) => ({
  overrides: null,
  hasHydrated: false,

  hydrate: () => {
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      const overrides = await loadBedroomSensorMapping();
      set({ overrides, hasHydrated: true });
    })();

    return hydratePromise;
  },

  setSlot: async (slot, entityId) => {
    const prev = get().overrides ?? {};
    const next: IBedroomSensorMapping = { ...prev, [slot]: entityId };
    await saveBedroomSensorMapping(next);
    set({ overrides: next });
  },

  isConfigured: () => {
    const overrides = get().overrides;
    if (!overrides) return false;
    return (
      'temperature' in overrides || 'humidity' in overrides || 'co2' in overrides
    );
  },

  getResolvedMapping: () => resolveBedroomSensors(get().overrides),

  getActiveEntityIds: () => getActiveBedroomSensorEntityIds(get().getResolvedMapping()),
}));

void useBedroomSensorStore.getState().hydrate();
