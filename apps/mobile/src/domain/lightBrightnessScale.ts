/** Максимальный порог видимости (оставляет ≥1% хода шкалы) */
export const LIGHT_VISIBLE_MIN_MAX = 99;

/**
 * Зажимает порог видимости в допустимый диапазон helper.
 * @param floor Сырое значение порога (%)
 */
export function clampVisibleMin(floor: number): number {
  if (!Number.isFinite(floor)) {
    return 0;
  }
  return Math.min(LIGHT_VISIBLE_MIN_MAX, Math.max(0, Math.round(floor)));
}

/**
 * Парсит state helper порога видимости.
 * @param raw Строка state из HA
 */
export function parseVisibleMinState(raw: string | undefined): number {
  if (raw === undefined) {
    return 0;
  }
  const parsed = Number.parseFloat(raw);
  return clampVisibleMin(Number.isFinite(parsed) ? parsed : 0);
}

/**
 * Логическая яркость UI/сценария → яркость железа.
 * `0` → выкл (вызывающий код шлёт turn_off); иначе диапазон `[floor, 100]`.
 * @param logicalPct Логический процент 0–100
 * @param visibleMin Порог «свет виден с» (%)
 */
export function mapLogicalToDevicePct(logicalPct: number, visibleMin: number): number {
  if (!Number.isFinite(logicalPct) || logicalPct <= 0) {
    return 0;
  }
  const floor = clampVisibleMin(visibleMin);
  const logical = Math.min(100, Math.max(0, logicalPct));
  return Math.round(floor + (logical / 100) * (100 - floor));
}

/**
 * Яркость железа → логическая яркость для UI.
 * Ниже порога считается минимальной логической (1%), off обрабатывается снаружи.
 * @param devicePct Процент железа 0–100
 * @param visibleMin Порог «свет виден с» (%)
 */
export function mapDeviceToLogicalPct(devicePct: number, visibleMin: number): number {
  if (!Number.isFinite(devicePct) || devicePct <= 0) {
    return 0;
  }
  const floor = clampVisibleMin(visibleMin);
  if (floor >= 100) {
    return 100;
  }
  if (devicePct <= floor) {
    return 1;
  }
  const logical = ((devicePct - floor) / (100 - floor)) * 100;
  return Math.min(100, Math.max(1, Math.round(logical)));
}
