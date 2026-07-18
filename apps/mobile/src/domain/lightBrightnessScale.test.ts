import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clampVisibleMin,
  mapDeviceToLogicalPct,
  mapLogicalToDevicePct,
} from './lightBrightnessScale';

describe('lightBrightnessScale', () => {
  it('clampVisibleMin clamps to 0..99', () => {
    assert.equal(clampVisibleMin(-5), 0);
    assert.equal(clampVisibleMin(50), 50);
    assert.equal(clampVisibleMin(100), 99);
    assert.equal(clampVisibleMin(Number.NaN), 0);
  });

  it('mapLogicalToDevicePct is identity when floor is 0', () => {
    assert.equal(mapLogicalToDevicePct(0, 0), 0);
    assert.equal(mapLogicalToDevicePct(15, 0), 15);
    assert.equal(mapLogicalToDevicePct(100, 0), 100);
  });

  it('mapLogicalToDevicePct remaps into [floor, 100]', () => {
    assert.equal(mapLogicalToDevicePct(0, 50), 0);
    assert.equal(mapLogicalToDevicePct(100, 50), 100);
    assert.equal(mapLogicalToDevicePct(50, 50), 75);
    assert.equal(mapLogicalToDevicePct(1, 50), 51);
  });

  it('mapDeviceToLogicalPct is identity when floor is 0', () => {
    assert.equal(mapDeviceToLogicalPct(0, 0), 0);
    assert.equal(mapDeviceToLogicalPct(40, 0), 40);
    assert.equal(mapDeviceToLogicalPct(100, 0), 100);
  });

  it('mapDeviceToLogicalPct inverts remap for floor 50', () => {
    assert.equal(mapDeviceToLogicalPct(75, 50), 50);
    assert.equal(mapDeviceToLogicalPct(100, 50), 100);
    assert.equal(mapDeviceToLogicalPct(50, 50), 1);
    assert.equal(mapDeviceToLogicalPct(40, 50), 1);
  });
});
