import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { IBedroomDeviceUserConfig } from '@/config/bedroomDeviceSlotMapping.typings';

const CONFIG_KEY = 'bedroom_device_config';

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

function parseConfig(raw: string): IBedroomDeviceUserConfig {
  const parsed = JSON.parse(raw) as IBedroomDeviceUserConfig;

  return {
    entities: parsed.entities ?? {},
    hiddenSlots: parsed.hiddenSlots ?? [],
  };
}

export async function loadBedroomDeviceUserConfig(): Promise<IBedroomDeviceUserConfig | null> {
  const current = await getStoredValue(CONFIG_KEY);
  if (!current) {
    return null;
  }

  try {
    return parseConfig(current);
  } catch {
    await deleteStoredValue(CONFIG_KEY);
    return null;
  }
}

export async function saveBedroomDeviceUserConfig(config: IBedroomDeviceUserConfig): Promise<void> {
  await setStoredValue(CONFIG_KEY, JSON.stringify(config));
}

export async function clearBedroomDeviceUserConfig(): Promise<void> {
  await deleteStoredValue(CONFIG_KEY);
}
