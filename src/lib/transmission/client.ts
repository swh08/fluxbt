import type { ServerConnection } from '@prisma/client';
import type { DownloaderAddTorrentInput } from '@/lib/downloaders/types';
import type {
  TransmissionPeer,
  TransmissionRpcStyle,
  TransmissionSession,
  TransmissionSessionStats,
  TransmissionStatsSnapshot,
  TransmissionTorrent,
  TransmissionTracker,
  TransmissionTrackerStat,
} from '@/lib/transmission/types';

type SessionKey = `${string}|${string}`;
type RpcMethodName =
  | 'sessionGet'
  | 'sessionStats'
  | 'torrentGet'
  | 'torrentStart'
  | 'torrentStop'
  | 'torrentRemove'
  | 'torrentAdd';

const transmissionSessionIds = new Map<SessionKey, string>();
const transmissionRpcStyles = new Map<SessionKey, TransmissionRpcStyle>();

const RPC_METHODS: Record<RpcMethodName, Record<TransmissionRpcStyle, string>> = {
  sessionGet: {
    legacy: 'session-get',
    jsonrpc2: 'session_get',
  },
  sessionStats: {
    legacy: 'session-stats',
    jsonrpc2: 'session_stats',
  },
  torrentGet: {
    legacy: 'torrent-get',
    jsonrpc2: 'torrent_get',
  },
  torrentStart: {
    legacy: 'torrent-start',
    jsonrpc2: 'torrent_start',
  },
  torrentStop: {
    legacy: 'torrent-stop',
    jsonrpc2: 'torrent_stop',
  },
  torrentRemove: {
    legacy: 'torrent-remove',
    jsonrpc2: 'torrent_remove',
  },
  torrentAdd: {
    legacy: 'torrent-add',
    jsonrpc2: 'torrent_add',
  },
};

const SESSION_FIELDS: Record<TransmissionRpcStyle, string[]> = {
  legacy: ['version', 'rpc-version', 'download-dir'],
  jsonrpc2: ['version', 'rpc_version', 'rpc_version_semver', 'download_dir'],
};

const TORRENT_LIST_FIELDS: Record<TransmissionRpcStyle, string[]> = {
  legacy: [
    'id',
    'hashString',
    'name',
    'downloadDir',
    'error',
    'errorString',
    'eta',
    'rateDownload',
    'rateUpload',
    'percentDone',
    'metadataPercentComplete',
    'sizeWhenDone',
    'totalSize',
    'addedDate',
    'uploadedEver',
    'downloadedEver',
    'haveValid',
    'peersConnected',
    'peersSendingToUs',
    'peersGettingFromUs',
    'uploadRatio',
    'status',
    'isFinished',
    'labels',
    'trackers',
    'trackerStats',
  ],
  jsonrpc2: [
    'id',
    'hash_string',
    'name',
    'download_dir',
    'error',
    'error_string',
    'eta',
    'rate_download',
    'rate_upload',
    'percent_done',
    'metadata_percent_complete',
    'size_when_done',
    'total_size',
    'added_date',
    'uploaded_ever',
    'downloaded_ever',
    'have_valid',
    'peers_connected',
    'peers_sending_to_us',
    'peers_getting_from_us',
    'upload_ratio',
    'status',
    'is_finished',
    'labels',
    'trackers',
    'tracker_stats',
  ],
};

const TORRENT_DETAIL_FIELDS: Record<TransmissionRpcStyle, string[]> = {
  legacy: [
    ...TORRENT_LIST_FIELDS.legacy,
    'files',
    'fileStats',
    'peers',
  ],
  jsonrpc2: [
    ...TORRENT_LIST_FIELDS.jsonrpc2,
    'files',
    'file_stats',
    'peers',
  ],
};

function getKey(server: ServerConnection): SessionKey {
  return `${server.protocol}://${server.host}:${server.port}|${server.username}`;
}

function getBaseUrl(server: ServerConnection) {
  return `${server.protocol}://${server.host}:${server.port}`;
}

function getRpcUrl(server: ServerConnection) {
  return `${getBaseUrl(server)}/transmission/rpc`;
}

function unique<T>(values: T[]) {
  return values.filter((value, index, allValues) => allValues.indexOf(value) === index);
}

