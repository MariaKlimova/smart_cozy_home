import { useMockHaRuntime } from '@/ha/useMockHaRuntime';

/** Фоновая симуляция mock HA (комната + invalidation queries) */
export function MockHaRuntime() {
  useMockHaRuntime();
  return null;
}
