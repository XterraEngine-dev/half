import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateTaskId } from './task-id.js';

test('starts with t_', () => {
  assert.match(generateTaskId(), /^t_/);
});

test('6 hex chars after prefix', () => {
  assert.match(generateTaskId(), /^t_[a-f0-9]{6}$/);
});

test('generates unique ids', () => {
  const ids = new Set(Array.from({ length: 50 }, generateTaskId));
  assert.equal(ids.size, 50);
});
