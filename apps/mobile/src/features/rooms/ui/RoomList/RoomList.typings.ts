import type { IRoom } from '@/domain/types';

export interface IRoomListProps {
  /** Комнаты */
  rooms: IRoom[];
  /** Открыть экран комнаты */
  onOpenRoom: (roomId: string) => void;
}
