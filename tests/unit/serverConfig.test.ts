import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePort } from '../../server';

test('resolvePort: prioritizes CLI flag --port over environment PORT', () => {
  // Cloud Run / container sets PORT=8080, but runner passes --port 3000
  const port = resolvePort(
    ['node', 'server.ts', '--port', '3000', '--host', '0.0.0.0'],
    { PORT: '8080' }
  );
  assert.equal(port, 3000, 'CLI flag --port must override PORT=8080');
});

test('resolvePort: handles --port=3000 syntax correctly', () => {
  const port = resolvePort(
    ['node', 'server.ts', '--port=3001'],
    { PORT: '8080' }
  );
  assert.equal(port, 3001);
});

test('resolvePort: handles -p shorthand flag', () => {
  const port = resolvePort(
    ['node', 'server.ts', '-p', '4000'],
    { PORT: '8080' }
  );
  assert.equal(port, 4000);
});

test('resolvePort: ignores container Nginx PORT=8080 to prevent EADDRINUSE crash', () => {
  // When no CLI argument is given, PORT=8080 must be ignored and default to 3000
  const port = resolvePort(['node', 'server.ts'], { PORT: '8080' });
  assert.equal(port, 3000, 'Must not listen on 8080 which is reserved for reverse proxy');
});

test('resolvePort: respects APP_PORT when supplied', () => {
  const port = resolvePort(['node', 'server.ts'], { APP_PORT: '3005', PORT: '8080' });
  assert.equal(port, 3005);
});

test('resolvePort: respects custom non-8080 PORT when explicitly set without CLI flags', () => {
  const port = resolvePort(['node', 'server.ts'], { PORT: '5000' });
  assert.equal(port, 5000);
});

test('resolvePort: defaults to 3000 when environment and arguments are empty', () => {
  const port = resolvePort(['node', 'server.ts'], {});
  assert.equal(port, 3000);
});
