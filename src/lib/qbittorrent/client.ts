import type { ServerConnection } from '@prisma/client';

type CookieKey = `${string}|${string}`;
type TorrentActionApiStyle = 'legacy' | 'v5';

const sessionCookies = new Map<CookieKey, string>();
const torrentActionApiStyles = new Map<CookieKey, TorrentActionApiStyle>();

function getCookieKey(server: ServerConnection): CookieKey {
  return `${server.protocol}://${server.host}:${server.port}|${server.username}`;
}

function getBaseUrl(server: ServerConnection) {
  return `${server.protocol}://${server.host}:${server.port}`;
}

function getReferer(server: ServerConnection) {
  return `${getBaseUrl(server)}/`;
}

function encodeHashes(hashes: string[]) {
  return hashes.join('|');
}

function parseTorrentActionApiStyle(version: string): TorrentActionApiStyle | null {
  const majorVersion = Number.parseInt(version.trim().split('.')[0] ?? '', 10);

  if (Number.isNaN(majorVersion)) {
    return null;
  }

  return majorVersion >= 5 ? 'v5' : 'legacy';
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

export class QbittorrentClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'QbittorrentClientError';
    this.status = status;
  }
}

export interface QbittorrentTransferInfo {
  connection_status: string;
  dl_info_data: number;
  dl_info_speed: number;
  up_info_data: number;
  up_info_speed: number;
  dl_rate_limit: number;
  up_rate_limit: number;
  dht_nodes: number;
}

export interface QbittorrentServerState extends QbittorrentTransferInfo {
  alltime_dl?: number;
  alltime_ul?: number;
  refresh_interval?: number;
}

export interface QbittorrentTorrentInfo {
  added_on: number;
  amount_left: number;
  category: string;
  completed: number;
  content_path?: string;
  dl_limit: number;
  dlspeed: number;
  downloaded: number;
  eta: number;
  hash?: string;
  name: string;
  num_leechs: number;
  num_seeds: number;
  progress: number;
  ratio: number;
  save_path: string;
  size: number;
  state: string;
  tags: string;
  tracker: string;
  uploaded: number;
  upspeed: number;
}

export interface QbittorrentMainData {
  rid: number;
  full_update: boolean;
  server_state?: QbittorrentServerState;
  torrents?: Record<string, QbittorrentTorrentInfo>;
  categories?: Record<string, { name: string; savePath: string }>;
  tags?: string[];
}

export interface QbittorrentTorrentProperties {
  save_path: string;
  total_uploaded: number;
  total_downloaded: number;
  total_size: number;
  addition_date: number;
  peers: number;
  peers_total: number;
  seeds: number;
  seeds_total: number;
  up_speed: number;
  dl_speed: number;
  eta: number;
  share_ratio: number;
}

export interface QbittorrentTorrentFile {
  index: number;
  name: string;
  size: number;
  progress: number;
}

export interface QbittorrentTracker {
  url: string;
  status: number;
}

export interface QbittorrentPeer {
  client: string;
  country?: string;
  country_code?: string;
  dl_speed: number;
  ip?: string;
  uploaded?: number;
  up_speed: number;
  flags: string;
  port: number;
  progress: number;
}

export interface QbittorrentTorrentPeersResponse {
  full_update: boolean;
  rid: number;
  peers?: Record<string, QbittorrentPeer>;
}

export interface AddTorrentInput {
  urls?: string;
  torrentFile?: File;
  savePath?: string;
  category?: string;
  tags?: string[];
  startImmediately?: boolean;
}

export class QbittorrentClient {
  constructor(private readonly server: ServerConnection) {}

  private getTorrentActionApiStyleKey() {
    return getCookieKey(this.server);
  }

  private getTorrentActionPath(action: 'pause' | 'resume', style: TorrentActionApiStyle) {
    if (action === 'pause') {
      return style === 'v5' ? '/api/v2/torrents/stop' : '/api/v2/torrents/pause';
    }

    return style === 'v5' ? '/api/v2/torrents/start' : '/api/v2/torrents/resume';
  }

  private getFallbackTorrentActionStyle(style: TorrentActionApiStyle): TorrentActionApiStyle {
    return style === 'v5' ? 'legacy' : 'v5';
  }

  private async resolveTorrentActionApiStyle(): Promise<TorrentActionApiStyle | null> {
    const cacheKey = this.getTorrentActionApiStyleKey();
    const cachedStyle = torrentActionApiStyles.get(cacheKey);

    if (cachedStyle) {
      return cachedStyle;
    }

    try {
      const version = await this.getVersion();
      const parsedStyle = parseTorrentActionApiStyle(version);

      if (parsedStyle) {
        torrentActionApiStyles.set(cacheKey, parsedStyle);
      }

      return parsedStyle;
    } catch {
      return null;
    }
  }

