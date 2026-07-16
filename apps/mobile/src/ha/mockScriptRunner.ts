import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { SCENARIO_DEFINITIONS } from '@/config/scenarios';
import {
  applyMockHaService,
  readMockBooleanParam,
  readMockNumberParam,
  readMockTextParam,
  setMockClimateTemperature,
  setMockCoverPosition,
  setMockLightBrightnessPercent,
  updateMockEntityState,
} from '@/ha/haMockStore';
import { setMockHumidifierPower } from '@/ha/mockHumidifier';
import { resetSleepMaintainer, startSleepMaintainer } from '@/ha/mockSleepMaintainer';
import { domainColorToHaPayload } from '@/ha/mappers/lightColorMapper';
import {
  DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
  parseScenarioLightColor,
  serializeScenarioLightColor,
} from '@/ha/mappers/scenarioLightColor';

const { devices, system, scenarioParams } = HA_ENTITIES;

const CLIMATE_ENTITIES = [
  devices.airConditioner,
  devices.ventilation,
  devices.radiator,
];

const SCRIPT_TO_SCENARIO_ID = new Map<string, string>(
  SCENARIO_DEFINITIONS.map((definition) => [definition.script, definition.id]),
);

function setHomeMode(option: string): void {
  updateMockEntityState(system.homeMode, option);
}

function setPrepared(value: boolean): void {
  updateMockEntityState(system.homeReadyForArrival, value ? 'on' : 'off');
}

function setAllPersonsAway(): void {
  updateMockEntityState('person.maria', 'not_home');
  updateMockEntityState('person.partner', 'not_home');
}

function isDaytime(now: Date = new Date()): boolean {
  const hour = now.getHours();
  return hour >= 6 && hour < 21;
}

function runEveningScript(): void {
  const params = scenarioParams.evening;
  setMockLightBrightnessPercent(devices.nightlight, 0);
  setMockLightBrightnessPercent(
    devices.light,
    readMockNumberParam(params.brightness, 15),
  );

  if (readMockBooleanParam(params.curtains, true)) {
    setMockCoverPosition(devices.curtains, 0);
  }

  setMockClimateTemperature(
    CLIMATE_ENTITIES,
    readMockNumberParam(params.temperature, 18),
  );

  if (readMockBooleanParam(params.humidifier, true)) {
    setMockHumidifierPower(true);
  }

  setHomeMode('evening');
}

function runSleepScript(): void {
  const params = scenarioParams.sleep;
  setMockLightBrightnessPercent(devices.light, 0);
  const nightlightEnabled = readMockBooleanParam(params.nightlight, true);
  const nightlightBrightness = readMockNumberParam(params.nightlightBrightness, 8);
  const colorRaw = readMockTextParam(
    params.nightlightColor,
    serializeScenarioLightColor(DEFAULT_SLEEP_NIGHTLIGHT_COLOR),
  );
  const parsedColor = parseScenarioLightColor(colorRaw);
  const colorData = domainColorToHaPayload(
    parsedColor?.color ?? DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
  ) as Record<string, unknown>;

  setMockLightBrightnessPercent(
    devices.nightlight,
    nightlightEnabled ? nightlightBrightness : 0,
    nightlightEnabled ? colorData : undefined,
  );
  updateMockEntityState(devices.occupancy, 'on');

  const sleepTemp = readMockNumberParam(params.temperature, 17);
  setMockClimateTemperature(CLIMATE_ENTITIES, sleepTemp);

  if (readMockBooleanParam(params.window, false)) {
    startSleepMaintainer();
  } else {
    resetSleepMaintainer();
  }

  setHomeMode('sleep');
}

function runMorningScript(): void {
  const params = scenarioParams.morning;
  resetSleepMaintainer();
  setMockLightBrightnessPercent(devices.nightlight, 0);
  setMockCoverPosition(devices.window, 0);
  setMockLightBrightnessPercent(
    devices.light,
    readMockNumberParam(params.brightness, 80),
  );
  setMockCoverPosition(devices.curtains, 100);
  setMockClimateTemperature(CLIMATE_ENTITIES, 21);
  setHomeMode('morning');
}

function runAwayScript(): void {
  const params = scenarioParams.away;
  setMockLightBrightnessPercent(devices.nightlight, 0);
  setMockLightBrightnessPercent(devices.light, 0);
  applyMockHaService('light', 'turn_off', { entity_id: 'light.living_room' });

  if (readMockBooleanParam(params.curtains, true)) {
    setMockCoverPosition(devices.curtains, 0);
  }

  setMockCoverPosition(devices.window, 0);
  setMockClimateTemperature(
    CLIMATE_ENTITIES,
    readMockNumberParam(params.temperature, 16),
  );
  setMockHumidifierPower(false);
  setPrepared(false);
  setAllPersonsAway();
  setHomeMode('away');
}

function runComingHomeScript(): void {
  const params = scenarioParams.comingHome;
  setMockLightBrightnessPercent(devices.nightlight, 0);
  setMockHumidifierPower(true);
  setMockClimateTemperature(
    CLIMATE_ENTITIES,
    readMockNumberParam(params.temperature, 21),
  );
  setMockLightBrightnessPercent(
    devices.light,
    readMockNumberParam(params.brightness, 60),
  );

  if (isDaytime()) {
    setMockCoverPosition(devices.curtains, 100);
  }

  setPrepared(true);
  setHomeMode('none');
}

function runCozyScript(): void {
  const params = scenarioParams.cozy;
  setMockLightBrightnessPercent(devices.nightlight, 0);
  setMockLightBrightnessPercent(
    devices.light,
    readMockNumberParam(params.brightness, 40),
  );
  setMockCoverPosition(devices.curtains, 0);
  setMockClimateTemperature(
    CLIMATE_ENTITIES,
    readMockNumberParam(params.temperature, 21),
  );
  setMockHumidifierPower(true);
  setHomeMode('cozy');
}

function runFocusScript(): void {
  const params = scenarioParams.focus;
  setMockLightBrightnessPercent(devices.nightlight, 0);
  setMockLightBrightnessPercent(
    devices.light,
    readMockNumberParam(params.brightness, 90),
  );
  setMockCoverPosition(devices.curtains, 100);
  setMockClimateTemperature(
    CLIMATE_ENTITIES,
    readMockNumberParam(params.temperature, 19),
  );
  setHomeMode('focus');
}

const SCENARIO_RUNNERS: Record<string, () => void> = {
  evening: runEveningScript,
  sleep: runSleepScript,
  morning: runMorningScript,
  away: runAwayScript,
  coming_home: runComingHomeScript,
  cozy: runCozyScript,
  focus: runFocusScript,
};

/** Выполнить упрощённый sequence script.* в mock-store */
export function runMockScript(scriptEntityId: string): void {
  const scenarioId = SCRIPT_TO_SCENARIO_ID.get(scriptEntityId);
  if (!scenarioId) {
    return;
  }

  const runner = SCENARIO_RUNNERS[scenarioId];
  runner();
}

/** id сценария по entity script.* */
export function resolveScenarioIdFromScript(scriptEntityId: string): string | undefined {
  return SCRIPT_TO_SCENARIO_ID.get(scriptEntityId);
}
