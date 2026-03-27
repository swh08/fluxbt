import { describe, expect, it } from 'vitest';
import { normalizeServerEndpoint } from '@/lib/servers/normalize';

describe('normalizeServerEndpoint', () => {
  it('trims the host and removes trailing slashes', () => {
    expect(normalizeServerEndpoint('  example.com///  ', 8080)).toEqual({
      protocol: 'http',
      host: 'example.com',
      port: 8080,
    });
  });

  it('extracts protocol and port from full URLs', () => {
    expect(normalizeServerEndpoint('https://example.com:8443/path///', 8080)).toEqual({
      protocol: 'https',
      host: 'example.com',
      port: 8443,
    });
  });

  it('throws when the normalized host is empty', () => {
    expect(() => normalizeServerEndpoint('   ', 8080)).toThrowError('SERVER_HOST_REQUIRED');
  });

  it('throws when the port is invalid', () => {
    expect(() => normalizeServerEndpoint('example.com', 0)).toThrowError('SERVER_PORT_INVALID');
    expect(() => normalizeServerEndpoint('example.com', 80.5)).toThrowError('SERVER_PORT_INVALID');
  });
});
