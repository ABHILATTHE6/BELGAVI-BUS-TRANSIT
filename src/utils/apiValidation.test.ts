import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUS_STATUSES,
  normalizeSearch,
  parseLimit,
  validateCoordinates,
  validatePassengerCount,
} from './apiValidation.ts';

test('normalizes search input', () => {
  assert.equal(normalizeSearch('  CBT Central  '), 'cbt central');
  assert.equal(normalizeSearch(undefined), '');
});

test('enforces pagination limits', () => {
  assert.equal(parseLimit('25'), 25);
  assert.equal(parseLimit('500'), 100);
  assert.equal(parseLimit('nope'), 100);
});

test('validates passenger counts', () => {
  assert.equal(validatePassengerCount(10, 60), true);
  assert.equal(validatePassengerCount(61, 60), false);
  assert.equal(validatePassengerCount(10.5, 60), false);
});

test('validates geographic coordinates', () => {
  assert.equal(validateCoordinates(15.8583, 74.5078), true);
  assert.equal(validateCoordinates(95, 74.5), false);
});

test('defines supported bus statuses', () => {
  assert.equal(BUS_STATUSES.has('in_transit'), true);
  assert.equal(BUS_STATUSES.has('unknown'), false);
});