  private async requestWithFallback<T>(
    paths: string[],
    createInit: () => RequestInit,
  ): Promise<{ path: string; data: T }> {
    let lastError: unknown;

    for (let index = 0; index < paths.length; index += 1) {
      try {
        return {
          path: paths[index],
          data: await this.request<T>(paths[index], createInit()),
        };
      } catch (error) {
        lastError = error;

        const canRetryWithFallback = error instanceof QbittorrentClientError
          && error.status === 404
          && index < paths.length - 1;

        if (!canRetryWithFallback) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  private async requestTorrentAction(action: 'pause' | 'resume', hashes: string[]) {
    const preferredStyle = await this.resolveTorrentActionApiStyle() ?? 'legacy';
    const fallbackStyle = this.getFallbackTorrentActionStyle(preferredStyle);
    const paths = [
      this.getTorrentActionPath(action, preferredStyle),
      this.getTorrentActionPath(action, fallbackStyle),
    ].filter((path, index, currentPaths) => currentPaths.indexOf(path) === index);

    const result = await this.requestWithFallback<string>(
      paths,
      () => ({
        method: 'POST',
        body: new URLSearchParams({
          hashes: encodeHashes(hashes),
        }),
      }),
    );

    torrentActionApiStyles.set(
      this.getTorrentActionApiStyleKey(),
      result.path === this.getTorrentActionPath(action, preferredStyle) ? preferredStyle : fallbackStyle,
    );

    return result.data;
  }

  private async login(force = false) {
    const cookieKey = getCookieKey(this.server);

    if (!force && sessionCookies.has(cookieKey)) {
      return sessionCookies.get(cookieKey) ?? '';
    }

    const response = await fetch(`${getBaseUrl(this.server)}/api/v2/auth/login`, {
      method: 'POST',
      headers: {
        Referer: getReferer(this.server),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: this.server.username,
        password: this.server.password,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new QbittorrentClientError('QBITTORRENT_LOGIN_FAILED', response.status);
    }

    const cookie = response.headers.get('set-cookie');

    if (!cookie) {
      throw new QbittorrentClientError('QBITTORRENT_COOKIE_MISSING', 500);
    }

    const sidCookie = cookie.split(';')[0];
    sessionCookies.set(cookieKey, sidCookie);
    return sidCookie;
  }

  private async request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
    const sidCookie = await this.login();
    const headers = new Headers(init?.headers);
    headers.set('Referer', getReferer(this.server));
    headers.set('Cookie', sidCookie);

    const response = await fetch(`${getBaseUrl(this.server)}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });

    if ((response.status === 401 || response.status === 403) && retry) {
      await this.login(true);
      return this.request<T>(path, init, false);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new QbittorrentClientError(body || 'QBITTORRENT_REQUEST_FAILED', response.status);
    }

    return parseResponse<T>(response);
  }

  getVersion() {
    return this.request<string>('/api/v2/app/version');
  }

  getTransferInfo() {
    return this.request<QbittorrentTransferInfo>('/api/v2/transfer/info');
  }

  getMainData() {
    return this.request<QbittorrentMainData>('/api/v2/sync/maindata?rid=0');
  }

  getTorrentProperties(hash: string) {
    return this.request<QbittorrentTorrentProperties>(
      `/api/v2/torrents/properties?hash=${encodeURIComponent(hash)}`,
    );
  }

  getTorrentFiles(hash: string) {
    return this.request<QbittorrentTorrentFile[]>(
      `/api/v2/torrents/files?hash=${encodeURIComponent(hash)}`,
    );
  }

  getTorrentTrackers(hash: string) {
    return this.request<QbittorrentTracker[]>(
      `/api/v2/torrents/trackers?hash=${encodeURIComponent(hash)}`,
    );
  }

  getTorrentPeers(hash: string) {
    return this.request<QbittorrentTorrentPeersResponse>(
      `/api/v2/sync/torrentPeers?hash=${encodeURIComponent(hash)}&rid=0`,
    );
  }

  pauseTorrents(hashes: string[]) {
    return this.requestTorrentAction('pause', hashes);
  }

  resumeTorrents(hashes: string[]) {
    return this.requestTorrentAction('resume', hashes);
  }

  deleteTorrents(hashes: string[], deleteFiles = false) {
    return this.request<string>('/api/v2/torrents/delete', {
      method: 'POST',
      body: new URLSearchParams({
        hashes: encodeHashes(hashes),
        deleteFiles: String(deleteFiles),
      }),
    });
  }

  addTorrent(input: AddTorrentInput) {
    const formData = new FormData();

    if (input.urls) {
      formData.append('urls', input.urls);
    }

    if (input.torrentFile) {
      formData.append('torrents', input.torrentFile, input.torrentFile.name);
    }

    if (input.savePath) {
      formData.append('savepath', input.savePath);
    }

    if (input.category && input.category !== 'none') {
      formData.append('category', input.category);
    }

    if (input.tags && input.tags.length > 0) {
      formData.append('tags', input.tags.join(','));
    }

    formData.append('paused', String(!input.startImmediately));

    return this.request<string>('/api/v2/torrents/add', {
      method: 'POST',
      body: formData,
    });
  }
}
