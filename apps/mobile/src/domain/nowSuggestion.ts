import {
  isEveningTime,
  isMorningTime,
  isNightTime,
} from '@/domain/nightSchedule';
import {
  SLEEP_CO2_NORM_MAX_PPM,
  SLEEP_HUMIDITY_NORM_MIN_PCT,
  isBedroomCo2Elevated,
} from '@/domain/sleepMetricNorms';

import type {
  INowDeviceSuggestionRaw,
  INowEmptySuggestion,
  INowScenarioSuggestion,
  INowSuggestionRaw,
  INowSuggestionBedroomDevice,
  INowSuggestionGentleNotification,
  INowSuggestionInput,
} from './nowSuggestion.typings';

const NONE_SUGGESTION: INowEmptySuggestion = { kind: 'none' };

function findBedroomDevice(
  devices: INowSuggestionBedroomDevice[],
  deviceId: string,
): INowSuggestionBedroomDevice | undefined {
  return devices.find((device) => device.id === deviceId);
}

function isWindowClosed(device: INowSuggestionBedroomDevice | undefined): boolean {
  if (!device || !device.isAvailable || device.control !== 'segmented') {
    return false;
  }
  return device.activeOptionId === 'closed';
}

function isHumidifierOff(device: INowSuggestionBedroomDevice | undefined): boolean {
  if (!device || !device.isAvailable || device.control !== 'toggle') {
    return false;
  }
  return device.isOn === false;
}

function resolveDeviceSuggestion(input: INowSuggestionInput): INowDeviceSuggestionRaw | null {
  const { bedroomReadings, bedroomDevices, gentleNotifications, dismissedGentleNotificationIds, now, nightSchedule } =
    input;
  const isNight = isNightTime(now, nightSchedule);
  const co2Ppm = bedroomReadings.co2Ppm;
  const humidityPct = bedroomReadings.humidityPct;

  const windowDevice = findBedroomDevice(bedroomDevices, 'window');
  if (isBedroomCo2Elevated(co2Ppm) && isWindowClosed(windowDevice)) {
    const messageKey =
      isNight && co2Ppm !== undefined && co2Ppm > SLEEP_CO2_NORM_MAX_PPM
        ? 'stuffyForSleepVentilate'
        : 'slightlyStuffyVentilate';
    return {
      kind: 'device',
      actionId: 'bedroom:window:open',
      messageKey,
      actionLabelKey: 'openWindow',
    };
  }

  const humidifierDevice = findBedroomDevice(bedroomDevices, 'humidifier');
  if (
    humidityPct !== undefined &&
    humidityPct < SLEEP_HUMIDITY_NORM_MIN_PCT &&
    isHumidifierOff(humidifierDevice)
  ) {
    return {
      kind: 'device',
      actionId: 'bedroom:humidifier:on',
      messageKey: 'dryHumidifierOn',
      actionLabelKey: 'turnOnHumidifier',
    };
  }

  const dismissed = new Set(dismissedGentleNotificationIds);
  const gentle = gentleNotifications.find((notification) => !dismissed.has(notification.id));
  if (gentle) {
    return mapGentleToDeviceSuggestion(gentle);
  }

  return null;
}

function mapGentleToDeviceSuggestion(
  notification: INowSuggestionGentleNotification,
): INowDeviceSuggestionRaw {
  return {
    kind: 'device',
    actionId: `gentle:${notification.id}`,
    message: notification.message,
    actionLabel: notification.actionLabel,
    actionLabelKey: notification.actionLabel ? undefined : 'turnOnLight',
  };
}

function resolveScenarioSuggestion(input: INowSuggestionInput): INowScenarioSuggestion | null {
  const { activeScenarioId, preparedScenarioId, now, nightSchedule } = input;
  const active = activeScenarioId ?? 'none';

  if (preparedScenarioId === 'coming_home') {
    return null;
  }

  if (isNightTime(now, nightSchedule) && active !== 'sleep') {
    if (preparedScenarioId === 'sleep') {
      return null;
    }
    return { kind: 'scenario', scenarioId: 'sleep' };
  }

  if (isMorningTime(now, nightSchedule) && active !== 'morning') {
    if (preparedScenarioId === 'morning') {
      return null;
    }
    return { kind: 'scenario', scenarioId: 'morning' };
  }

  if (isEveningTime(now, nightSchedule) && active !== 'evening') {
    if (preparedScenarioId === 'evening') {
      return null;
    }
    return { kind: 'scenario', scenarioId: 'evening' };
  }

  return null;
}

/** Подбирает один primary action для таба «Сейчас» */
export function resolveNowSuggestion(input: INowSuggestionInput): INowSuggestionRaw {
  const deviceSuggestion = resolveDeviceSuggestion(input);
  if (deviceSuggestion) {
    return deviceSuggestion;
  }

  const scenarioSuggestion = resolveScenarioSuggestion(input);
  if (scenarioSuggestion) {
    return scenarioSuggestion;
  }

  return NONE_SUGGESTION;
}

/** id gentle-уведомления из actionId device-предложения */
export function parseGentleActionId(actionId: string): string | null {
  if (!actionId.startsWith('gentle:')) {
    return null;
  }
  return actionId.slice('gentle:'.length);
}

/** id primary device-предложения, поднятого в NowHomeSection (для dedupe) */
export function getPrimaryGentleNotificationId(suggestion: INowSuggestionRaw): string | null {
  if (suggestion.kind !== 'device') {
    return null;
  }
  return parseGentleActionId(suggestion.actionId);
}
