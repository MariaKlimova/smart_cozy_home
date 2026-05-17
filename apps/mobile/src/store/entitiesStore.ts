import { create } from 'zustand';

import {
  filterEntityList,
  groupByDomain,
  mapHaStatesToListItems,
  type IHaEntityListItem,
} from '@/ha/entityList';
import { fetchAllEntityStates } from '@/ha/haClient';
import { useConnectionStore } from '@/store/connectionStore';

interface IEntitiesStore {
  /** Все entities после загрузки */
  items: IHaEntityListItem[];
  /** Идёт загрузка */
  isLoading: boolean;
  /** Ошибка */
  error: string | null;
  /** Загрузить список из HA */
  load: () => Promise<void>;
  /** Отфильтрованные + сгруппированные для SectionList */
  getSections: (searchQuery: string) => { title: string; data: IHaEntityListItem[] }[];
}

export const useEntitiesStore = create<IEntitiesStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  load: async () => {
    const { baseUrl, profile, isConnected } = useConnectionStore.getState();
    if (!isConnected || !baseUrl || !profile) {
      set({ error: 'Нет подключения', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const states = await fetchAllEntityStates(baseUrl, profile.accessToken);
      const items = mapHaStatesToListItems(states);
      set({ items, isLoading: false, error: null });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить список',
      });
    }
  },

  getSections: (searchQuery) => {
    const filtered = filterEntityList(get().items, searchQuery);
    return groupByDomain(filtered).map((g) => ({
      title: g.domain,
      data: g.data,
    }));
  },
}));
