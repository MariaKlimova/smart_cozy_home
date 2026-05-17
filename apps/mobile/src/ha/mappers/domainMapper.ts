import { loadRitualsConfig } from '@/config/ritualsConfig';
import type { IHaEntityState } from '@/ha/types';
import type {
  IGentleNotification,
  IPresenceMember,
  IRoom,
  ITimelineEvent,
} from '@/domain/types';

function stateMap(states: IHaEntityState[]): Map<string, IHaEntityState> {
  return new Map(states.map((s) => [s.entityId, s]));
}

export function mapPresence(states: IHaEntityState[]): IPresenceMember[] {
  const config = loadRitualsConfig();
  const map = stateMap(states);
  return config.presence.persons.map((p) => {
    const st = map.get(p.entity);
    const isHome = st?.state === 'home';
    return {
      id: p.entity.replace('person.', ''),
      label: p.label,
      isHome,
    };
  });
}

export function mapRooms(states: IHaEntityState[]): IRoom[] {
  const config = loadRitualsConfig();
  const map = stateMap(states);
  return config.rooms.map((room) => {
    const light = map.get(room.light);
    const climate = room.climate ? map.get(room.climate) : undefined;
    const temp = climate?.attributes?.current_temperature;
    return {
      id: room.id,
      label: room.label,
      lightOn: light?.state === 'on',
      temperature: typeof temp === 'number' ? `${temp}°` : undefined,
    };
  });
}

export function mapTemperature(states: IHaEntityState[]): string | undefined {
  const config = loadRitualsConfig();
  const entity = config.home_state.temperature.entity;
  const st = stateMap(states).get(entity);
  if (!st || st.state === 'unavailable') return undefined;
  const unit = st.attributes?.unit_of_measurement;
  return `${st.state}${unit ?? '°'}`;
}

export function mapLightsSummary(
  states: IHaEntityState[],
): { on: number; total: number } {
  const entities = loadRitualsConfig().home_state.light_summary.entities;
  const map = stateMap(states);
  let on = 0;
  for (const id of entities) {
    if (map.get(id)?.state === 'on') on += 1;
  }
  return { on, total: entities.length };
}

export function mapSecurityStatus(states: IHaEntityState[]): 'ok' | 'attention' {
  const entity = loadRitualsConfig().home_state.security.entity;
  const st = stateMap(states).get(entity);
  if (!st) return 'ok';
  if (st.state === 'triggered' || st.state === 'arming') return 'attention';
  return 'ok';
}

export function mapTimelineFromLogbook(
  entries: Array<{ when: string; message: string; entity_id?: string; name: string }>,
): ITimelineEvent[] {
  return entries.slice(0, 30).map((e, i) => {
    let kind: ITimelineEvent['kind'] = 'generic';
    let ritualId: string | undefined;
    if (e.entity_id?.startsWith('person.') && e.message.toLowerCase().includes('home')) {
      kind = 'presence_home';
    }
    if (e.entity_id === 'input_select.home_mode') {
      kind = 'ritual';
      if (e.message.includes('evening')) ritualId = 'evening';
      if (e.message.includes('sleep')) ritualId = 'sleep';
    }
    return {
      id: `${e.when}-${i}`,
      kind,
      at: e.when,
      message: e.message,
      entityId: e.entity_id,
      ritualId,
    };
  });
}

export function mapGentleNotifications(states: IHaEntityState[]): IGentleNotification[] {
  const config = loadRitualsConfig();
  const map = stateMap(states);
  const result: IGentleNotification[] = [];

  for (const rule of config.gentle_notifications) {
    const light = map.get(rule.light_entity);
    const occupancy = map.get(rule.occupancy_entity);
    const dark = light?.state === 'off';
    const occupied = occupancy?.state === 'on';
    if (dark && occupied) {
      result.push({
        id: rule.id,
        message: rule.message,
        roomId: rule.room_id,
        actionLabel: 'Включить свет',
      });
    }
  }
  return result;
}

export function collectWatchedEntityIds(): string[] {
  const config = loadRitualsConfig();
  const ids = new Set<string>();
  ids.add(config.home_state.temperature.entity);
  ids.add(config.home_state.security.entity);
  for (const e of config.home_state.light_summary.entities) ids.add(e);
  for (const r of config.rooms) {
    ids.add(r.light);
    if (r.climate) ids.add(r.climate);
  }
  for (const p of config.presence.persons) ids.add(p.entity);
  for (const e of config.timeline.entity_watch) ids.add(e);
  for (const n of config.gentle_notifications) {
    ids.add(n.light_entity);
    ids.add(n.occupancy_entity);
  }
  return [...ids];
}
