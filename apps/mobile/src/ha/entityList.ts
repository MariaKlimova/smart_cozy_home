import type { IHaEntityState } from '@/ha/types';

/** Элемент списка entities для экрана настройщика */
export interface IHaEntityListItem {
  /** entity_id, например light.kitchen */
  entityId: string;
  /** Домен: light, sensor, person… */
  domain: string;
  /** Текущее state */
  state: string;
  /** Человекочитаемое имя из attributes */
  friendlyName: string;
}

export function parseEntityDomain(entityId: string): string {
  const dot = entityId.indexOf('.');
  if (dot === -1) return entityId;
  return entityId.slice(0, dot);
}

export function mapHaStatesToListItems(states: IHaEntityState[]): IHaEntityListItem[] {
  return states
    .map((s) => {
      const friendly =
        typeof s.attributes.friendly_name === 'string'
          ? s.attributes.friendly_name
          : s.entityId;
      return {
        entityId: s.entityId,
        domain: parseEntityDomain(s.entityId),
        state: s.state,
        friendlyName: friendly,
      };
    })
    .sort((a, b) => a.entityId.localeCompare(b.entityId, 'ru'));
}

export function groupByDomain(
  items: IHaEntityListItem[],
): Array<{ domain: string; data: IHaEntityListItem[] }> {
  const map = new Map<string, IHaEntityListItem[]>();
  for (const item of items) {
    const list = map.get(item.domain) ?? [];
    list.push(item);
    map.set(item.domain, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ru'))
    .map(([domain, data]) => ({ domain, data }));
}

export function filterEntityList(
  items: IHaEntityListItem[],
  query: string,
): IHaEntityListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.entityId.toLowerCase().includes(q) ||
      item.friendlyName.toLowerCase().includes(q) ||
      item.domain.toLowerCase().includes(q),
  );
}
