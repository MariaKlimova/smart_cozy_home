import { create } from 'zustand';

import { computeHomeState } from '@/domain/stateEngine';
import { listRituals } from '@/domain/ritualRunner';
import { createEmptySyncDebug, type IHomeSyncDebug } from '@/domain/syncDebug';
import type {
  IGentleNotification,
  IHomeState,
  IPresenceMember,
  IRitual,
  IRoom,
  ITimelineEvent,
} from '@/domain/types';
import { fetchEntityStates, fetchLogbook, toggleLight } from '@/ha/haClient';
import {
  collectWatchedEntityIds,
  mapGentleNotifications,
  mapLightsSummary,
  mapPresence,
  mapRooms,
  mapSecurityStatus,
  mapTemperature,
  mapTimelineFromLogbook,
} from '@/ha/mappers/domainMapper';
import { loadRitualsConfig } from '@/config/ritualsConfig';
import { useConnectionStore } from '@/store/connectionStore';

interface IHomeStore {
  homeState: IHomeState | null;
  rituals: IRitual[];
  rooms: IRoom[];
  presence: IPresenceMember[];
  timeline: ITimelineEvent[];
  gentleNotifications: IGentleNotification[];
  isRefreshing: boolean;
  syncDebug: IHomeSyncDebug;
  refresh: () => Promise<boolean>;
  toggleRoomLight: (roomId: string) => Promise<void>;
}

function buildStatePreview(
  states: Array<{ entityId: string; state: string }>,
  limit = 8,
): string[] {
  return states.slice(0, limit).map((s) => `${s.entityId} → ${s.state}`);
}

export const useHomeStore = create<IHomeStore>((set, get) => ({
  homeState: null,
  rituals: listRituals(),
  rooms: [],
  presence: [],
  timeline: [],
  gentleNotifications: [],
  isRefreshing: false,
  syncDebug: createEmptySyncDebug(),

  refresh: async () => {
    const { baseUrl, profile, isConnected } = useConnectionStore.getState();
    if (!isConnected || !baseUrl || !profile) {
      set({
        syncDebug: {
          ...get().syncDebug,
          lastError: 'Нет подключения к Home Assistant',
        },
      });
      return false;
    }

    set({ isRefreshing: true });

    try {
      const entityIds = collectWatchedEntityIds();
      const states = await fetchEntityStates(baseUrl, profile.accessToken, entityIds);
      const receivedIds = new Set(states.map((s) => s.entityId));
      const missingEntityIds = entityIds.filter((id) => !receivedIds.has(id));

      const presence = mapPresence(states);
      const rooms = mapRooms(states);
      const temperature = mapTemperature(states);
      const lights = mapLightsSummary(states);
      const securityStatus = mapSecurityStatus(states);
      const hour = new Date().getHours();

      const homeState = computeHomeState({
        hour,
        presence,
        temperature,
        lightsOnCount: lights.on,
        lightsTotal: lights.total,
        securityStatus,
      });

      const config = loadRitualsConfig();
      const logbook = await fetchLogbook(
        baseUrl,
        profile.accessToken,
        config.timeline.entity_watch,
      );
      const timeline = mapTimelineFromLogbook(logbook);
      const gentleNotifications = mapGentleNotifications(states);

      const syncDebug: IHomeSyncDebug = {
        lastSyncAt: new Date().toISOString(),
        lastError: null,
        entitiesRequested: entityIds.length,
        entitiesReceived: states.length,
        missingEntityIds,
        timelineEvents: timeline.length,
        logbookEntries: logbook.length,
        statePreview: buildStatePreview(states),
      };

      set({
        homeState,
        rooms,
        presence,
        timeline,
        gentleNotifications,
        syncDebug,
        isRefreshing: false,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({
        syncDebug: {
          ...get().syncDebug,
          lastError: message,
        },
        isRefreshing: false,
      });
      return false;
    }
  },

  toggleRoomLight: async (roomId) => {
    const { baseUrl, profile, isConnected } = useConnectionStore.getState();
    if (!isConnected || !baseUrl || !profile) return;

    const room = get().rooms.find((r) => r.id === roomId);
    if (!room) return;

    const config = loadRitualsConfig();
    const mapping = config.rooms.find((r) => r.id === roomId);
    if (!mapping) return;

    await toggleLight(baseUrl, profile.accessToken, mapping.light, !room.lightOn);
    await get().refresh();
  },
}));
