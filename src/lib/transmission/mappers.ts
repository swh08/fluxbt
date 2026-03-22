import type { ServerConnection } from '@prisma/client';
import type { ConnectedPeer, ServerStats, Torrent, TorrentFile, TorrentType } from '@/lib/types';
import { recordSpeedSample } from '@/lib/qbittorrent/history';
import type {
  TransmissionFile,
  TransmissionFileStat,
  TransmissionSessionStats,
  TransmissionTorrent,
  TransmissionTrackerStat,
} from '@/lib/transmission/types';
import { mapTransmissionStatusToStatus } from '@/lib/transmission/status';

function clampProgress(progress: number) {
  return Math.max(0, Math.min(100, Math.round(progress * 100)));
}

function inferTorrentType(name: string): TorrentType {
  const lowerName = name.toLowerCase();

  if (lowerName.endsWith('.iso')) return 'ISO';
  if (/\.(mp4|mkv|avi|webm|mov)$/.test(lowerName)) return 'Video';
  if (/\.(mp3|flac|wav|aac|m4a)$/.test(lowerName)) return 'Audio';
  if (/\.(pdf|epub|mobi|doc|docx|txt)$/.test(lowerName)) return 'Document';
  if (/\.(zip|rar|7z|tar|gz|xz)$/.test(lowerName)) return 'Archive';
  if (/\.(exe|msi|dmg|pkg|appimage|deb|rpm)$/.test(lowerName)) return 'Software';

  return 'Other';
}

function getTrackerUrls(torrent: TransmissionTorrent) {
  const urls = torrent.trackerStats
    .map((tracker) => tracker.announce)
    .filter(Boolean);

  if (urls.length > 0) {
    return urls;
  }

  return torrent.trackers
    .map((tracker) => tracker.announce)
    .filter(Boolean);
}

function getSeederCount(trackerStats: TransmissionTrackerStat[]) {
  return trackerStats.reduce((max, tracker) => Math.max(max, tracker.seederCount || 0), 0);
}

function getPeerCount(torrent: TransmissionTorrent) {
  const trackerPeerCount = torrent.trackerStats.reduce(
    (max, tracker) => Math.max(max, tracker.leecherCount || tracker.downloaderCount || 0),
    0,
  );

  return Math.max(
    trackerPeerCount,
    torrent.peersConnected,
    torrent.peersSendingToUs,
    torrent.peersGettingFromUs,
  );
}

function getTorrentProgress(torrent: TransmissionTorrent) {
  return clampProgress(Math.max(torrent.percentDone, torrent.metadataPercentComplete));
}

function mapTransmissionFile(file: TransmissionFile, fileStat?: TransmissionFileStat, index = 0): TorrentFile {
  const completedBytes = fileStat?.bytesCompleted ?? file.bytesCompleted ?? 0;

  return {
    id: String(index),
    name: file.name,
    size: file.length,
    progress: file.length > 0 ? clampProgress(completedBytes / file.length) : 0,
  };
}

function mapTransmissionPeer(peer: TransmissionTorrent['peers'][number], index: number): ConnectedPeer {
  return {
    id: `${peer.address}:${peer.port}:${index}`,
    ip: peer.address,
    port: peer.port,
    client: peer.clientName,
    progress: clampProgress(peer.progress),
    downloadSpeed: peer.rateToClient,
    uploadSpeed: peer.rateToPeer,
    flags: peer.flagStr,
  };
}

export function mapTransmissionTorrent(serverId: string, torrent: TransmissionTorrent): Torrent {
  return {
    id: torrent.hashString,
    name: torrent.name,
    type: inferTorrentType(torrent.name),
    size: torrent.sizeWhenDone || torrent.totalSize || 0,
    path: torrent.downloadDir,
    trackers: getTrackerUrls(torrent),
    status: mapTransmissionStatusToStatus(torrent.status, torrent.isFinished, torrent.error),
    progress: getTorrentProgress(torrent),
    downloadSpeed: torrent.rateDownload,
    uploadSpeed: torrent.rateUpload,
    eta: torrent.eta,
    seeds: getSeederCount(torrent.trackerStats),
    peers: getPeerCount(torrent),
    ratio: torrent.uploadRatio,
    addedAt: new Date((torrent.addedDate || 0) * 1000),
    category: '',
    tags: [],
    serverId,
    files: [],
    connectedPeers: [],
    totalDownloaded: torrent.downloadedEver || torrent.haveValid || 0,
    totalUploaded: torrent.uploadedEver || 0,
  };
}

export function mapTransmissionTorrentDetails(serverId: string, torrent: TransmissionTorrent): Torrent {
  const base = mapTransmissionTorrent(serverId, torrent);

  return {
    ...base,
    files: torrent.files.map((file, index) => mapTransmissionFile(file, torrent.fileStats[index], index)),
    connectedPeers: torrent.peers.map(mapTransmissionPeer),
  };
}

export function buildTransmissionServerStats(
  server: ServerConnection,
  version: string,
  sessionStats: TransmissionSessionStats,
  torrents: Torrent[],
): ServerStats {
  const history = recordSpeedSample(
    server.id,
    sessionStats.downloadSpeed,
    sessionStats.uploadSpeed,
  );

  return {
    id: server.id,
    name: server.name,
    type: 'transmission',
    host: server.host,
    port: server.port,
    username: server.username,
    status: 'online',
    version,
    downloadSpeed: sessionStats.downloadSpeed,
    uploadSpeed: sessionStats.uploadSpeed,
    totalDownloaded: sessionStats.cumulativeStats.downloadedBytes,
    totalUploaded: sessionStats.cumulativeStats.uploadedBytes,
    torrentsCount: sessionStats.torrentCount || torrents.length,
    downloadingCount: torrents.filter((torrent) => torrent.status === 'downloading').length,
    seedingCount: torrents.filter((torrent) => torrent.status === 'seeding').length,
    downloadSpeedHistory: history.download,
    uploadSpeedHistory: history.upload,
  };
}
