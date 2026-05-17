import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { IConnectionProfile } from '@/ha/types';

const PROFILE_KEY = 'ha_connection_profile';

async function setStoredValue(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(PROFILE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(PROFILE_KEY, value);
}

async function getStoredValue(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(PROFILE_KEY) ?? null;
  }
  return SecureStore.getItemAsync(PROFILE_KEY);
}

async function deleteStoredValue(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(PROFILE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(PROFILE_KEY);
}

export async function saveConnectionProfile(profile: IConnectionProfile): Promise<void> {
  await setStoredValue(JSON.stringify(profile));
}

export async function loadConnectionProfile(): Promise<IConnectionProfile | null> {
  const raw = await getStoredValue();
  if (!raw) return null;
  return JSON.parse(raw) as IConnectionProfile;
}

export async function clearConnectionProfile(): Promise<void> {
  await deleteStoredValue();
}
