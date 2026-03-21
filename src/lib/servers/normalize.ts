import type { ServerProtocol } from '@/lib/servers/types';

export interface NormalizedServerEndpoint {
  protocol: ServerProtocol;
  host: string;
  port: number;
}

export function normalizeServerEndpoint(hostInput: string, portInput: number): NormalizedServerEndpoint {
  let protocol: ServerProtocol = 'http';
  let host = hostInput.trim();
  let port = portInput;

  if (/^https?:\/\//i.test(host)) {
    const parsed = new URL(host);

    protocol = parsed.protocol.replace(':', '') as ServerProtocol;
    host = parsed.hostname;

    if (parsed.port) {
      port = Number(parsed.port);
    }
  }

  host = host.replace(/\/+$/, '');

  if (!host) {
    throw new Error('SERVER_HOST_REQUIRED');
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('SERVER_PORT_INVALID');
  }

  return {
    protocol,
    host,
    port,
  };
}
