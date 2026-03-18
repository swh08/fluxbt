import { Torrent, Category, Tag, TorrentStatus } from './types';

// Helper function to format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format speed
export function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s';
}

// Helper function to format speed without /s suffix
export function formatSpeedShort(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0';
  const k = 1024;
  const sizes = ['B', 'K', 'M', 'G', 'T'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

// Helper function to format ETA
export function formatETA(seconds: number): string {
  if (seconds < 0) return '∞';
  if (seconds === 0) return '0s';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

// Helper function to format date
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Mock servers data for Dashboard
export interface ServerStats {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: 'online' | 'offline';
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
  // Upload distribution by country
  uploadDistribution: CountryUploadData[];
}

// Country upload data type
export interface CountryUploadData {
  nameKey: string; // Translation key
  uploadGB: number;
  id: string; // UN numeric code
}

// Server-specific upload distribution data
const server1UploadDistribution: CountryUploadData[] = [
  { nameKey: 'countries.unitedStates', uploadGB: 45.2, id: '840' },
  { nameKey: 'countries.china', uploadGB: 32.1, id: '156' },
  { nameKey: 'countries.germany', uploadGB: 18.5, id: '276' },
  { nameKey: 'countries.japan', uploadGB: 22.3, id: '392' },
  { nameKey: 'countries.unitedKingdom', uploadGB: 12.4, id: '826' },
  { nameKey: 'countries.france', uploadGB: 8.7, id: '250' },
  { nameKey: 'countries.canada', uploadGB: 6.2, id: '124' },
  { nameKey: 'countries.australia', uploadGB: 5.8, id: '036' },
];

const server2UploadDistribution: CountryUploadData[] = [
  { nameKey: 'countries.unitedStates', uploadGB: 68.3, id: '840' },
  { nameKey: 'countries.china', uploadGB: 28.9, id: '156' },
  { nameKey: 'countries.germany', uploadGB: 24.6, id: '276' },
  { nameKey: 'countries.netherlands', uploadGB: 15.2, id: '528' },
  { nameKey: 'countries.france', uploadGB: 12.8, id: '250' },
  { nameKey: 'countries.spain', uploadGB: 9.4, id: '724' },
  { nameKey: 'countries.italy', uploadGB: 8.1, id: '380' },
  { nameKey: 'countries.southKorea', uploadGB: 11.5, id: '410' },
  { nameKey: 'countries.poland', uploadGB: 6.3, id: '616' },
  { nameKey: 'countries.sweden', uploadGB: 5.1, id: '752' },
];

const server3UploadDistribution: CountryUploadData[] = [
  { nameKey: 'countries.brazil', uploadGB: 18.4, id: '076' },
  { nameKey: 'countries.russia', uploadGB: 14.2, id: '643' },
  { nameKey: 'countries.india', uploadGB: 12.8, id: '356' },
  { nameKey: 'countries.mexico', uploadGB: 7.6, id: '484' },
  { nameKey: 'countries.argentina', uploadGB: 5.2, id: '032' },
  { nameKey: 'countries.indonesia', uploadGB: 4.1, id: '360' },
];

export const mockServers: ServerStats[] = [
  {
    id: 'server-1',
    name: 'Home Server',
    ip: '192.168.1.100',
    port: 8080,
    status: 'online',
    version: '5.0.4',
    downloadSpeed: 25430000, // ~24.2 MB/s
    uploadSpeed: 5560000, // ~5.3 MB/s
    totalDownloaded: 854000000000, // ~795 GB
    totalUploaded: 1243000000000, // ~1.13 TB
    torrentsCount: 9,
    downloadingCount: 4,
    seedingCount: 2,
    downloadSpeedHistory: [12, 15, 18, 22, 19, 24, 21, 25, 23, 26, 24, 22],
    uploadSpeedHistory: [4, 5, 4.5, 5.2, 5.8, 5.5, 5.3, 5.6, 5.2, 5.4, 5.1, 5.3],
    uploadDistribution: server1UploadDistribution,
  },
  {
    id: 'server-2',
    name: 'Seedbox NL',
    ip: '185.45.67.89',
    port: 9091,
    status: 'online',
    version: '4.6.2',
    downloadSpeed: 15600000, // ~14.9 MB/s
    uploadSpeed: 32000000, // ~30.5 MB/s
    totalDownloaded: 2156000000000, // ~2.0 TB
    totalUploaded: 8970000000000, // ~8.15 TB
    torrentsCount: 11,
    downloadingCount: 2,
    seedingCount: 8,
    downloadSpeedHistory: [10, 12, 14, 13, 15, 14, 16, 15, 14, 15, 16, 15],
    uploadSpeedHistory: [28, 30, 32, 31, 33, 32, 34, 33, 31, 32, 30, 31],
    uploadDistribution: server2UploadDistribution,
  },
  {
    id: 'server-3',
    name: 'Office NAS',
    ip: '10.0.0.50',
    port: 8080,
    status: 'offline',
    version: '4.5.0',
    downloadSpeed: 0,
    uploadSpeed: 0,
    totalDownloaded: 560000000000, // ~521 GB
    totalUploaded: 320000000000, // ~298 GB
    torrentsCount: 6,
    downloadingCount: 0,
    seedingCount: 2,
    downloadSpeedHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    uploadSpeedHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    uploadDistribution: server3UploadDistribution,
  },
];

// Dashboard aggregated stats
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

export function getDashboardStats(): DashboardStats {
  const onlineServers = mockServers.filter(s => s.status === 'online').length;
  const totalTorrents = mockServers.reduce((sum, s) => sum + s.torrentsCount, 0);
  const totalDownloadSpeed = mockServers.reduce((sum, s) => sum + s.downloadSpeed, 0);
  const totalUploadSpeed = mockServers.reduce((sum, s) => sum + s.uploadSpeed, 0);
  const allTimeDownloaded = mockServers.reduce((sum, s) => sum + s.totalDownloaded, 0);
  const allTimeUploaded = mockServers.reduce((sum, s) => sum + s.totalUploaded, 0);
  const downloadingCount = mockServers.reduce((sum, s) => sum + s.downloadingCount, 0);
  const seedingCount = mockServers.reduce((sum, s) => sum + s.seedingCount, 0);

  // Aggregate speed history from all servers
  const downloadSpeedHistory = mockServers[0].downloadSpeedHistory.map((_, index) => 
    mockServers.reduce((sum, server) => sum + (server.downloadSpeedHistory[index] || 0), 0)
  );
  const uploadSpeedHistory = mockServers[0].uploadSpeedHistory.map((_, index) => 
    mockServers.reduce((sum, server) => sum + (server.uploadSpeedHistory[index] || 0), 0)
  );

  return {
    totalServers: mockServers.length,
    onlineServers,
    totalTorrents,
    totalDownloadSpeed,
    totalUploadSpeed,
    allTimeDownloaded,
    allTimeUploaded,
    downloadingCount,
    seedingCount,
    downloadSpeedHistory,
    uploadSpeedHistory,
  };
}

// Mock server info for sidebar (first server)
export const mockServerInfo = {
  name: 'Home Server',
  ip: '192.168.1.100',
  port: 8080,
  status: 'online' as const,
  version: '5.0.4',
};



// Mock categories
export const mockCategories: Category[] = [
  { id: 'iso', name: 'ISO', count: 3 },
  { id: 'software', name: 'Software', count: 2 },
  { id: 'video', name: 'Video', count: 2 },
  { id: 'archive', name: 'Archive', count: 1 },
];

// Mock tags
export const mockTags: Tag[] = [
  { id: 'linux', name: 'Linux', color: '#10B981', count: 3 },
  { id: 'opensource', name: 'Open Source', color: '#3B82F6', count: 4 },
  { id: 'media', name: 'Media', color: '#8B5CF6', count: 2 },
];

// Mock torrents data - distributed across servers
export const mockTorrents: Torrent[] = [
  // Server 1 torrents (Home Server)
  {
    id: '1',
    name: 'archlinux-2026.03.01-x86_64.iso',
    type: 'ISO',
    size: 1181116006,
    path: '/downloads/iso',
    trackers: ['tracker.archlinux.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 2560000,
    eta: -1,
    seeds: 0,
    peers: 12,
    ratio: 3.42,
    addedAt: new Date('2026-03-01T10:30:00'),
    category: 'iso',
    tags: ['linux', 'opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f1', name: 'archlinux-2026.03.01-x86_64.iso', size: 1181116006, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p1', ip: '192.168.104.124', port: 51413, client: 'qBittorrent 4.6.2', progress: 45, downloadSpeed: 0, uploadSpeed: 246600, flags: 'D' },
      { id: 'p2', ip: '10.0.0.55', port: 51414, client: 'Transmission 4.0', progress: 78, downloadSpeed: 0, uploadSpeed: 512000, flags: 'D' },
      { id: 'p3', ip: '172.16.0.88', port: 51415, client: 'Deluge 2.1.1', progress: 92, downloadSpeed: 0, uploadSpeed: 768000, flags: 'D' },
    ],
    totalDownloaded: 1181116006,
    totalUploaded: 4040000000,
  },
  {
    id: '2',
    name: 'ubuntu-24.04.2-desktop-amd64.iso',
    type: 'ISO',
    size: 5368709120,
    path: '/downloads/iso',
    trackers: ['torrent.ubuntu.com'],
    status: 'downloading',
    progress: 67,
    downloadSpeed: 12478000,
    uploadSpeed: 3456000,
    eta: 287,
    seeds: 89,
    peers: 5,
    ratio: 0.23,
    addedAt: new Date('2026-03-15T14:20:00'),
    category: 'iso',
    tags: ['linux', 'opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f2', name: 'ubuntu-24.04.2-desktop-amd64.iso', size: 5368709120, progress: 67 },
    ],
    connectedPeers: [
      { id: 'p4', ip: '45.33.32.156', port: 51416, client: 'qBittorrent 4.6.0', progress: 100, downloadSpeed: 1024000, uploadSpeed: 0, flags: 'U' },
      { id: 'p5', ip: '104.28.1.78', port: 51417, client: 'libtorrent 2.0', progress: 100, downloadSpeed: 2048000, uploadSpeed: 0, flags: 'U' },
    ],
    totalDownloaded: 3597000000,
    totalUploaded: 826000000,
  },
  {
    id: '3',
    name: 'Blender-4.2.0-Linux-x64.tar.xz',
    type: 'Software',
    size: 322122547,
    path: '/downloads/software',
    trackers: ['blender.org'],
    status: 'downloading',
    progress: 34,
    downloadSpeed: 5600000,
    uploadSpeed: 1200000,
    eta: 52,
    seeds: 45,
    peers: 8,
    ratio: 0.08,
    addedAt: new Date('2026-03-17T08:45:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f3', name: 'Blender-4.2.0-Linux-x64.tar.xz', size: 322122547, progress: 34 },
    ],
    connectedPeers: [
      { id: 'p6', ip: '78.46.128.100', port: 51418, client: 'qBittorrent 4.5.5', progress: 100, downloadSpeed: 2048000, uploadSpeed: 0, flags: 'U' },
    ],
    totalDownloaded: 109500000000,
    totalUploaded: 88000000,
  },
  {
    id: '4',
    name: 'debian-12.5.0-amd64-netinst.iso',
    type: 'ISO',
    size: 650000000,
    path: '/downloads/iso',
    trackers: ['cdimage.debian.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 1800000,
    eta: -1,
    seeds: 0,
    peers: 6,
    ratio: 2.15,
    addedAt: new Date('2026-02-28T09:15:00'),
    category: 'iso',
    tags: ['linux', 'opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f4', name: 'debian-12.5.0-amd64-netinst.iso', size: 650000000, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p7', ip: '93.184.216.34', port: 51419, client: 'Transmission 4.0.3', progress: 67, downloadSpeed: 0, uploadSpeed: 450000, flags: 'D' },
    ],
    totalDownloaded: 650000000,
    totalUploaded: 1397500000,
  },
  {
    id: '5',
    name: 'FreeBSD-14.0-RELEASE-amd64-dvd1.iso',
    type: 'ISO',
    size: 4831838208,
    path: '/downloads/iso',
    trackers: ['torrent.freebsd.org'],
    status: 'paused',
    progress: 23,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 0,
    peers: 0,
    ratio: 0.05,
    addedAt: new Date('2026-03-14T11:30:00'),
    category: 'iso',
    tags: ['opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f5', name: 'FreeBSD-14.0-RELEASE-amd64-dvd1.iso', size: 4831838208, progress: 23 },
    ],
    connectedPeers: [],
    totalDownloaded: 1111300000,
    totalUploaded: 55600000,
  },
  // Server 2 torrents (Seedbox NL)
  {
    id: '6',
    name: 'fedora-41-workstation-x86_64.iso',
    type: 'ISO',
    size: 2147483648,
    path: '/downloads/iso',
    trackers: ['torrent.fedoraproject.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 4500000,
    eta: -1,
    seeds: 0,
    peers: 18,
    ratio: 8.34,
    addedAt: new Date('2026-02-15T16:00:00'),
    category: 'iso',
    tags: ['linux', 'opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f6', name: 'fedora-41-workstation-x86_64.iso', size: 2147483648, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p8', ip: '192.168.1.50', port: 51420, client: 'qBittorrent 4.6.2', progress: 34, downloadSpeed: 0, uploadSpeed: 890000, flags: 'D' },
      { id: 'p9', ip: '10.0.0.100', port: 51421, client: 'Deluge 2.0.3', progress: 78, downloadSpeed: 0, uploadSpeed: 1120000, flags: 'D' },
    ],
    totalDownloaded: 2147483648,
    totalUploaded: 17910000000,
  },
  {
    id: '7',
    name: 'Kubernetes-v1.32.0-linux-amd64.tar.gz',
    type: 'Software',
    size: 214748364,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 890000,
    eta: -1,
    seeds: 0,
    peers: 5,
    ratio: 12.56,
    addedAt: new Date('2026-01-20T11:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f7', name: 'Kubernetes-v1.32.0-linux-amd64.tar.gz', size: 214748364, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p10', ip: '52.64.0.1', port: 51422, client: 'libtorrent 2.0.9', progress: 56, downloadSpeed: 0, uploadSpeed: 340000, flags: 'D' },
    ],
    totalDownloaded: 214748364,
    totalUploaded: 2697000000,
  },
  {
    id: '8',
    name: 'big-buck-bunny-4k.webm',
    type: 'Video',
    size: 4294967296,
    path: '/downloads/video',
    trackers: ['peach.blender.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 1800000,
    eta: -1,
    seeds: 0,
    peers: 8,
    ratio: 5.67,
    addedAt: new Date('2026-02-20T09:00:00'),
    category: 'video',
    tags: ['media', 'opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f8', name: 'big-buck-bunny-4k.webm', size: 4294967296, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p11', ip: '192.168.50.200', port: 51423, client: 'Transmission 3.0', progress: 23, downloadSpeed: 0, uploadSpeed: 560000, flags: 'D' },
      { id: 'p12', ip: '10.10.10.15', port: 51424, client: 'qBittorrent 4.6.2', progress: 56, downloadSpeed: 0, uploadSpeed: 720000, flags: 'D' },
    ],
    totalDownloaded: 4294967296,
    totalUploaded: 24350000000,
  },
  {
    id: '9',
    name: 'tears-of-steel-4k.mkv',
    type: 'Video',
    size: 8589934592,
    path: '/downloads/video',
    trackers: ['mango.blender.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 3200000,
    eta: -1,
    seeds: 0,
    peers: 14,
    ratio: 4.23,
    addedAt: new Date('2026-02-10T14:00:00'),
    category: 'video',
    tags: ['media', 'opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f9', name: 'tears-of-steel-4k.mkv', size: 8589934592, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p13', ip: '172.16.50.10', port: 51425, client: 'qBittorrent 4.5.4', progress: 12, downloadSpeed: 0, uploadSpeed: 780000, flags: 'D' },
      { id: 'p14', ip: '192.168.100.5', port: 51426, client: 'Transmission 4.0', progress: 89, downloadSpeed: 0, uploadSpeed: 960000, flags: 'D' },
    ],
    totalDownloaded: 8589934592,
    totalUploaded: 36330000000,
  },
  {
    id: '10',
    name: 'spring-framework-6.2.0-dist.tar.gz',
    type: 'Software',
    size: 157286400,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 560000,
    eta: -1,
    seeds: 0,
    peers: 3,
    ratio: 15.8,
    addedAt: new Date('2026-01-15T08:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f10', name: 'spring-framework-6.2.0-dist.tar.gz', size: 157286400, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p15', ip: '151.101.1.69', port: 51427, client: 'Deluge 2.1.1', progress: 45, downloadSpeed: 0, uploadSpeed: 280000, flags: 'D' },
    ],
    totalDownloaded: 157286400,
    totalUploaded: 2485000000,
  },
  {
    id: '11',
    name: 'node-v22.0.0-linux-x64.tar.xz',
    type: 'Software',
    size: 283115520,
    path: '/downloads/software',
    trackers: ['nodejs.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 720000,
    eta: -1,
    seeds: 0,
    peers: 7,
    ratio: 6.45,
    addedAt: new Date('2026-02-05T10:30:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f11', name: 'node-v22.0.0-linux-x64.tar.xz', size: 283115520, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p16', ip: '104.16.1.2', port: 51428, client: 'qBittorrent 4.6.0', progress: 78, downloadSpeed: 0, uploadSpeed: 360000, flags: 'D' },
    ],
    totalDownloaded: 283115520,
    totalUploaded: 1826000000,
  },
  {
    id: '12',
    name: 'opensuse-tumbleweed-dvd-x86_64.iso',
    type: 'ISO',
    size: 5368709120,
    path: '/downloads/iso',
    trackers: ['download.opensuse.org'],
    status: 'downloading',
    progress: 45,
    downloadSpeed: 8900000,
    uploadSpeed: 2100000,
    eta: 580,
    seeds: 67,
    peers: 12,
    ratio: 0.18,
    addedAt: new Date('2026-03-16T20:00:00'),
    category: 'iso',
    tags: ['linux', 'opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f12', name: 'opensuse-tumbleweed-dvd-x86_64.iso', size: 5368709120, progress: 45 },
    ],
    connectedPeers: [
      { id: 'p17', ip: '195.135.221.150', port: 51429, client: 'Transmission 4.0', progress: 100, downloadSpeed: 3200000, uploadSpeed: 0, flags: 'U' },
      { id: 'p18', ip: '82.165.230.27', port: 51430, client: 'qBittorrent 4.5.5', progress: 100, downloadSpeed: 2800000, uploadSpeed: 0, flags: 'U' },
    ],
    totalDownloaded: 2415900000,
    totalUploaded: 435000000,
  },
  {
    id: '13',
    name: 'python-3.13.0-docs-html.tar.bz2',
    type: 'Archive',
    size: 89128960,
    path: '/downloads/docs',
    trackers: ['docs.python.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 340000,
    eta: -1,
    seeds: 0,
    peers: 4,
    ratio: 9.12,
    addedAt: new Date('2026-01-25T15:00:00'),
    category: 'archive',
    tags: ['opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f13', name: 'python-3.13.0-docs-html.tar.bz2', size: 89128960, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p19', ip: '45.55.99.72', port: 51431, client: 'Deluge 2.0.3', progress: 100, downloadSpeed: 0, uploadSpeed: 0, flags: 'U' },
    ],
    totalDownloaded: 89128960,
    totalUploaded: 812900000,
  },
  {
    id: '14',
    name: 'docker-27.0.0.tgz',
    type: 'Software',
    size: 68157440,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 450000,
    eta: -1,
    seeds: 0,
    peers: 6,
    ratio: 11.23,
    addedAt: new Date('2026-01-18T09:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f14', name: 'docker-27.0.0.tgz', size: 68157440, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p20', ip: '18.213.154.209', port: 51432, client: 'qBittorrent 4.6.2', progress: 34, downloadSpeed: 0, uploadSpeed: 180000, flags: 'D' },
    ],
    totalDownloaded: 68157440,
    totalUploaded: 765400000,
  },
  {
    id: '15',
    name: 'rust-1.78.0-x86_64-unknown-linux-gnu.tar.gz',
    type: 'Software',
    size: 256901120,
    path: '/downloads/software',
    trackers: ['static.rust-lang.org'],
    status: 'downloading',
    progress: 78,
    downloadSpeed: 6700000,
    uploadSpeed: 1800000,
    eta: 35,
    seeds: 123,
    peers: 8,
    ratio: 0.42,
    addedAt: new Date('2026-03-17T06:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f15', name: 'rust-1.78.0-x86_64-unknown-linux-gnu.tar.gz', size: 256901120, progress: 78 },
    ],
    connectedPeers: [
      { id: 'p21', ip: '143.244.181.87', port: 51433, client: 'Transmission 4.0.3', progress: 100, downloadSpeed: 2800000, uploadSpeed: 0, flags: 'U' },
    ],
    totalDownloaded: 200380000,
    totalUploaded: 84200000,
  },
  {
    id: '16',
    name: 'elixir-otp-27.zip',
    type: 'Software',
    size: 125829120,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'queued',
    progress: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 45,
    peers: 3,
    ratio: 0,
    addedAt: new Date('2026-03-17T12:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-2',
    files: [
      { id: 'f16', name: 'elixir-otp-27.zip', size: 125829120, progress: 0 },
    ],
    connectedPeers: [],
    totalDownloaded: 0,
    totalUploaded: 0,
  },
  // Server 3 torrents (Office NAS)
  {
    id: '17',
    name: 'cosmos-laundromat-4k.mkv',
    type: 'Video',
    size: 7516192768,
    path: '/downloads/video',
    trackers: ['blender.org'],
    status: 'error',
    progress: 12,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 0,
    peers: 0,
    ratio: 0.02,
    addedAt: new Date('2026-03-12T22:30:00'),
    category: 'video',
    tags: ['media', 'opensource'],
    serverId: 'server-3',
    files: [
      { id: 'f17', name: 'cosmos-laundromat-4k.mkv', size: 7516192768, progress: 12 },
    ],
    connectedPeers: [],
    totalDownloaded: 902000000,
    totalUploaded: 18000000,
  },
  {
    id: '18',
    name: 'opensource-fonts-collection-2026.tar.bz2',
    type: 'Archive',
    size: 1073741824,
    path: '/downloads/fonts',
    trackers: ['fonts.opensource.org'],
    status: 'paused',
    progress: 89,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 0,
    peers: 0,
    ratio: 0.45,
    addedAt: new Date('2026-03-16T18:00:00'),
    category: 'archive',
    tags: ['opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f18', name: 'opensource-fonts-collection-2026.tar.bz2', size: 1073741824, progress: 89 },
    ],
    connectedPeers: [],
    totalDownloaded: 955000000,
    totalUploaded: 430000000,
  },
  {
    id: '19',
    name: 'godot-4.3-stable-linux-x86_64.zip',
    type: 'Software',
    size: 56623104,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'paused',
    progress: 56,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 0,
    peers: 0,
    ratio: 0.15,
    addedAt: new Date('2026-03-15T07:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-3',
    files: [
      { id: 'f19', name: 'godot-4.3-stable-linux-x86_64.zip', size: 56623104, progress: 56 },
    ],
    connectedPeers: [],
    totalDownloaded: 31700000,
    totalUploaded: 4800000,
  },
  {
    id: '20',
    name: 'golang-1.23.0.linux-amd64.tar.gz',
    type: 'Software',
    size: 141557760,
    path: '/downloads/software',
    trackers: ['go.dev'],
    status: 'error',
    progress: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 0,
    peers: 0,
    ratio: 0,
    addedAt: new Date('2026-03-17T05:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-3',
    files: [
      { id: 'f20', name: 'golang-1.23.0.linux-amd64.tar.gz', size: 141557760, progress: 0 },
    ],
    connectedPeers: [],
    totalDownloaded: 0,
    totalUploaded: 0,
  },
  {
    id: '21',
    name: 'vim-9.1.tar.gz',
    type: 'Software',
    size: 17825792,
    path: '/downloads/software',
    trackers: ['vim.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 120000,
    eta: -1,
    seeds: 0,
    peers: 2,
    ratio: 28.5,
    addedAt: new Date('2026-01-10T14:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-3',
    files: [
      { id: 'f21', name: 'vim-9.1.tar.gz', size: 17825792, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p22', ip: '192.168.0.45', port: 51434, client: 'qBittorrent 4.4.5', progress: 89, downloadSpeed: 0, uploadSpeed: 60000, flags: 'D' },
    ],
    totalDownloaded: 17825792,
    totalUploaded: 508000000,
  },
  {
    id: '22',
    name: 'redis-7.4.0.tar.gz',
    type: 'Software',
    size: 22020096,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'queued',
    progress: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 89,
    peers: 5,
    ratio: 0,
    addedAt: new Date('2026-03-17T13:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-3',
    files: [
      { id: 'f22', name: 'redis-7.4.0.tar.gz', size: 22020096, progress: 0 },
    ],
    connectedPeers: [],
    totalDownloaded: 0,
    totalUploaded: 0,
  },
  {
    id: '23',
    name: 'postgresql-17.0.tar.bz2',
    type: 'Software',
    size: 31457280,
    path: '/downloads/software',
    trackers: ['ftp.postgresql.org'],
    status: 'seeding',
    progress: 100,
    downloadSpeed: 0,
    uploadSpeed: 180000,
    eta: -1,
    seeds: 0,
    peers: 3,
    ratio: 18.2,
    addedAt: new Date('2026-01-28T11:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-3',
    files: [
      { id: 'f23', name: 'postgresql-17.0.tar.bz2', size: 31457280, progress: 100 },
    ],
    connectedPeers: [
      { id: 'p23', ip: '147.75.85.93', port: 51435, client: 'Transmission 3.0', progress: 67, downloadSpeed: 0, uploadSpeed: 90000, flags: 'D' },
    ],
    totalDownloaded: 31457280,
    totalUploaded: 572400000,
  },
  {
    id: '24',
    name: 'llvm-project-19.0.0.src.tar.xz',
    type: 'Software',
    size: 1395864371,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'downloading',
    progress: 12,
    downloadSpeed: 4500000,
    uploadSpeed: 890000,
    eta: 4520,
    seeds: 34,
    peers: 6,
    ratio: 0.03,
    addedAt: new Date('2026-03-17T02:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f24', name: 'llvm-project-19.0.0.src.tar.xz', size: 1395864371, progress: 12 },
    ],
    connectedPeers: [
      { id: 'p24', ip: '140.82.121.3', port: 51436, client: 'qBittorrent 4.6.1', progress: 100, downloadSpeed: 1800000, uploadSpeed: 0, flags: 'U' },
      { id: 'p25', ip: '185.199.108.154', port: 51437, client: 'libtorrent 2.0.8', progress: 100, downloadSpeed: 1500000, uploadSpeed: 0, flags: 'U' },
    ],
    totalDownloaded: 167500000,
    totalUploaded: 5000000,
  },
  {
    id: '25',
    name: 'tensorflow-2.17.0-cp310-linux_x86_64.whl',
    type: 'Software',
    size: 524288000,
    path: '/downloads/software',
    trackers: ['files.pythonhosted.org'],
    status: 'downloading',
    progress: 56,
    downloadSpeed: 7800000,
    uploadSpeed: 1600000,
    eta: 180,
    seeds: 78,
    peers: 9,
    ratio: 0.21,
    addedAt: new Date('2026-03-16T22:00:00'),
    category: 'software',
    tags: ['opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f25', name: 'tensorflow-2.17.0-cp310-linux_x86_64.whl', size: 524288000, progress: 56 },
    ],
    connectedPeers: [
      { id: 'p26', ip: '151.101.0.223', port: 51438, client: 'Deluge 2.1.1', progress: 100, downloadSpeed: 2400000, uploadSpeed: 0, flags: 'U' },
    ],
    totalDownloaded: 293600000,
    totalUploaded: 61600000,
  },
  {
    id: '26',
    name: 'openshot-3.3.0-linux-x86_64.AppImage',
    type: 'Software',
    size: 178257920,
    path: '/downloads/software',
    trackers: ['github.com'],
    status: 'queued',
    progress: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    eta: -1,
    seeds: 56,
    peers: 4,
    ratio: 0,
    addedAt: new Date('2026-03-17T11:30:00'),
    category: 'software',
    tags: ['media', 'opensource'],
    serverId: 'server-1',
    files: [
      { id: 'f26', name: 'openshot-3.3.0-linux-x86_64.AppImage', size: 178257920, progress: 0 },
    ],
    connectedPeers: [],
    totalDownloaded: 0,
    totalUploaded: 0,
  },
];

// Get status count
export function getStatusCount(torrents: Torrent[], status: TorrentStatus | 'all'): number {
  if (status === 'all') return torrents.length;
  return torrents.filter(t => t.status === status).length;
}

// Filter torrents by status
export function filterByStatus(torrents: Torrent[], status: TorrentStatus | 'all'): Torrent[] {
  if (status === 'all') return torrents;
  return torrents.filter(t => t.status === status);
}

// Filter torrents by server
export function filterByServer(torrents: Torrent[], serverId: string): Torrent[] {
  return torrents.filter(t => t.serverId === serverId);
}

// Search torrents by name
export function searchTorrents(torrents: Torrent[], query: string): Torrent[] {
  if (!query.trim()) return torrents;
  const lowerQuery = query.toLowerCase();
  return torrents.filter(t => t.name.toLowerCase().includes(lowerQuery));
}

// Get status color
export function getStatusColor(status: TorrentStatus): string {
  const colors: Record<TorrentStatus, string> = {
    downloading: 'text-blue-500',
    seeding: 'text-emerald-500',
    paused: 'text-slate-500',
    queued: 'text-sky-400',
    error: 'text-red-500',
  };
  return colors[status];
}

// Get status background color
export function getStatusBgColor(status: TorrentStatus): string {
  const colors: Record<TorrentStatus, string> = {
    downloading: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    seeding: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    paused: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    queued: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return colors[status];
}

// Get progress bar color
export function getProgressColor(status: TorrentStatus, progress: number): string {
  if (status === 'error') return 'bg-red-500';
  if (progress === 100 || status === 'seeding') return 'bg-emerald-500';
  if (status === 'downloading') return 'bg-blue-500';
  if (status === 'paused') return 'bg-slate-500';
  if (status === 'queued') return 'bg-sky-400';
  return 'bg-blue-500';
}
