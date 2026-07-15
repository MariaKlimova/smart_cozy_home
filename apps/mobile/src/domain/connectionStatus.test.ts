import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { classifyHttpStatus, mergeFailureReasons } from '@/domain/connectionFailure';
import {
  connectionFailureMessageKey,
  connectionMessageKey,
  resolveConnectionStatus,
  shouldShowConnectionBanner,
} from '@/domain/connectionStatus';

describe('classifyHttpStatus', () => {
  it('maps 401 and 403 to token_invalid', () => {
    assert.equal(classifyHttpStatus(401), 'token_invalid');
    assert.equal(classifyHttpStatus(403), 'token_invalid');
  });

  it('maps other statuses to ha_unavailable', () => {
    assert.equal(classifyHttpStatus(500), 'ha_unavailable');
    assert.equal(classifyHttpStatus(404), 'ha_unavailable');
  });
});

describe('mergeFailureReasons', () => {
  it('prefers token_invalid over timeout', () => {
    assert.equal(
      mergeFailureReasons(['ha_unavailable', 'token_invalid']),
      'token_invalid',
    );
  });
});

describe('resolveConnectionStatus', () => {
  it('returns no_network when offline', () => {
    assert.equal(
      resolveConnectionStatus({
        hasProfile: true,
        isLoading: false,
        isConnected: false,
        isNetworkAvailable: false,
        failureReason: 'ha_unavailable',
      }),
      'no_network',
    );
  });

  it('returns token_invalid when auth failed', () => {
    assert.equal(
      resolveConnectionStatus({
        hasProfile: true,
        isLoading: false,
        isConnected: false,
        isNetworkAvailable: true,
        failureReason: 'token_invalid',
      }),
      'token_invalid',
    );
  });

  it('returns no_network even when still marked connected', () => {
    assert.equal(
      resolveConnectionStatus({
        hasProfile: true,
        isLoading: false,
        isConnected: true,
        isNetworkAvailable: false,
        failureReason: null,
      }),
      'no_network',
    );
  });

  it('returns connected when HA responds', () => {
    assert.equal(
      resolveConnectionStatus({
        hasProfile: true,
        isLoading: false,
        isConnected: true,
        isNetworkAvailable: true,
        failureReason: null,
      }),
      'connected',
    );
  });
});

describe('connectionMessageKey', () => {
  it('maps statuses to copy keys', () => {
    assert.equal(connectionMessageKey('no_network'), 'noNetwork');
    assert.equal(connectionMessageKey('token_invalid'), 'tokenExpired');
    assert.equal(connectionMessageKey('connected'), null);
  });
});

describe('shouldShowConnectionBanner', () => {
  it('hides banner when connected or no profile', () => {
    assert.equal(shouldShowConnectionBanner('connected'), false);
    assert.equal(shouldShowConnectionBanner('no_profile'), false);
    assert.equal(shouldShowConnectionBanner('no_network'), true);
  });
});

describe('connectionFailureMessageKey', () => {
  it('maps failure reasons for onboarding', () => {
    assert.equal(connectionFailureMessageKey('no_url'), 'needUrl');
    assert.equal(connectionFailureMessageKey('token_invalid'), 'tokenExpired');
  });
});
