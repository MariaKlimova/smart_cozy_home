import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapTimelineFromLogbook } from './domainMapper';

describe('mapTimelineFromLogbook', () => {
  it('does not throw when message is missing', () => {
    const events = mapTimelineFromLogbook([
      { when: '2026-07-18T08:00:00', name: 'Мария', entity_id: 'person.maria' },
      {
        when: '2026-07-18T08:01:00',
        entity_id: 'input_select.home_mode',
        name: 'Режим',
      },
    ]);

    assert.equal(events.length, 2);
    assert.equal(events[0].message, 'Мария');
    assert.equal(events[1].kind, 'ritual');
  });

  it('classifies presence when message mentions home', () => {
    const events = mapTimelineFromLogbook([
      {
        when: '2026-07-18T08:00:00',
        message: 'came home',
        name: 'Мария',
        entity_id: 'person.maria',
      },
    ]);

    assert.equal(events[0].kind, 'presence_home');
  });
});
