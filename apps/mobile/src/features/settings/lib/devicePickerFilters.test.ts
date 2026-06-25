import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { IHaEntityListItem } from '@/ha/entityList';

import { filterDevicesForSlot } from './devicePickerFilters';

function item(
  entityId: string,
  friendlyName: string,
  state = 'off',
): IHaEntityListItem {
  const domain = entityId.includes('.') ? entityId.slice(0, entityId.indexOf('.')) : entityId;
  return { entityId, domain, state, friendlyName };
}

describe('filterDevicesForSlot', () => {
  it('includes switch humidifier in humidifier slot without humidifier domain only', () => {
    const items = [
      item('switch.bedroom_humidifier', 'Увлажнитель спальни'),
      item('light.kitchen', 'Кухня'),
    ];
    const { recommended, other } = filterDevicesForSlot(items, 'humidifier', '');

    assert.equal(recommended.length, 1);
    assert.equal(recommended[0].entityId, 'switch.bedroom_humidifier');
    assert.equal(other.length, 0);
  });

  it('puts unrelated switches in other for humidifier when domain matches', () => {
    const items = [item('switch.hall_light', 'Коридор')];
    const { recommended, other } = filterDevicesForSlot(items, 'humidifier', '');

    assert.equal(recommended.length, 0);
    assert.equal(other.length, 1);
  });

  it('scores air conditioner climate entities', () => {
    const items = [
      item('climate.bedroom_ac', 'Кондиционер спальни'),
      item('climate.living_room', 'Гостиная'),
    ];
    const { recommended, other } = filterDevicesForSlot(items, 'air_conditioner', '');

    assert.equal(recommended.length, 1);
    assert.equal(other.length, 1);
  });
});
