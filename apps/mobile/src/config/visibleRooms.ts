/** id комнат, видимых в табе «Комнаты». TODO(SH-22): настройка пользователем */
export const VISIBLE_ROOM_IDS = ['bedroom'] as const;

/** id комнаты из VISIBLE_ROOM_IDS */
export type TVisibleRoomId = (typeof VISIBLE_ROOM_IDS)[number];

/** Комната показывается в списке */
export function isVisibleRoomId(id: string): id is TVisibleRoomId {
  return (VISIBLE_ROOM_IDS as readonly string[]).includes(id);
}
