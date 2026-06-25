import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { IBedroomSensorMapping } from '@/config/bedroomSensorMapping.typings';

const MAPPING_KEY = 'bedroom_sensor_mapping';

async function setStoredValue(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(MAPPING_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(MAPPING_KEY, value);
}

async function getStoredValue(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(MAPPING_KEY) ?? null;
  }
  return SecureStore.getItemAsync(MAPPING_KEY);
}

export async function loadBedroomSensorMapping(): Promise<IBedroomSensorMapping | null> {
  const raw = await getStoredValue();
  if (!raw) return null;
  return JSON.parse(raw) as IBedroomSensorMapping;
}

export async function saveBedroomSensorMapping(mapping: IBedroomSensorMapping): Promise<void> {
  await setStoredValue(JSON.stringify(mapping));
}

export async function clearBedroomSensorMapping(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(MAPPING_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(MAPPING_KEY);
}
