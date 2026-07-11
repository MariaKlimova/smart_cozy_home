import type { TBedroomDeviceAction } from '@/domain/bedroomDeviceAction.typings';
import { parseGentleActionId } from '@/domain/nowSuggestion';

export interface IRunNowDeviceActionParams {
  /** id действия из INowDeviceSuggestion */
  actionId: string;
  /** Принять gentle-уведомление по id */
  acceptGentleNotification: (notificationId: string) => Promise<void>;
  /** Выполнить действие над устройством спальни */
  runBedroomDeviceAction: (deviceId: string, action: TBedroomDeviceAction) => Promise<boolean>;
}

/** Выполняет device primary action на табе «Сейчас» */
export async function runNowDeviceAction(params: IRunNowDeviceActionParams): Promise<boolean> {
  const { actionId, acceptGentleNotification, runBedroomDeviceAction } = params;

  const gentleId = parseGentleActionId(actionId);
  if (gentleId) {
    await acceptGentleNotification(gentleId);
    return true;
  }

  if (actionId === 'bedroom:humidifier:on') {
    return runBedroomDeviceAction('humidifier', { kind: 'toggle', isOn: true });
  }

  if (actionId === 'bedroom:window:open') {
    return runBedroomDeviceAction('window', { kind: 'segment', optionId: 'open' });
  }

  return false;
}
