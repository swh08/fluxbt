// Torrent Manager Types

export type TorrentStatus = 'downloading' | 'seeding' | 'paused' | 'queued' | 'error';

export type TorrentType = 'ISO' | 'Software' | 'Video' | 'Audio' | 'Document' | 'Archive' | 'Other';

export interface TorrentFile {
  id: string;
  name: string;
  size: number; // in bytes
  progress: number; // 0-100
}

export interface ConnectedPeer {
  id: string;
  ip: string;
  port: number;
  client: string;
  progress: number;
  downloadSpeed: number; // in bytes per second
  uploadSpeed: number; // in bytes per second
  flags: string;
}

export interface Torrent {
  id: string;
  name: string;
  type: TorrentType;
  size: number; // in bytes
  path: string;
  trackers: string[];
  status: TorrentStatus;
  progress: number; // 0-100
  downloadSpeed: number; // in bytes per second
  uploadSpeed: number; // in bytes per second
  eta: number; // in seconds, -1 means infinite/unknown
  seeds: number;
  peers: number;
  ratio: number;
  addedAt: Date;
  category: string;
  tags: string[];
  serverId: string; // ID of the server this torrent belongs to
  files: TorrentFile[];
  connectedPeers: ConnectedPeer[];
  totalDownloaded: number; // in bytes
  totalUploaded: number; // in bytes
}

export interface ServerInfo {
  name: string;
  ip: string;
  port: number;
  status: 'online' | 'offline' | 'connecting';
  version: string;
}

export interface ServerStats {
  id: string;
  name: string;
  type: 'qbittorrent' | 'transmission';
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline' | 'connecting';
  version: string;
  downloadSpeed: number;
  uploadSpeed: number;
  totalDownloaded: number;
  totalUploaded: number;
  torrentsCount: number;
  downloadingCount: number;
  seedingCount: number;
  downloadSpeedHistory: number[];
  uploadSpeedHistory: number[];
}

export interface SpeedStats {
  downloadSpeed: number; // in bytes per second
  uploadSpeed: number; // in bytes per second
}

// Status filter type for sidebar
export type StatusFilter = 'all' | TorrentStatus;

// Category type
export interface Category {
  id: string;
  name: string;
  count: number;
}

// Tag type
export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface DashboardStats {
  totalServers: number;
  onlineServers: number;
  totalTorrents: number;
  totalDownloadSpeed: number;
  totalUploadSpeed: number;
  allTimeDownloaded: number;
  allTimeUploaded: number;
  downloadingCount: number;
  seedingCount: number;
  downloadSpeedHistory: number[];
  uploadSpeedHistory: number[];
}

export interface TrackerShare {
  id: string;
  name: string;
  uploadBytes: number;
  percentage: number;
}

export interface CountryUploadShare {
  id: string;
  countryCode: string;
  countryName: string;
  uploadBytes: number;
  percentage: number;
}

export interface DistributionItem {
  id: string;
  label: string;
  size: number;
  count: number;
}

export interface AppStateSnapshot {
  servers: ServerStats[];
  dashboard: DashboardStats;
  selectedServerId: string | null;
  userTimezone: string;
  todayUploadSampledAt: string | null;
  categories: Category[];
  tags: Tag[];
  torrents: Torrent[];
  trackerShares: TrackerShare[];
  countryUploads: CountryUploadShare[];
}