function pickNumber(record: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
  }

  return fallback;
}

function pickString(record: Record<string, unknown>, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string') {
      return value;
    }
  }

  return fallback;
}

function pickBoolean(record: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }
  }

  return fallback;
}

function pickArray(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function pickObject(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }

  return {};
}

function normalizeStatsSnapshot(value: Record<string, unknown>): TransmissionStatsSnapshot {
  return {
    uploadedBytes: pickNumber(value, ['uploadedBytes', 'uploaded_bytes']),
    downloadedBytes: pickNumber(value, ['downloadedBytes', 'downloaded_bytes']),
    filesAdded: pickNumber(value, ['filesAdded', 'files_added']),
    secondsActive: pickNumber(value, ['secondsActive', 'seconds_active']),
    sessionCount: pickNumber(value, ['sessionCount', 'session_count']),
  };
}

function normalizeTracker(record: Record<string, unknown>): TransmissionTracker {
  return {
    id: pickNumber(record, ['id']),
    announce: pickString(record, ['announce']),
    scrape: pickString(record, ['scrape']),
    sitename: pickString(record, ['sitename']),
    tier: pickNumber(record, ['tier']),
  };
}

function normalizeTrackerStat(record: Record<string, unknown>): TransmissionTrackerStat {
  return {
    id: pickNumber(record, ['id']),
    announce: pickString(record, ['announce']),
    host: pickString(record, ['host']),
    sitename: pickString(record, ['sitename']),
    seederCount: pickNumber(record, ['seederCount', 'seeder_count']),
    leecherCount: pickNumber(record, ['leecherCount', 'leecher_count']),
    downloaderCount: pickNumber(record, ['downloaderCount', 'downloader_count']),
    lastAnnounceResult: pickString(record, ['lastAnnounceResult', 'last_announce_result']),
  };
}

function normalizePeer(record: Record<string, unknown>): TransmissionPeer {
  return {
    address: pickString(record, ['address']),
    clientName: pickString(record, ['clientName', 'client_name']),
    flagStr: pickString(record, ['flagStr', 'flag_str']),
    port: pickNumber(record, ['port']),
    progress: pickNumber(record, ['progress']),
    rateToClient: pickNumber(record, ['rateToClient', 'rate_to_client']),
    rateToPeer: pickNumber(record, ['rateToPeer', 'rate_to_peer']),
  };
}

function normalizeTorrent(record: Record<string, unknown>): TransmissionTorrent {
  const trackers = pickArray(record, ['trackers']).map((value) =>
    normalizeTracker((value as Record<string, unknown>) ?? {}),
  );
  const trackerStats = pickArray(record, ['trackerStats', 'tracker_stats']).map((value) =>
    normalizeTrackerStat((value as Record<string, unknown>) ?? {}),
  );
  const peers = pickArray(record, ['peers']).map((value) =>
    normalizePeer((value as Record<string, unknown>) ?? {}),
  );
  const files = pickArray(record, ['files']).map((value) => {
    const file = (value as Record<string, unknown>) ?? {};

    return {
      name: pickString(file, ['name']),
      length: pickNumber(file, ['length']),
      bytesCompleted: pickNumber(file, ['bytesCompleted', 'bytes_completed']),
    };
  });
  const fileStats = pickArray(record, ['fileStats', 'file_stats']).map((value) => {
    const fileStat = (value as Record<string, unknown>) ?? {};

    return {
      bytesCompleted: pickNumber(fileStat, ['bytesCompleted', 'bytes_completed']),
      wanted: pickBoolean(fileStat, ['wanted'], pickNumber(fileStat, ['wanted']) === 1),
      priority: pickNumber(fileStat, ['priority']),
    };
  });

  return {
    id: pickNumber(record, ['id']),
    hashString: pickString(record, ['hashString', 'hash_string']),
    name: pickString(record, ['name']),
    downloadDir: pickString(record, ['downloadDir', 'download_dir']),
    error: pickNumber(record, ['error']),
    errorString: pickString(record, ['errorString', 'error_string']),
    eta: pickNumber(record, ['eta'], -1),
    rateDownload: pickNumber(record, ['rateDownload', 'rate_download']),
    rateUpload: pickNumber(record, ['rateUpload', 'rate_upload']),
    percentDone: pickNumber(record, ['percentDone', 'percent_done']),
    metadataPercentComplete: pickNumber(
      record,
      ['metadataPercentComplete', 'metadata_percent_complete'],
    ),
    sizeWhenDone: pickNumber(record, ['sizeWhenDone', 'size_when_done']),
    totalSize: pickNumber(record, ['totalSize', 'total_size']),
    addedDate: pickNumber(record, ['addedDate', 'added_date']),
    uploadedEver: pickNumber(record, ['uploadedEver', 'uploaded_ever']),
    downloadedEver: pickNumber(record, ['downloadedEver', 'downloaded_ever']),
    haveValid: pickNumber(record, ['haveValid', 'have_valid']),
    peersConnected: pickNumber(record, ['peersConnected', 'peers_connected']),
    peersSendingToUs: pickNumber(record, ['peersSendingToUs', 'peers_sending_to_us']),
    peersGettingFromUs: pickNumber(record, ['peersGettingFromUs', 'peers_getting_from_us']),
    uploadRatio: pickNumber(record, ['uploadRatio', 'upload_ratio']),
    status: pickNumber(record, ['status']),
    isFinished: pickBoolean(record, ['isFinished', 'is_finished']),
    labels: pickArray(record, ['labels']).map((value) => String(value)).filter(Boolean),
    files,
    fileStats,
    trackers,
    trackerStats,
    peers,
  };
}

