import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replaceTokens, buildTokens } from './token-replacer.js';

test('replaces PROJECT_NAME', () => {
  const t = buildTokens('my-app', 'go', 'vue');
  assert.equal(replaceTokens('name: [[HALF:PROJECT_NAME]]', t), 'name: my-app');
});

test('PROJECT_NAME_PASCAL from kebab', () => {
  const t = buildTokens('my-cool-app', 'go', '');
  assert.equal(t.PROJECT_NAME_PASCAL, 'MyCoolApp');
});

test('PROJECT_NAME_PASCAL from single word', () => {
  const t = buildTokens('shop', 'go', '');
  assert.equal(t.PROJECT_NAME_PASCAL, 'Shop');
});

test('PROJECT_NAME_SNAKE from kebab', () => {
  const t = buildTokens('my-app', 'go', '');
  assert.equal(t.PROJECT_NAME_SNAKE, 'my_app');
});

test('GO_MODULE uses snake name', () => {
  const t = buildTokens('my-app', 'go', '');
  assert.equal(t.GO_MODULE, 'github.com/XterraEngine-dev/my_app');
});

test('DB_PORT for postgres', () => {
  const t = buildTokens('app', 'go', 'vue', 'postgres');
  assert.equal(t.DB_PORT, '5432');
});

test('DB_IMAGE for postgres', () => {
  const t = buildTokens('app', 'go', '', 'postgres');
  assert.equal(t.DB_IMAGE, 'postgres:16-alpine');
});

test('unknown token kept verbatim', () => {
  const t = buildTokens('app', '', '');
  assert.equal(replaceTokens('[[HALF:DOES_NOT_EXIST]]', t), '[[HALF:DOES_NOT_EXIST]]');
});

test('multiple tokens in one string', () => {
  const t = buildTokens('my-svc', 'go', 'vue');
  const result = replaceTokens('[[HALF:PROJECT_NAME]] / [[HALF:PROJECT_NAME_PASCAL]]', t);
  assert.equal(result, 'my-svc / MySvc');
});

test('no tokens — string unchanged', () => {
  const t = buildTokens('app', '', '');
  assert.equal(replaceTokens('package main', t), 'package main');
});
