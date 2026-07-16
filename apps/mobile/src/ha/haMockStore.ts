import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { SCENARIO_MOCKS, type IMockEntitySnapshot } from '@/config/scenarioMocks';
import { buildMockSunSnapshot } from '@/ha/mockSunEntity';
import type { IHaEntityState } from '@/ha/types';

type TMockEntry = IMockEntitySnapshot;

const MOCK_NIGHTLIGHT_FAVORITE_COLORS: unknown[] = [
  { rgb_color: [242, 145, 61] },
  { rgb_color: [246, 194, 145] },
  { rgb_color: [250, 229, 212] },
  { rgb_color: [255, 255, 255] },
  { rgb_color: [134, 168, 249] },
  { rgb_color: [198, 145, 243] },
  { rgb_color: [247, 158, 244] },
];

function cloneEntry(entry: TMockEntry): TMockEntry {
  return {
    state: entry.state,
    attributes: entry.attributes ? { ...entry.attributes } : undefined,
  };
}

function buildInitialStore(): Map<string, TMockEntry> {
  const store = new Map<string, TMockEntry>();
  for (const [entityId, snapshot] of Object.entries(SCENARIO_MOCKS.devices)) {
    store.set(entityId, cloneEntry(snapshot));
  }
  for (const [entityId, snapshot] of Object.entries(SCENARIO_MOCKS.params)) {
    store.set(entityId, cloneEntry(snapshot));
  }
  for (const [entityId, snapshot] of Object.entries(SCENARIO_MOCKS.home)) {
    if (entityId === HA_ENTITIES.system.sun) {
      store.set(entityId, cloneEntry(buildMockSunSnapshot()));
      continue;
    }
    store.set(entityId, cloneEntry(snapshot));
  }
  return store;
}

const mockStore = buildInitialStore();

function getEntry(entityId: string): TMockEntry | undefined {
  return mockStore.get(entityId);
}

function mergeAttributes(
  entityId: string,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const existing = getEntry(entityId)?.attributes ?? {};
  return { ...existing, ...patch };
}

function getLightColorAttributes(data: Record<string, unknown>): Record<string, unknown> {
  const supportedKeys = [
    'rgb_color',
    'hs_color',
    'color_temp_kelvin',
    'rgbw_color',
    'rgbww_color',
  ];
  const attributes: Record<string, unknown> = {};
  for (const key of supportedKeys) {
    if (key in data) attributes[key] = data[key];
  }
  return attributes;
}

/** Обновить state entity в локальном мок-store */
export function updateMockEntityState(
  entityId: string,
  state: string,
  attributes?: Record<string, unknown>,
): void {
  const current = getEntry(entityId);
  mockStore.set(entityId, {
    state,
    attributes: attributes ?? current?.attributes,
  });
}

/** Все мок-состояния в формате haClient */
export function getAllMockEntityStates(): IHaEntityState[] {
  return [...mockStore.entries()].map(([entityId, entry]) => ({
    entityId,
    state: entry.state,
    attributes: entry.attributes ?? {},
  }));
}

function findStaticMockSnapshot(entityId: string): TMockEntry | undefined {
  const snapshot =
    SCENARIO_MOCKS.devices[entityId] ??
    SCENARIO_MOCKS.params[entityId] ??
    SCENARIO_MOCKS.home[entityId];
  if (!snapshot) return undefined;
  return cloneEntry(snapshot);
}

/** Мок-состояния по списку entity_id */
export function getMockEntityStates(entityIds: string[]): IHaEntityState[] {
  return entityIds.map((entityId) => {
    const cached = getEntry(entityId);
    if (cached) {
      return {
        entityId,
        state: cached.state,
        attributes: cached.attributes ?? {},
      };
    }

    const staticSnapshot = findStaticMockSnapshot(entityId);
    if (staticSnapshot) {
      mockStore.set(entityId, staticSnapshot);
      return {
        entityId,
        state: staticSnapshot.state,
        attributes: staticSnapshot.attributes ?? {},
      };
    }

    return {
      entityId,
      state: 'unavailable',
      attributes: {},
    };
  });
}

