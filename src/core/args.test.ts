import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from './args.js';

test('positionals: command + subcommand', () => {
  const r = parseArgs(['node', 'half', 'task', 'add', 'my title']);
  assert.equal(r.command, 'task');
  assert.equal(r.subcommand, 'add');
  assert.deepEqual(r.positionals, ['my title']);
});

test('positionals: command only', () => {
  const r = parseArgs(['node', 'half', 'build']);
  assert.equal(r.command, 'build');
  assert.equal(r.subcommand, null);
  assert.deepEqual(r.positionals, []);
});

test('--flag value', () => {
  const r = parseArgs(['node', 'half', 'new', 'app', '--backend', 'go']);
  assert.equal(r.flags['backend'], 'go');
});

test('--flag=value', () => {
  const r = parseArgs(['node', 'half', 'new', 'app', '--backend=python']);
  assert.equal(r.flags['backend'], 'python');
});

test('boolean flag', () => {
  const r = parseArgs(['node', 'half', 'new', 'app', '--dry-run']);
  assert.equal(r.flags['dry-run'], true);
});

test('mixed flags and positionals', () => {
  const r = parseArgs(['node', 'half', 'task', 'assign', 't_abc', 'luis', '--tag', 'backend']);
  assert.equal(r.subcommand, 'assign');
  assert.deepEqual(r.positionals, ['t_abc', 'luis']);
  assert.equal(r.flags['tag'], 'backend');
});

test('empty argv', () => {
  const r = parseArgs(['node', 'half']);
  assert.equal(r.command, '');
  assert.equal(r.subcommand, null);
});
