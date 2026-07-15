import {
  getHumidifierEntityCandidates,
  pickHumidifierEntityId,
} from '@/config/humidifierEntity';
import { getMockEntitySnapshot, setMockEntityPower } from '@/ha/haMockStore';

/** Увлажнитель в mock: humidifier.bedroom, иначе switch.bedroom_humidifier (SH-37) */
export function resolveMockHumidifierEntityId(): string {
  return pickHumidifierEntityId(getHumidifierEntityCandidates(null), (entityId) => {
    return getMockEntitySnapshot(entityId)?.state;
  });
}

/** Вкл/выкл резолвнутого mock-увлажнителя */
export function setMockHumidifierPower(turnOn: boolean): void {
  setMockEntityPower(resolveMockHumidifierEntityId(), turnOn);
}

/** Состояние резолвнутого mock-увлажнителя */
export function isMockHumidifierOn(): boolean {
  return getMockEntitySnapshot(resolveMockHumidifierEntityId())?.state === 'on';
}