function encodeBasicAuth(username: string, password: string) {
  return Buffer.from(`${username}:${password}`).toString('base64');
}

export class TransmissionClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'TransmissionClientError';
    this.status = status;
  }
}

export class TransmissionClient {
  constructor(private readonly server: ServerConnection) {}

  private get cacheKey() {
    return getKey(this.server);
  }

  private get headers() {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const sessionId = transmissionSessionIds.get(this.cacheKey);

    if (sessionId) {
      headers.set('X-Transmission-Session-Id', sessionId);
    }

    if (this.server.username || this.server.password) {
      headers.set(
        'Authorization',
        `Basic ${encodeBasicAuth(this.server.username, this.server.password)}`,
      );
    }

    return headers;
  }

  private getMethodName(style: TransmissionRpcStyle, method: RpcMethodName) {
    return RPC_METHODS[method][style];
  }

  private async executeRequest<T>(
    style: TransmissionRpcStyle,
    method: RpcMethodName,
    params?: Record<string, unknown>,
    retry = true,
  ): Promise<T> {
    const body = style === 'jsonrpc2'
      ? JSON.stringify({
        jsonrpc: '2.0',
        method: this.getMethodName(style, method),
        params: params ?? {},
        id: 1,
      })
      : JSON.stringify({
        method: this.getMethodName(style, method),
        arguments: params ?? {},
        tag: 1,
      });
    const response = await fetch(getRpcUrl(this.server), {
      method: 'POST',
      headers: this.headers,
      body,
      cache: 'no-store',
    });

    if (response.status === 409 && retry) {
      const sessionId = response.headers.get('X-Transmission-Session-Id');

      if (!sessionId) {
        throw new TransmissionClientError('TRANSMISSION_SESSION_ID_MISSING', 409);
      }

      transmissionSessionIds.set(this.cacheKey, sessionId);
      return this.executeRequest<T>(style, method, params, false);
    }

    if (!response.ok) {
      const message = await response.text();
      throw new TransmissionClientError(message || 'TRANSMISSION_REQUEST_FAILED', response.status);
    }

    const payload = await response.json() as Record<string, unknown>;

    if (style === 'jsonrpc2') {
      const error = payload.error;

      if (error && typeof error === 'object') {
        const errorRecord = error as Record<string, unknown>;
        const data = pickObject(errorRecord, ['data']);
        const message = pickString(errorRecord, ['message'])
          || pickString(data, ['error_string'])
          || 'TRANSMISSION_REQUEST_FAILED';
        throw new TransmissionClientError(message, 400);
      }

      return (payload.result ?? {}) as T;
    }

    if (payload.result !== 'success') {
      throw new TransmissionClientError(
        typeof payload.result === 'string' ? payload.result : 'TRANSMISSION_REQUEST_FAILED',
        400,
      );
    }

    return (payload.arguments ?? {}) as T;
  }

