/** Минимальный снимок NetInfo без импорта native-модуля */
interface INetInfoStateSnapshot {
  /** Есть ли подключение к сети */
  isConnected?: boolean | null;
  /** Доступен ли интернет */
  isInternetReachable?: boolean | null;
}

/** Модуль NetInfo, если native-слой доступен */
interface INetInfoModule {
  /** Текущее состояние сети */
  fetch: () => Promise<INetInfoStateSnapshot>;
  /** Подписка на изменения */
  addEventListener: (listener: (state: INetInfoStateSnapshot) => void) => () => void;
}

/** Нет сети — не начинаем HA-запрос */
export class NetworkUnavailableError extends Error {
  constructor(message = 'network_unavailable') {
    super(message);
    this.name = 'NetworkUnavailableError';
  }
}

/** Последнее известное состояние сети (обновляет store через ConnectionLifecycle) */
let cachedNetworkAvailable: boolean | null = null;

/** Подписка store/lifecycle на события сети из haFetch (без NetInfo) */
let networkAvailabilityListener: ((available: boolean | null) => void) | null = null;

function resolveNetworkAvailable(state: INetInfoStateSnapshot): boolean | null {
  if (state.isInternetReachable !== null && state.isInternetReachable !== undefined) {
    return state.isInternetReachable;
  }
  if (state.isConnected !== null && state.isConnected !== undefined) {
    return state.isConnected;
  }
  return null;
}

/** Подписка lifecycle на события сети из haFetch (без NetInfo) */
export function setNetworkAvailabilityListener(
  listener: ((available: boolean | null) => void) | null,
): void {
  networkAvailabilityListener = listener;
}

/** Сообщить, что сеть пропала (ошибка fetch на устройстве) */
export function reportNetworkLost(): void {
  setCachedNetworkAvailable(false);
  networkAvailabilityListener?.(false);
}

/** Сообщить, что сеть снова есть (успешный HA-запрос) */
export function reportNetworkRestored(): void {
  setCachedNetworkAvailable(true);
  networkAvailabilityListener?.(true);
}

/**
 * Ошибка похожа на отсутствие сети на устройстве (не таймаут до HA).
 * На iOS без сети fetch часто сразу: TypeError Network request failed.
 */
export function isLikelyOfflineFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'NetworkUnavailableError') {
    return true;
  }
  const message = error.message.toLowerCase();
  if (message.includes('network request failed')) {
    return true;
  }
  if (message.includes('failed to fetch')) {
    return true;
  }
  if (message.includes('offline')) {
    return true;
  }
  if (message.includes('the internet connection appears to be offline')) {
    return true;
  }
  return false;
}

function isNetInfoNativeAvailable(): boolean {
  try {
    // Lazy require: unit-тесты не тянут react-native через haClient.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NativeModules } = require('react-native') as {
      NativeModules: { RNCNetInfo?: unknown };
    };
    return NativeModules.RNCNetInfo != null;
  } catch {
    return false;
  }
}

function loadNetInfoModule(): INetInfoModule | null {
  if (!isNetInfoNativeAvailable()) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('@react-native-community/netinfo') as { default?: INetInfoModule };
    return module.default ?? null;
  } catch {
    return null;
  }
}

/** Синхронизировать кеш для быстрой проверки перед HA-запросами */
export function setCachedNetworkAvailable(available: boolean | null): void {
  cachedNetworkAvailable = available;
}

/** Одноразовый опрос сети (null = неизвестно / NetInfo недоступен) */
async function fetchNetworkAvailable(): Promise<boolean | null> {
  const NetInfo = loadNetInfoModule();
  if (!NetInfo) {
    return null;
  }

  try {
    const state = await NetInfo.fetch();
    return resolveNetworkAvailable(state);
  } catch {
    return null;
  }
}

/**
 * Бросает NetworkUnavailableError, если сеть заведомо недоступна.
 * Кеш / живой NetInfo; если оба неизвестны — пропускаем (таймаут HA решит).
 */
export async function ensureNetworkAvailable(): Promise<void> {
  if (cachedNetworkAvailable === false) {
    throw new NetworkUnavailableError();
  }

  const live = await fetchNetworkAvailable();
  if (live === false) {
    cachedNetworkAvailable = false;
    throw new NetworkUnavailableError();
  }
  if (live === true) {
    cachedNetworkAvailable = true;
  }
}

/** Подписка на доступность сети; возвращает unsubscribe */
export function initNetworkReachability(
  onChange: (available: boolean | null) => void,
): () => void {
  const NetInfo = loadNetInfoModule();

  if (!NetInfo) {
    return () => undefined;
  }

  let unsubscribe: (() => void) | undefined;

  try {
    unsubscribe = NetInfo.addEventListener((state) => {
      const available = resolveNetworkAvailable(state);
      setCachedNetworkAvailable(available);
      onChange(available);
    });

    void NetInfo.fetch()
      .then((state) => {
        const available = resolveNetworkAvailable(state);
        setCachedNetworkAvailable(available);
        onChange(available);
      })
      .catch(() => {
        // Native недоступен — оставляем null, HA ping / fetch error решат.
      });
  } catch {
    return () => undefined;
  }

  return () => {
    unsubscribe?.();
  };
}
