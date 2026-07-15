import type { TConnectionFailureReason } from '@/domain/connection.typings';
import { classifyHttpStatus, mergeFailureReasons } from '@/domain/connectionFailure';
import type { IConnectionHealth, IConnectionProfile } from '@/ha/types';

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '');
}

const PING_TIMEOUT_MS = 10_000;

function buildTryOrder(profile: IConnectionProfile): string[] {
  const { preferred, localUrl, remoteUrl } = profile;
  const local = localUrl?.trim();
  const remote = remoteUrl?.trim();

  if (preferred === 'local' && local) return [local];
  if (preferred === 'remote' && remote) return [remote];

  const order: string[] = [];
  if (local) order.push(local);
  if (remote) order.push(remote);
  return order;
}

async function pingHa(
  baseUrl: string,
  token: string,
): Promise<{ ok: boolean; failureReason?: TConnectionFailureReason; detail?: string }> {
  const normalized = normalizeUrl(baseUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    const res = await fetch(`${normalized}/api/`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      let bodyPreview = '';
      try {
        bodyPreview = (await res.text()).slice(0, 120);
      } catch {
        bodyPreview = '';
      }
      return {
        ok: false,
        failureReason: classifyHttpStatus(res.status),
        detail: `HTTP ${res.status}${bodyPreview ? `: ${bodyPreview}` : ''}`,
      };
    }

    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const isAbort = error.name === 'AbortError';
    return {
      ok: false,
      failureReason: 'ha_unavailable',
      detail: isAbort
        ? `Таймаут ${PING_TIMEOUT_MS / 1000} с`
        : `${error.name}: ${error.message}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkEndpoint(
  baseUrl: string,
  token: string,
): Promise<IConnectionHealth> {
  const normalized = normalizeUrl(baseUrl);
  const result = await pingHa(normalized, token);

  return {
    ok: result.ok,
    baseUrl: normalized,
    failureReason: result.failureReason,
    error: result.ok ? undefined : result.detail,
  };
}

export async function resolveActiveBaseUrl(
  profile: IConnectionProfile,
): Promise<IConnectionHealth> {
  const tryOrder = buildTryOrder(profile);

  if (tryOrder.length === 0) {
    return {
      ok: false,
      baseUrl: '',
      failureReason: 'no_url',
      error: 'missing_url',
    };
  }

  const failures: { url: string; failureReason: TConnectionFailureReason; error: string }[] = [];

  for (const url of tryOrder) {
    const health = await checkEndpoint(url, profile.accessToken);
    if (health.ok) return health;
    failures.push({
      url,
      failureReason: health.failureReason ?? 'unknown',
      error: health.error ?? 'unknown',
    });
  }

  const fallback = tryOrder[0] ?? '';
  const mergedReason = mergeFailureReasons(failures.map((failure) => failure.failureReason));

  return {
    ok: false,
    baseUrl: fallback ? normalizeUrl(fallback) : '',
    failureReason: mergedReason,
    error:
      failures.length === 1
        ? failures[0].error
        : failures.map((failure) => `${failure.url}: ${failure.error}`).join('; '),
  };
}
