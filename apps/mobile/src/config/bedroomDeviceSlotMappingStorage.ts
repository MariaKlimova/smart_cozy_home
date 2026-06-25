import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type {
  IBedroomDeviceUserConfig,
  ILegacyBedroomDeviceSlotOverrides,
  TBedroomDeviceSlot,
} from '@/config/bedroomDeviceSlotMapping.typings';

const CONFIG_KEY = 'bedroom_device_config';
const LEGACY_KEYS = ['bedroom_device_mapping', 'bedroom_device_slot_mapping'] as const;

function emptyConfig(): IBedroomDeviceUserConfig {
  return { entities: {}, hiddenSlots: [] };
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteStoredValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function migrateLegacyOverrides(
  legacy: ILegacyBedroomDeviceSlotOverrides,
): IBedroomDeviceUserConfig {
  const config = emptyConfig();

  for (const [slot, value] of Object.entries(legacy)) {
    const key = slot as TBedroomDeviceSlot;
    if (value === null) {
      config.hiddenSlots.push(key);
    } else if (typeof value === 'string' && value.length > 0) {
      config.entities[key] = value;
    }
  }

  return config;
}

function parseConfig(raw: string): IBedroomDeviceUserConfig {
  const parsed = JSON.parse(raw) as IBedroomDeviceUserConfig | ILegacyBedroomDeviceSlotOverrides;

  if (parsed && typeof parsed === 'object' && 'entities' in parsed && 'hiddenSlots' in parsed) {
    return {
      entities: parsed.entities ?? {},
      hiddenSlots: parsed.hiddenSlots ?? [],
    };
  }

  return migrateLegacyOverrides(parsed as ILegacyBedroomDeviceSlotOverrides);
}

export async function loadBedroomDeviceUserConfig(): Promise<IBedroomDeviceUserConfig | null> {
  const current = await getStoredValue(CONFIG_KEY);
  if (current) {
    return parseConfig(current);
  }

  for (const legacyKey of LEGACY_KEYS) {
    const legacy = await getStoredValue(legacyKey);
    if (!legacy) continue;

    const migrated = parseConfig(legacy);
    await saveBedroomDeviceUserConfig(migrated);
    await deleteStoredValue(legacyKey);
    return migrated;
  }

  return null;
}

export async function saveBedroomDeviceUserConfig(config: IBedroomDeviceUserConfig): Promise<void> {
  await setStoredValue(CONFIG_KEY, JSON.stringify(config));
}

export async function clearBedroomDeviceUserConfig(): Promise<void> {
  await deleteStoredValue(CONFIG_KEY);
  for (const legacyKey of LEGACY_KEYS) {
    await deleteStoredValue(legacyKey);
  }
}
