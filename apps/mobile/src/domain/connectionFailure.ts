import type { TConnectionFailureReason } from '@/domain/connection.typings';

/** Классифицирует HTTP-ответ health-check */
export function classifyHttpStatus(status: number): TConnectionFailureReason {
  if (status === 401 || status === 403) {
    return 'token_invalid';
  }
  return 'ha_unavailable';
}

/** Объединяет причины с нескольких endpoint — token важнее timeout */
export function mergeFailureReasons(
  reasons: TConnectionFailureReason[],
): TConnectionFailureReason {
  if (reasons.some((reason) => reason === 'token_invalid')) {
    return 'token_invalid';
  }
  if (reasons.some((reason) => reason === 'no_url')) {
    return 'no_url';
  }
  if (reasons.some((reason) => reason === 'ha_unavailable')) {
    return 'ha_unavailable';
  }
  return 'unknown';
}
