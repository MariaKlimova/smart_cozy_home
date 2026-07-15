import type { TBedroomDeviceSlot } from '@/config/bedroomDeviceSlotMapping.typings';
import { isBedroomClimateSliderSlot } from '@/config/bedroomClimateDevices';
import { copy } from '@/copy/ru';
import type { IHaEntityListItem } from '@/ha/entityList';

type TPickerTier = 'recommended' | 'other' | 'skip';

const HUMIDIFIER_PICKER_DOMAINS = new Set(['humidifier', 'switch', 'fan', 'input_boolean']);

function haystack(item: IHaEntityListItem): string {
  return `${item.entityId} ${item.friendlyName} ${item.state}`.toLowerCase();
}

function bedroomScore(text: string): number {
  if (text.includes('bedroom') || text.includes('спальн')) return 2;
  return 0;
}

function classifyClimateSlot(item: IHaEntityListItem, slot: TBedroomDeviceSlot): TPickerTier {
  if (item.domain !== 'climate' && item.domain !== 'water_heater') {
    return 'skip';
  }

  const text = haystack(item);
  let score = bedroomScore(text);

  if (slot === 'air_conditioner') {
    if (
      text.includes('air') ||
      text.includes('cond') ||
      text.includes('конди') ||
      text.includes('split') ||
      text.includes('ac_')
    ) {
      score += 2;
    }
  }

  if (slot === 'ventilation') {
    if (
      text.includes('vent') ||
      text.includes('приточ') ||
      text.includes('recovery') ||
      text.includes('erv') ||
      text.includes('hrv')
    ) {
      score += 2;
    }
  }

  if (slot === 'radiator') {
    if (
      text.includes('radiat') ||
      text.includes('радиат') ||
      text.includes('trv') ||
      text.includes('heat') ||
      text.includes('battery') ||
      text.includes('отоп')
    ) {
      score += 2;
    }
  }

  if (score >= 2) return 'recommended';
  return 'other';
}

function classifyHumidifierSlot(item: IHaEntityListItem): TPickerTier {
  if (!HUMIDIFIER_PICKER_DOMAINS.has(item.domain)) {
    return 'skip';
  }

  const text = haystack(item);
  let score = bedroomScore(text);

  if (text.includes('humid') || text.includes('увлаж') || text.includes('moist')) {
    score += 2;
  }
  if (item.domain === 'humidifier') {
    score += 1;
  }

  if (score >= 2) return 'recommended';
  return 'other';
}

function classifyStrictDomainSlot(
  item: IHaEntityListItem,
  domain: string,
): TPickerTier {
  if (item.domain !== domain) return 'skip';
  const score = bedroomScore(haystack(item));
  if (score >= 2) return 'recommended';
  return 'other';
}

function classifyNightlightSlot(item: IHaEntityListItem): TPickerTier {
  if (item.domain !== 'light') return 'skip';

  const text = haystack(item);
  let score = bedroomScore(text);

  if (
    text.includes('night') ||
    text.includes('ночник') ||
    text.includes('nightlight') ||
    text.includes('lamp')
  ) {
    score += 2;
  }

  if (score >= 2) return 'recommended';
  return 'other';
}

function classifyForSlot(item: IHaEntityListItem, slot: TBedroomDeviceSlot): TPickerTier {
  if (slot === 'humidifier') {
    return classifyHumidifierSlot(item);
  }
  if (isBedroomClimateSliderSlot(slot)) {
    return classifyClimateSlot(item, slot);
  }
  if (slot === 'light') {
    return classifyStrictDomainSlot(item, 'light');
  }
  if (slot === 'nightlight') {
    return classifyNightlightSlot(item);
  }
  if (slot === 'curtains' || slot === 'window') {
    return classifyStrictDomainSlot(item, 'cover');
  }
  return 'skip';
}

export function filterDevicesForSlot(
  items: IHaEntityListItem[],
  slot: TBedroomDeviceSlot,
  searchQuery: string,
): { recommended: IHaEntityListItem[]; other: IHaEntityListItem[] } {
  const q = searchQuery.trim().toLowerCase();
  const pool = q ? items.filter((item) => haystack(item).includes(q)) : items;

  const recommended: IHaEntityListItem[] = [];
  const other: IHaEntityListItem[] = [];

  for (const item of pool) {
    const tier = classifyForSlot(item, slot);
    if (tier === 'skip') continue;
    if (tier === 'recommended') {
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

export function formatDevicePreviewValue(state: string): string {
  const preview = copy.devicePicker.statePreview;

  if (state === 'unavailable' || state === 'unknown') {
    return copy.now.metricsUnavailable;
  }
  if (state === 'on') return preview.on;
  if (state === 'off') return preview.off;
  if (state === 'open') return preview.open;
  if (state === 'closed') return preview.closed;
  const num = Number.parseFloat(state);
  if (!Number.isNaN(num)) return state;
  return state;
}
