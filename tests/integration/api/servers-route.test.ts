import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  createServerConnection,
  createServerPayload,
} from '../../helpers/fixtures';

const {
  getAppSessionMock,
  listServerConnectionsMock,
  createServerConnectionMock,
  verifyServerConnectionMock,
} = vi.hoisted(() => ({
  getAppSessionMock: vi.fn(),
  listServerConnectionsMock: vi.fn(),
  createServerConnectionMock: vi.fn(),
  verifyServerConnectionMock: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getAppSession: getAppSessionMock,
}));

vi.mock('@/lib/servers/store', () => ({
  listServerConnections: listServerConnectionsMock,
  createServerConnection: createServerConnectionMock,
}));

vi.mock('@/lib/app-state', () => ({
  verifyServerConnection: verifyServerConnectionMock,
}));

import { GET, POST } from '@/app/api/servers/route';

describe('/api/servers route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated GET requests', async () => {
    getAppSessionMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'UNAUTHORIZED' });
  });

  it('returns the current user server DTOs for GET requests', async () => {
    const server = createServerConnection({
      id: 'server-1',
      password: 'secret',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    });

    getAppSessionMock.mockResolvedValue({ user: { id: 'user-1' } });
    listServerConnectionsMock.mockResolvedValue([server]);

    const response = await GET();

    expect(listServerConnectionsMock).toHaveBeenCalledWith('user-1');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: 'server-1',
        name: 'Primary Server',
        type: 'qbittorrent',
        protocol: 'http',
        host: 'localhost',
        port: 8080,
        username: 'admin',
        hasPassword: true,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      },
    ]);
  });

  it('verifies and creates a server for valid POST requests', async () => {
    const payload = createServerPayload({
      host: 'https://example.com:8443/path///',
      port: 8080,
    });
    const createdServer = createServerConnection({
      id: 'server-2',
      protocol: 'https',
      host: 'example.com',
      port: 8443,
    });

    getAppSessionMock.mockResolvedValue({ user: { id: 'user-1' } });
    verifyServerConnectionMock.mockResolvedValue(undefined);
    createServerConnectionMock.mockResolvedValue(createdServer);

    const request = new NextRequest('http://localhost/api/servers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(verifyServerConnectionMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'temp-server',
      userId: 'user-1',
      protocol: 'https',
      host: 'example.com',
      port: 8443,
      username: 'admin',
      password: 'secret',
    }));
    expect(createServerConnectionMock).toHaveBeenCalledWith('user-1', payload);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      id: 'server-2',
      name: 'Primary Server',
      type: 'qbittorrent',
      protocol: 'https',
      host: 'example.com',
      port: 8443,
      username: 'admin',
      hasPassword: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('returns 400 when server verification fails during POST', async () => {
    const payload = createServerPayload();

    getAppSessionMock.mockResolvedValue({ user: { id: 'user-1' } });
    verifyServerConnectionMock.mockRejectedValue(new Error('SERVER_CONNECT_FAILED'));

    const request = new NextRequest('http://localhost/api/servers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(createServerConnectionMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: 'SERVER_CONNECT_FAILED' });
  });
});
