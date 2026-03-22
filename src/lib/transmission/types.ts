export type TransmissionRpcStyle = 'legacy' | 'jsonrpc2';

export interface TransmissionSession {
  version: string;
  downloadDir: string;
  rpcVersion: number | null;
  rpcVersionSemver: string;
}

export interface TransmissionStatsSnapshot {
  downloadedBytes: number;
  uploadedBytes: number;
  filesAdded: number;
  secondsActive: number;
  sessionCount: number;
}

export interface TransmissionSessionStats {
  activeTorrentCount: number;
  pausedTorrentCount: number;
  torrentCount: number;
  downloadSpeed: number;
  uploadSpeed: number;
  cumulativeStats: TransmissionStatsSnapshot;
  currentStats: TransmissionStatsSnapshot;
}

export interface TransmissionFile {
  name: string;
  length: number;
  bytesCompleted: number;
}

export interface TransmissionFileStat {
  bytesCompleted: number;
  wanted: boolean;
  priority: number;
}

export interface TransmissionTracker {
  id: number;
  announce: string;
  scrape: string;
  sitename: string;
  tier: number;
}

export interface TransmissionTrackerStat {
  id: number;
  announce: string;
  host: string;
  sitename: string;
  seederCount: number;
  leecherCount: number;
  downloaderCount: number;
  lastAnnounceResult: string;
}

export interface TransmissionPeer {
  address: string;
  clientName: string;
  flagStr: string;
  port: number;
  progress: number;
  rateToClient: number;
  rateToPeer: number;
}

export interface TransmissionTorrent {
  id: number;
  hashString: string;
  name: string;
  downloadDir: string;
  error: number;
  errorString: string;
  eta: number;
  rateDownload: number;
  rateUpload: number;
  percentDone: number;
  metadataPercentComplete: number;
  sizeWhenDone: number;
  totalSize: number;
  addedDate: number;
  uploadedEver: number;
  downloadedEver: number;
  haveValid: number;
  peersConnected: number;
  peersSendingToUs: number;
  peersGettingFromUs: number;
  uploadRatio: number;
  status: number;
  isFinished: boolean;
  labels: string[];
  files: TransmissionFile[];
  fileStats: TransmissionFileStat[];
  trackers: TransmissionTracker[];
  trackerStats: TransmissionTrackerStat[];
  peers: TransmissionPeer[];
}
