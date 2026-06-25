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
import { loadHomeConfig } from '@/config/homeConfig';
import { useConnectionStore } from '@/store/connectionStore';

interface IHomeStore {
  /** Сводное состояние дома из StateEngine; null до первого успешного sync */
  homeState: IHomeState | null;
  /** Список ритуалов из domain/config (без привязки к HA в UI) */
  rituals: IRitual[];
  /** Комнаты с освещением, замапленные из entity states */
  rooms: IRoom[];
  /** Кто дома / вне дома по person-сущностям */
  presence: IPresenceMember[];
  /** События дня для вкладки «День», из logbook HA */
  timeline: ITimelineEvent[];
  /** Активные мягкие уведомления (например, «в комнате темно») */
  gentleNotifications: IGentleNotification[];
  /** ID скрытых мягких уведомлений (общие для всех табов) */
  dismissedGentleNotificationIds: string[];
  /** Идёт запрос refresh к Home Assistant */
  isRefreshing: boolean;
  /** Диагностика последней синхронизации для экрана настроек */
  syncDebug: IHomeSyncDebug;
  /** Загрузить состояния сущностей и пересобрать доменные срезы; false при ошибке или offline */
  refresh: () => Promise<boolean>;
  /** Переключить свет в комнате по domain room id */
  toggleRoomLight: (roomId: string) => Promise<void>;
  /** Принять мягкое уведомление (включить свет по правилу из config) */
  acceptGentleNotification: (notificationId: string) => Promise<void>;
  /** Скрыть мягкое уведомление без действия */
  dismissGentleNotification: (notificationId: string) => void;
}

function buildStatePreview(
  states: { entityId: string; state: string }[],
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
  dismissedGentleNotificationIds: [],
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

      const config = loadHomeConfig();
      const logbook = await fetchLogbook(
        baseUrl,
        profile.accessToken,
        config.timeline.entity_watch,
      );
      const timeline = mapTimelineFromLogbook(logbook);
      const gentleNotifications = mapGentleNotifications(states);
      const activeNotificationIds = new Set(gentleNotifications.map((n) => n.id));
      const dismissedGentleNotificationIds = get().dismissedGentleNotificationIds.filter((id) =>
        activeNotificationIds.has(id),
      );

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
        dismissedGentleNotificationIds,
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

    const config = loadHomeConfig();
    const mapping = config.rooms.find((r) => r.id === roomId);
    if (!mapping) return;

    try {
      await toggleLight(baseUrl, profile.accessToken, mapping.light, !room.lightOn);
      await get().refresh();
    } catch {
      // Свет или entity из конфига могут отсутствовать в HA — не роняем UI
    }
  },

  acceptGentleNotification: async (notificationId) => {
    const { baseUrl, profile, isConnected } = useConnectionStore.getState();
    if (!isConnected || !baseUrl || !profile) return;

    const rule = loadHomeConfig().gentle_notifications.find((n) => n.id === notificationId);
    if (!rule) return;

    try {
      await toggleLight(baseUrl, profile.accessToken, rule.light_entity, true);
      await get().refresh();
      get().dismissGentleNotification(notificationId);
    } catch {
      // entity недоступен — оставляем карточку, без uncaught rejection
    }
  },

  dismissGentleNotification: (notificationId) => {
    const { dismissedGentleNotificationIds } = get();
    if (dismissedGentleNotificationIds.includes(notificationId)) return;
    set({ dismissedGentleNotificationIds: [...dismissedGentleNotificationIds, notificationId] });
  },
}));
