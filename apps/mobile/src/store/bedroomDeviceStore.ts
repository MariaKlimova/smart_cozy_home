import { create } from 'zustand';

import type {
  IBedroomDeviceUserConfig,
  TBedroomDeviceSlot,
} from '@/config/bedroomDeviceSlotMapping.typings';
import {
  loadBedroomDeviceUserConfig,
  saveBedroomDeviceUserConfig,
} from '@/config/bedroomDeviceSlotMappingStorage';
import {
  getActiveBedroomDeviceEntityIds,
  resolveBedroomDevices,
} from '@/config/resolveBedroomDevices';

interface IBedroomDeviceStore {
  /** Пользовательская конфигурация */
  config: IBedroomDeviceUserConfig | null;
  /** Загрузка из storage завершена */
  hasHydrated: boolean;
  /** Загрузить сохранённые настройки */
  hydrate: () => Promise<void>;
  /** Привязать entity к слоту */
  setSlotEntity: (slot: TBedroomDeviceSlot, entityId: string) => Promise<void>;
  /** Показывать слот в списке спальни */
  setSlotVisible: (slot: TBedroomDeviceSlot, visible: boolean) => Promise<void>;
  /** Слот скрыт из списка */
  isSlotHidden: (slot: TBedroomDeviceSlot) => boolean;
  /** Резолвленный маппинг для HA */
  getResolvedDevices: () => ReturnType<typeof resolveBedroomDevices>;
  /** entity_id для запроса */
  getActiveEntityIds: () => string[];
}

let hydratePromise: Promise<void> | null = null;

function withConfig(
  prev: IBedroomDeviceUserConfig | null,
): IBedroomDeviceUserConfig {
  return prev ?? { entities: {}, hiddenSlots: [] };
}

export const useBedroomDeviceStore = create<IBedroomDeviceStore>((set, get) => ({
  config: null,
  hasHydrated: false,

  hydrate: () => {
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      const config = await loadBedroomDeviceUserConfig();
      set({ config, hasHydrated: true });
    })();

    return hydratePromise;
  },

  setSlotEntity: async (slot, entityId) => {
    const prev = withConfig(get().config);
    const next: IBedroomDeviceUserConfig = {
      ...prev,
      entities: { ...prev.entities, [slot]: entityId },
    };
    await saveBedroomDeviceUserConfig(next);
    set({ config: next });
  },

  setSlotVisible: async (slot, visible) => {
    const prev = withConfig(get().config);
    const hiddenSet = new Set(prev.hiddenSlots);

    if (visible) {
      hiddenSet.delete(slot);
    } else {
      hiddenSet.add(slot);
    }

    const next: IBedroomDeviceUserConfig = {
      ...prev,
      hiddenSlots: [...hiddenSet],
    };
    await saveBedroomDeviceUserConfig(next);
    set({ config: next });
  },

  isSlotHidden: (slot) => {
    const config = get().config;
    if (!config) return false;
    return config.hiddenSlots.includes(slot);
  },

  getResolvedDevices: () => resolveBedroomDevices(get().config),

  getActiveEntityIds: () => getActiveBedroomDeviceEntityIds(get().getResolvedDevices()),
}));

void useBedroomDeviceStore.getState().hydrate();
