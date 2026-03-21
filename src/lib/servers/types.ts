import type { ServerConnection } from '@prisma/client';

export type ServerType = 'qbittorrent' | 'transmission';
export type ServerProtocol = 'http' | 'https';

export interface ServerConnectionInput {
  name: string;
  type: ServerType;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface ServerConnectionUpdateInput {
  id?: string;
  name: string;
  type: ServerType;
  host: string;
  port: number;
  username: string;
  password?: string;
}

export interface ServerConnectionDto {
  id: string;
  name: string;
  type: ServerType;
  protocol: ServerProtocol;
  host: string;
  port: number;
  username: string;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toServerConnectionDto(server: ServerConnection): ServerConnectionDto {
  return {
    id: server.id,
    name: server.name,
    type: server.type as ServerType,
    protocol: server.protocol as ServerProtocol,
    host: server.host,
    port: server.port,
    username: server.username,
    hasPassword: Boolean(server.password),
    createdAt: server.createdAt.toISOString(),
    updatedAt: server.updatedAt.toISOString(),
  };
}
