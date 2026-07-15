/** Локальные константы элемента */
export const BEDROOM_DEVICE_CONTROLS_CARD_NAME = 'BedroomDeviceControlsCard' as const;

/** Пока HA не подтвердил state, не синкаем remote (REST часто отстаёт от call_service) */
export const STALE_REMOTE_IGNORE_MS = 8_000;
