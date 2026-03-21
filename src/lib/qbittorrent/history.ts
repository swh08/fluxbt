const HISTORY_POINTS = 12;

interface SpeedHistoryEntry {
  download: number[];
  upload: number[];
}

const speedHistory = new Map<string, SpeedHistoryEntry>();

function trimHistory(points: number[]): number[] {
  return points.slice(-HISTORY_POINTS);
}

export function recordSpeedSample(serverId: string, downloadSpeed: number, uploadSpeed: number) {
  const current = speedHistory.get(serverId) ?? { download: [], upload: [] };

  const next = {
    download: trimHistory([...current.download, downloadSpeed]),
    upload: trimHistory([...current.upload, uploadSpeed]),
  };

  speedHistory.set(serverId, next);
  return next;
}

export function getSpeedHistory(serverId: string) {
  return speedHistory.get(serverId) ?? { download: [], upload: [] };
}

export function combineHistorySeries(
  histories: Array<{ downloadSpeedHistory: number[]; uploadSpeedHistory: number[] }>,
) {
  const maxLength = histories.reduce((max, history) => {
    return Math.max(max, history.downloadSpeedHistory.length, history.uploadSpeedHistory.length);
  }, 0);

  const combine = (values: number[][]) => {
    return Array.from({ length: maxLength }, (_, index) => {
      return values.reduce((sum, series) => {
        const offset = maxLength - series.length;
        return sum + (index >= offset ? series[index - offset] ?? 0 : 0);
      }, 0);
    });
  };

  return {
    downloadSpeedHistory: combine(histories.map((history) => history.downloadSpeedHistory)),
    uploadSpeedHistory: combine(histories.map((history) => history.uploadSpeedHistory)),
  };
}