  private async request<T>(
    method: RpcMethodName,
    createParams?: (style: TransmissionRpcStyle) => Record<string, unknown>,
  ): Promise<{ data: T; style: TransmissionRpcStyle }> {
    const cachedStyle = transmissionRpcStyles.get(this.cacheKey);
    const styles = unique<TransmissionRpcStyle>([
      cachedStyle ?? 'jsonrpc2',
      'legacy',
    ]);
    let lastError: unknown;

    for (const style of styles) {
      try {
        const result = await this.executeRequest<T>(style, method, createParams?.(style));
        transmissionRpcStyles.set(this.cacheKey, style);
        return { data: result, style };
      } catch (error) {
        lastError = error;

        if (
          styles.length === 1
          || !(error instanceof TransmissionClientError)
          || error.status === 401
          || error.status === 403
          || style === styles[styles.length - 1]
        ) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async getSession() {
    const result = await this.request<Record<string, unknown>>(
      'sessionGet',
      (style) => ({ fields: SESSION_FIELDS[style] }),
    );

    return {
      version: pickString(result.data, ['version'], '--'),
      downloadDir: pickString(result.data, ['downloadDir', 'download_dir']),
      rpcVersion: pickNumber(result.data, ['rpc-version', 'rpc_version'], 0) || null,
      rpcVersionSemver: pickString(result.data, ['rpc_version_semver']),
    } satisfies TransmissionSession;
  }

  async getVersion() {
    const session = await this.getSession();
    return session.version;
  }

  async getSessionStats() {
    const result = await this.request<Record<string, unknown>>('sessionStats');

    return {
      activeTorrentCount: pickNumber(result.data, ['activeTorrentCount', 'active_torrent_count']),
      pausedTorrentCount: pickNumber(result.data, ['pausedTorrentCount', 'paused_torrent_count']),
      torrentCount: pickNumber(result.data, ['torrentCount', 'torrent_count']),
      downloadSpeed: pickNumber(result.data, ['downloadSpeed', 'download_speed']),
      uploadSpeed: pickNumber(result.data, ['uploadSpeed', 'upload_speed']),
      cumulativeStats: normalizeStatsSnapshot(
        pickObject(result.data, ['cumulativeStats', 'cumulative_stats']),
      ),
      currentStats: normalizeStatsSnapshot(
        pickObject(result.data, ['currentStats', 'current_stats']),
      ),
    } satisfies TransmissionSessionStats;
  }

  async getTorrents(ids?: string[], detail = false) {
    const result = await this.request<Record<string, unknown>>(
      'torrentGet',
      (style) => ({
        fields: detail ? TORRENT_DETAIL_FIELDS[style] : TORRENT_LIST_FIELDS[style],
        ...(ids && ids.length > 0 ? { ids } : {}),
      }),
    );

    return pickArray(result.data, ['torrents']).map((value) =>
      normalizeTorrent((value as Record<string, unknown>) ?? {}),
    );
  }

  async getTorrent(hash: string) {
    const torrents = await this.getTorrents([hash], true);
    return torrents[0] ?? null;
  }

  async startTorrents(ids: string[]) {
    await this.request('torrentStart', () => ({ ids }));
  }

  async stopTorrents(ids: string[]) {
    await this.request('torrentStop', () => ({ ids }));
  }

  async removeTorrents(ids: string[], deleteLocalData = false) {
    await this.request('torrentRemove', (style) => ({
      ids,
      [style === 'jsonrpc2' ? 'delete_local_data' : 'delete-local-data']: deleteLocalData,
    }));
  }

  async addTorrent(input: DownloaderAddTorrentInput) {
    const baseArgs: Record<string, unknown> = {
      paused: input.startImmediately === false,
    };
    if (input.urls?.trim()) {
      baseArgs.filename = input.urls.trim();
    } else if (input.torrentFile) {
      const bytes = await input.torrentFile.arrayBuffer();
      baseArgs.metainfo = Buffer.from(bytes).toString('base64');
    } else {
      throw new TransmissionClientError('TRANSMISSION_TORRENT_SOURCE_MISSING', 400);
    }

    await this.request('torrentAdd', (style) => ({
      ...baseArgs,
      [style === 'jsonrpc2' ? 'download_dir' : 'download-dir']: input.savePath,
    }));
  }
}
