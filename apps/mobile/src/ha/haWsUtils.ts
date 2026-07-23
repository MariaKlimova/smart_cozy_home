/**
 * Общие helpers для HA WebSocket (entity registry, entity state subscription).
 */

/** Убрать trailing slash у base URL перед createLongLivedTokenAuth */
export function normalizeHaBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

/** Promise.race с clearTimeout — чтобы таймер не висел после resolve/reject */
export async function withHaTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
