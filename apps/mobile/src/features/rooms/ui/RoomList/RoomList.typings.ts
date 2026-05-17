import type { IRoom } from '@/domain/types';

export interface IRoomListProps {
  /** Комнаты */
  rooms: IRoom[];
  /** Переключить свет */
  onToggleLight: (roomId: string) => void;
}