/** Применить HA service к локальному мок-store (без сети) */
export function applyMockHaService(
  domain: string,
  service: string,
  data?: Record<string, unknown>,
): void {
  if (!data) return;

  const entityId = typeof data.entity_id === 'string' ? data.entity_id : undefined;
  if (!entityId) return;

  if (domain === 'light') {
    if (service === 'turn_off') {
      updateMockEntityState(entityId, 'off', mergeAttributes(entityId, { brightness: 0 }));
      return;
    }
    if (service === 'turn_on') {
      let brightness: number;
      if (typeof data.brightness_pct === 'number') {
        brightness = Math.round((data.brightness_pct / 100) * 255);
      } else if (typeof data.brightness === 'number') {
        brightness = data.brightness;
      } else {
        brightness = (getEntry(entityId)?.attributes?.brightness as number | undefined) ?? 204;
      }
      const brightnessPct =
        typeof data.brightness_pct === 'number'
          ? Math.round(data.brightness_pct)
          : Math.round((brightness / 255) * 100);
      updateMockEntityState(
        entityId,
        'on',
        mergeAttributes(entityId, {
          brightness,
          brightness_pct: brightnessPct,
          ...getLightColorAttributes(data),
        }),
      );
    }
    return;
  }

  if (domain === 'cover') {
    if (service === 'open_cover') {
      setMockCoverPosition(entityId, 100);
      return;
    }
    if (service === 'close_cover') {
      setMockCoverPosition(entityId, 0);
      return;
    }
  }

  if (domain === 'climate' && service === 'set_temperature') {
    const temperature = data.temperature;
    if (typeof temperature !== 'number') return;
    const current = getEntry(entityId);
    const currentTemperature =
      typeof current?.attributes?.current_temperature === 'number'
        ? current.attributes.current_temperature
        : temperature;
    updateMockEntityState(
      entityId,
      current?.state ?? 'heat',
      mergeAttributes(entityId, {
        temperature,
        current_temperature: currentTemperature,
        unit_of_measurement: '°C',
      }),
    );
    return;
  }

  if (domain === 'cover' && service === 'set_cover_position') {
    const position = data.position;
    if (typeof position !== 'number') return;
    const state = position <= 0 ? 'closed' : 'open';
    updateMockEntityState(
      entityId,
      state,
      mergeAttributes(entityId, { current_position: position }),
    );
    return;
  }

  if (service === 'turn_on') {
    updateMockEntityState(entityId, 'on', getEntry(entityId)?.attributes);
    return;
  }

  if (service === 'turn_off') {
    updateMockEntityState(entityId, 'off', getEntry(entityId)?.attributes);
    return;
  }

  if (domain === 'input_select' && service === 'select_option') {
    const option = data.option;
    if (typeof option === 'string') {
      updateMockEntityState(entityId, option, getEntry(entityId)?.attributes);
    }
    return;
  }

  if (domain === 'input_number' && service === 'set_value') {
    const value = data.value;
    if (typeof value === 'number') {
      updateMockEntityState(entityId, String(value), getEntry(entityId)?.attributes);
    }
    return;
  }

  if (domain === 'input_datetime' && service === 'set_datetime') {
    const time = data.time;
    if (typeof time === 'string') {
      updateMockEntityState(entityId, time, getEntry(entityId)?.attributes);
    }
    return;
  }

  if (domain === 'input_text' && service === 'set_value') {
    const value = data.value;
    if (typeof value === 'string') {
      updateMockEntityState(entityId, value, getEntry(entityId)?.attributes);
    }
  }
}

/** Сбросить мок-store к дефолтам (для тестов) */
export function resetMockEntityStore(): void {
  mockStore.clear();
  for (const [entityId, snapshot] of buildInitialStore()) {
    mockStore.set(entityId, snapshot);
  }
}

/** Прочитать state entity из мок-store */
export function getMockEntitySnapshot(
  entityId: string,
): { state: string; attributes: Record<string, unknown> } | undefined {
  const entry = getEntry(entityId);
  if (!entry) return undefined;
  return { state: entry.state, attributes: entry.attributes ?? {} };
}

/** Мок-избранное из entity registry для light. */
export function getMockLightFavoriteColors(entityId: string): unknown[] {
  if (entityId !== HA_ENTITIES.devices.nightlight) return [];
  return MOCK_NIGHTLIGHT_FAVORITE_COLORS.map((color) => ({ ...(color as Record<string, unknown>) }));
}

/** Прочитать input_number из мок-store */
export function readMockNumberParam(entityId: string, fallback: number): number {
  const entry = getEntry(entityId);
  if (!entry) return fallback;
  const value = Number.parseFloat(entry.state);
  if (Number.isNaN(value)) return fallback;
  return value;
}

/** Прочитать input_boolean из мок-store */
export function readMockBooleanParam(entityId: string, fallback = false): boolean {
  const entry = getEntry(entityId);
  if (!entry) return fallback;
  return entry.state === 'on';
}

/** Прочитать input_text из мок-store */
export function readMockTextParam(entityId: string, fallback: string): string {
  const entry = getEntry(entityId);
  if (!entry) return fallback;
  return entry.state;
}

/** Яркость света 0–100 %; опционально цвет для light.turn_on */
export function setMockLightBrightnessPercent(
  entityId: string,
  percent: number,
  colorData?: Record<string, unknown>,
): void {
  if (percent <= 0) {
    updateMockEntityState(entityId, 'off', mergeAttributes(entityId, { brightness: 0, brightness_pct: 0 }));
    return;
  }
  const brightness = Math.round((percent / 100) * 255);
  updateMockEntityState(
    entityId,
    'on',
    mergeAttributes(entityId, {
      brightness,
      brightness_pct: Math.round(percent),
      ...getLightColorAttributes(colorData ?? {}),
    }),
  );
}

/** Позиция штор/окна 0–100 */
export function setMockCoverPosition(entityId: string, position: number): void {
  const state = position <= 0 ? 'closed' : 'open';
  updateMockEntityState(
    entityId,
    state,
    mergeAttributes(entityId, { current_position: position }),
  );
}

/** Уставка температуры на нескольких climate entity */
export function setMockClimateTemperature(entityIds: string[], temperature: number): void {
  for (const entityId of entityIds) {
    const current = getEntry(entityId);
    const currentTemperature =
      typeof current?.attributes?.current_temperature === 'number'
        ? current.attributes.current_temperature
        : temperature;
    updateMockEntityState(
      entityId,
      current?.state ?? 'heat',
      mergeAttributes(entityId, {
        temperature,
        current_temperature: currentTemperature,
        unit_of_measurement: '°C',
      }),
    );
  }
}

/** Вкл/выкл entity через turn_on/turn_off */
export function setMockEntityPower(entityId: string, turnOn: boolean): void {
  updateMockEntityState(entityId, turnOn ? 'on' : 'off', getEntry(entityId)?.attributes);
}
