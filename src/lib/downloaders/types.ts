import type { Category, ServerStats, Tag, Torrent } from '@/lib/types';

export interface DownloaderAddTorrentInput {
  urls?: string;
  torrentFile?: File;
  savePath?: string;
  category?: string;
  tags?: string[];
  startImmediately?: boolean;
}

export interface DownloaderLiveState {
  stats: ServerStats;
  torrents: Torrent[];
  categories: Category[];
  tags: Tag[];
}

export interface DownloaderClient {
  getLiveState(): Promise<DownloaderLiveState>;
  getTorrentDetails(hash: string): Promise<Torrent | null>;
  pauseTorrents(hashes: string[]): Promise<void>;
  resumeTorrents(hashes: string[]): Promise<void>;
  deleteTorrents(hashes: string[], deleteFiles?: boolean): Promise<void>;
  addTorrent(input: DownloaderAddTorrentInput): Promise<void>;
  verifyConnection(): Promise<void>;
}
