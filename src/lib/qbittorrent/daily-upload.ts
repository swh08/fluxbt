import type { ServerConnection } from '@prisma/client';
import type { CountryUploadShare, Torrent, TrackerShare } from '@/lib/types';
import { db } from '@/lib/db';
import { QbittorrentClient } from '@/lib/qbittorrent/client';
import { getDateKeyInTimeZone, normalizeTimeZone } from '@/lib/timezones';

interface StoredPeerState {
  uploadedBytes: number;
  countryCode: string;
  countryName: string;
  trackerName: string;
}

interface StoredDailyUploadSnapshot {
  peerStates: Record<string, StoredPeerState>;
  countryTotals: Record<string, number>;
  countryNames: Record<string, string>;
  trackerTotals: Record<string, number>;
}

interface DailyUploadVisuals {
  countryUploads: CountryUploadShare[];
  trackerShares: TrackerShare[];
  sampledAt: string | null;
}

function getTrackerName(raw: string) {
  if (!raw) {
    return 'Unknown';
  }

  try {
    return new URL(raw).hostname.replace(/^www\./, '') || 'Unknown';
  } catch {
    return raw.replace(/^https?:\/\//, '').split('/')[0] || 'Unknown';
  }
}

function parseJsonRecord<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function parseSnapshot(raw: {
  peerStates: string;
  countryTotals: string;
  countryNames: string;
  trackerTotals: string;
} | null): StoredDailyUploadSnapshot {
  if (!raw) {
    return {
      peerStates: {},
      countryTotals: {},
      countryNames: {},
      trackerTotals: {},
    };
  }

  return {
    peerStates: parseJsonRecord<Record<string, StoredPeerState>>(raw.peerStates, {}),
    countryTotals: parseJsonRecord<Record<string, number>>(raw.countryTotals, {}),
    countryNames: parseJsonRecord<Record<string, string>>(raw.countryNames, {}),
    trackerTotals: parseJsonRecord<Record<string, number>>(raw.trackerTotals, {}),
  };
}

function normalizeCountryCode(value: string | undefined) {
  return value?.trim().toUpperCase() ?? '';
}

function normalizeCountryName(value: string | undefined) {
  return value?.trim() ?? '';
}

function normalizeUploadedBytes(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function buildCountryUploads(
  countryTotals: Record<string, number>,
  countryNames: Record<string, string>,
): CountryUploadShare[] {
  const entries = Object.entries(countryTotals).filter(([, uploadBytes]) => uploadBytes > 0);
  const totalUploaded = entries.reduce((sum, [, uploadBytes]) => sum + uploadBytes, 0);

  return entries
    .map(([countryCode, uploadBytes]) => ({
      id: countryCode,
      countryCode,
      countryName: countryNames[countryCode] || countryCode,
      uploadBytes,
      percentage: totalUploaded > 0 ? uploadBytes / totalUploaded : 0,
    }))
    .sort((left, right) => right.uploadBytes - left.uploadBytes);
}

function buildTrackerShares(trackerTotals: Record<string, number>): TrackerShare[] {
  const entries = Object.entries(trackerTotals).filter(([, uploadBytes]) => uploadBytes > 0);
  const totalUploaded = entries.reduce((sum, [, uploadBytes]) => sum + uploadBytes, 0);

  return entries
    .map(([name, uploadBytes]) => ({
      id: name,
      name,
      uploadBytes,
      percentage: totalUploaded > 0 ? uploadBytes / totalUploaded : 0,
    }))
    .sort((left, right) => right.uploadBytes - left.uploadBytes)
    .slice(0, 6);
}

export async function buildDailyUploadVisuals(
  server: ServerConnection,
  torrents: Torrent[],
  timeZone: string,
): Promise<DailyUploadVisuals> {
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const dateKey = getDateKeyInTimeZone(normalizedTimeZone);
  const existing = await db.dailyUploadSnapshot.findUnique({
    where: {
      serverId_timezone_dateKey: {
        serverId: server.id,
        timezone: normalizedTimeZone,
        dateKey,
      },
    },
  });
  const stored = parseSnapshot(existing);
  const activeTorrents = torrents.filter((torrent) => torrent.uploadSpeed > 0);

  if (activeTorrents.length === 0) {
    return {
      countryUploads: buildCountryUploads(stored.countryTotals, stored.countryNames),
      trackerShares: buildTrackerShares(stored.trackerTotals),
      sampledAt: existing?.updatedAt.toISOString() ?? null,
    };
  }

  const client = new QbittorrentClient(server);
  const peerResults = await Promise.allSettled(
    activeTorrents.map(async (torrent) => ({
      torrent,
      peers: await client.getTorrentPeers(torrent.id),
    })),
  );

  const nextPeerStates = { ...stored.peerStates };
  const nextCountryTotals = { ...stored.countryTotals };
  const nextCountryNames = { ...stored.countryNames };
  const nextTrackerTotals = { ...stored.trackerTotals };

  for (const result of peerResults) {
    if (result.status !== 'fulfilled') {
      continue;
    }

    const trackerName = getTrackerName(result.value.torrent.trackers[0] ?? '');

    for (const [peerId, peer] of Object.entries(result.value.peers.peers ?? {})) {
      const peerKey = `${result.value.torrent.id}|${peerId}`;
      const previous = nextPeerStates[peerKey];
      const currentUploaded = normalizeUploadedBytes(peer.uploaded);
      const countryCode = normalizeCountryCode(peer.country_code);
      const countryName = normalizeCountryName(peer.country);

      const delta = previous
        ? currentUploaded >= previous.uploadedBytes
          ? currentUploaded - previous.uploadedBytes
          : currentUploaded
        : 0;

      nextPeerStates[peerKey] = {
        uploadedBytes: currentUploaded,
        countryCode,
        countryName,
        trackerName,
      };

      if (countryCode && countryName) {
        nextCountryNames[countryCode] = countryName;
      }

      if (delta <= 0) {
        continue;
      }

      if (countryCode) {
        nextCountryTotals[countryCode] = (nextCountryTotals[countryCode] ?? 0) + delta;
      }

      nextTrackerTotals[trackerName] = (nextTrackerTotals[trackerName] ?? 0) + delta;
    }
  }

  const snapshot = await db.dailyUploadSnapshot.upsert({
    where: {
      serverId_timezone_dateKey: {
        serverId: server.id,
        timezone: normalizedTimeZone,
        dateKey,
      },
    },
    create: {
      serverId: server.id,
      timezone: normalizedTimeZone,
      dateKey,
      peerStates: JSON.stringify(nextPeerStates),
      countryTotals: JSON.stringify(nextCountryTotals),
      countryNames: JSON.stringify(nextCountryNames),
      trackerTotals: JSON.stringify(nextTrackerTotals),
    },
    update: {
      peerStates: JSON.stringify(nextPeerStates),
      countryTotals: JSON.stringify(nextCountryTotals),
      countryNames: JSON.stringify(nextCountryNames),
      trackerTotals: JSON.stringify(nextTrackerTotals),
    },
  });

  return {
    countryUploads: buildCountryUploads(nextCountryTotals, nextCountryNames),
    trackerShares: buildTrackerShares(nextTrackerTotals),
    sampledAt: snapshot.updatedAt.toISOString(),
  };
}
