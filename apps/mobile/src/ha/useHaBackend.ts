import { resolveHaBackend } from '@/ha/haBackend';
import type { IHaBackendContext } from '@/ha/haBackend';
import { useConnectionStore } from '@/store/connectionStore';

/** Подключение к HA: готовность и credentials для hooks/UI */
export function useHaBackend(): IHaBackendContext {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const token = useConnectionStore((s) => s.profile?.accessToken);
  return resolveHaBackend(isConnected, baseUrl, token);
}
