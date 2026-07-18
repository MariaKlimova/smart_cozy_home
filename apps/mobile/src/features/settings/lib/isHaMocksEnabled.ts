import { USE_HA_MOCKS } from '@/ha/haClient';

/**
 * Включён ли mock-режим HA.
 * Фасад для `features/settings`: UI не импортирует `haClient` напрямую.
 */
export function isHaMocksEnabled(): boolean {
  return USE_HA_MOCKS;
}
