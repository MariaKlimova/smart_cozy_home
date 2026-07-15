import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { shouldShowBedroomSensorSetupCta } from './shouldShowBedroomSensorSetup';

describe('shouldShowBedroomSensorSetupCta', () => {
  it('hides CTA when bedroom readings already arrived', () => {
    const show = shouldShowBedroomSensorSetupCta({
      haReady: true,
      hasSensorHydrated: true,
      isBedroomLoading: false,
      readings: { temperatureC: 21 },
    });
    assert.equal(show, false);
  });

  it('shows CTA when HA is ready but there are no bedroom readings', () => {
    const show = shouldShowBedroomSensorSetupCta({
      haReady: true,
      hasSensorHydrated: true,
      isBedroomLoading: false,
      readings: {},
    });
    assert.equal(show, true);
  });

  it('hides CTA while bedroom readings are still loading', () => {
    const show = shouldShowBedroomSensorSetupCta({
      haReady: true,
      hasSensorHydrated: true,
      isBedroomLoading: true,
      readings: {},
    });
    assert.equal(show, false);
  });
});
