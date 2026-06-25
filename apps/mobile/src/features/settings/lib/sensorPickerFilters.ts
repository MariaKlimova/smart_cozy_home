import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import type { IHaEntityListItem } from '@/ha/entityList';

function haystack(item: IHaEntityListItem): string {
  return `${item.entityId} ${item.friendlyName} ${item.state}`.toLowerCase();
}

function scoreSensorForSlot(item: IHaEntityListItem, slot: TBedroomSensorSlot): number {
  const text = haystack(item);
  if (slot === 'temperature') {
    if (text.includes('temperature') || text.includes('temp')) return 2;
    return 0;
  }
  if (slot === 'humidity') {
    if (text.includes('humidity') || text.includes('moisture')) return 2;
    return 0;
  }
  if (text.includes('co2') || text.includes('carbon_dioxide') || text.includes('air_quality')) {
    return 2;
  }
  return 0;
}

export function filterSensorsForSlot(
  items: IHaEntityListItem[],
  slot: TBedroomSensorSlot,
  searchQuery: string,
): { recommended: IHaEntityListItem[]; other: IHaEntityListItem[] } {
  const q = searchQuery.trim().toLowerCase();
  const sensors = items.filter((item) => item.domain === 'sensor');
  const filtered = q
    ? sensors.filter((item) => haystack(item).includes(q))
    : sensors;

  const recommended: IHaEntityListItem[] = [];
  const other: IHaEntityListItem[] = [];

  for (const item of filtered) {
    if (scoreSensorForSlot(item, slot) > 0) {
      recommended.push(item);
    } else {
      other.push(item);
    }
  }

  const byName = (a: IHaEntityListItem, b: IHaEntityListItem) =>
    a.friendlyName.localeCompare(b.friendlyName, 'ru');

  recommended.sort(byName);
  other.sort(byName);

  return { recommended, other };
}

export function isNumericSensorState(state: string): boolean {
  if (state === 'unavailable' || state === 'unknown') return false;
  return !Number.isNaN(Number.parseFloat(state));
}

export function formatSensorPreviewValue(slot: TBedroomSensorSlot, state: string): string {
  if (state === 'unavailable' || state === 'unknown') return '—';
  const num = Number.parseFloat(state);
  if (Number.isNaN(num)) return state;

  if (slot === 'temperature') return `${Math.round(num)}°`;
  if (slot === 'humidity') return `${Math.round(num)}%`;
  return `${Math.round(num)} ppm`;
}
