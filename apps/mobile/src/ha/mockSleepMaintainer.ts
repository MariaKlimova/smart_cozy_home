import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import {
  SLEEP_CO2_MAINTAIN_BELOW,
  SLEEP_CO2_VENTILATE_ABOVE,
} from '@/domain/sleepAirQuality.const';
import {
  getMockEntitySnapshot,
  readMockBooleanParam,
  readMockNumberParam,
  setMockClimateTemperature,
  setMockCoverPosition,
  setMockEntityPower,
  updateMockEntityState,
} from '@/ha/haMockStore';

const { devices, system, scenarioParams } = HA_ENTITIES;

const CLIMATE_ENTITIES = [
  devices.airConditioner,
  devices.ventilation,
  devices.radiator,
];

/** Фаза цикла поддержания воздуха в режиме «Сон» */
export type TSleepMaintainerPhase = 'ventilating' | 'maintaining';

let sleepMaintainerPhase: TSleepMaintainerPhase | null = null;

function parseCo2Ppm(): number {
  const snapshot = getMockEntitySnapshot(devices.co2);
  if (!snapshot) return 650;
  const value = Number.parseFloat(snapshot.state);
  if (Number.isNaN(value)) return 650;
  return value;
}

function isSleepMaintainerEligible(): boolean {
  const homeMode = getMockEntitySnapshot(system.homeMode)?.state;
  const sleepWindow = readMockBooleanParam(scenarioParams.sleep.window, false);
  const occupancy = getMockEntitySnapshot(devices.occupancy)?.state === 'on';
  return homeMode === 'sleep' && sleepWindow && occupancy;
}

function applyVentilatingPhase(): void {
  const sleepTemp = readMockNumberParam(scenarioParams.sleep.temperature, 17);
  setMockCoverPosition(devices.window, 100);
  setMockEntityPower(devices.humidifier, false);
  setMockEntityPower(devices.airConditioner, false);
  setMockClimateTemperature([devices.ventilation, devices.radiator], sleepTemp);
  setMockClimateTemperature([devices.airConditioner], sleepTemp);
}

function applyMaintainingPhase(): void {
  const sleepTemp = readMockNumberParam(scenarioParams.sleep.temperature, 17);
  setMockCoverPosition(devices.window, 0);
  setMockEntityPower(devices.humidifier, true);
  setMockClimateTemperature(CLIMATE_ENTITIES, sleepTemp);
  const acSnapshot = getMockEntitySnapshot(devices.airConditioner);
  updateMockEntityState(devices.airConditioner, 'heat', {
    ...(acSnapshot?.attributes ?? {}),
    temperature: sleepTemp,
    unit_of_measurement: '°C',
  });
}

function resolveInitialPhase(co2Ppm: number): TSleepMaintainerPhase {
  if (co2Ppm <= SLEEP_CO2_MAINTAIN_BELOW) {
    return 'maintaining';
  }
  return 'ventilating';
}

/** Сброс state machine (выход из режима сна) */
export function resetSleepMaintainer(): void {
  sleepMaintainerPhase = null;
}

/** Текущая фаза maintainer (для тестов) */
export function getSleepMaintainerPhase(): TSleepMaintainerPhase | null {
  return sleepMaintainerPhase;
}

/** Старт цикла после script.sleep — фаза ventilating */
export function startSleepMaintainer(): void {
  sleepMaintainerPhase = 'ventilating';
  applyVentilatingPhase();
}

/** Один шаг state machine — вызывается в начале tickMockRoom */
export function tickSleepMaintainer(): void {
  if (!isSleepMaintainerEligible()) {
    resetSleepMaintainer();
    return;
  }

  if (sleepMaintainerPhase === null) {
    const initialPhase = resolveInitialPhase(parseCo2Ppm());
    sleepMaintainerPhase = initialPhase;
    if (initialPhase === 'ventilating') {
      applyVentilatingPhase();
    } else {
      applyMaintainingPhase();
    }
    return;
  }

  const co2Ppm = parseCo2Ppm();

  if (sleepMaintainerPhase === 'ventilating' && co2Ppm <= SLEEP_CO2_MAINTAIN_BELOW) {
    sleepMaintainerPhase = 'maintaining';
    applyMaintainingPhase();
    return;
  }

  if (sleepMaintainerPhase === 'maintaining' && co2Ppm >= SLEEP_CO2_VENTILATE_ABOVE) {
    sleepMaintainerPhase = 'ventilating';
    applyVentilatingPhase();
  }
}
