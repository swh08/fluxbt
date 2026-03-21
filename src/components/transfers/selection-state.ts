export function shouldResetSelectedTorrentDetails(
  currentTorrentId: string | null,
  nextTorrentId: string,
) {
  return currentTorrentId !== nextTorrentId;
}
