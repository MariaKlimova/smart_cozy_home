import Healthkit, { AuthorizationRequestStatus, AuthorizationStatus } from '@kingstinct/react-native-healthkit';
import { Platform } from 'react-native';

import { HEALTHKIT_SLEEP_CATEGORY } from '@/health/wearableSleep.const';

/**
 * Запрашивает чтение сна, если система ещё не спрашивала.
 * authorizationStatusFor отражает только запись (sharing), не чтение —
 * для read-only типов он часто sharingDenied даже при выданном доступе.
 */
export async function ensureSleepReadAuthorization(): Promise<'ready' | 'denied' | 'unavailable'> {
  if (Platform.OS !== 'ios') {
    return 'unavailable';
  }

  const available = await Healthkit.isHealthDataAvailableAsync();
  if (!available) {
    return 'unavailable';
  }

  const requestStatus = await Healthkit.getRequestStatusForAuthorization({
    toRead: [HEALTHKIT_SLEEP_CATEGORY],
  });

  if (requestStatus === AuthorizationRequestStatus.shouldRequest) {
    await Healthkit.requestAuthorization({
      toRead: [HEALTHKIT_SLEEP_CATEGORY],
    });

    const statusAfter = await Healthkit.authorizationStatusFor(HEALTHKIT_SLEEP_CATEGORY);
    if (statusAfter === AuthorizationStatus.sharingDenied) {
      return 'denied';
    }
  }

  return 'ready';
}
