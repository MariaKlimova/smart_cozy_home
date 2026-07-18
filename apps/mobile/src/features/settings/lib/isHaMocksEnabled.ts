import { USE_HA_MOCKS } from '@/ha/haClient';

/** Включён ли mock-режим HA (для диагностики в настройках) */
export function isHaMocksEnabled(): boolean {
  return USE_HA_MOCKS;
}
