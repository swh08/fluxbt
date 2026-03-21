const COMMON_SECOND_LEVEL_SUFFIXES = new Set([
  'ac.uk',
  'co.jp',
  'co.kr',
  'co.uk',
  'com.au',
  'com.br',
  'com.cn',
  'com.hk',
  'com.mx',
  'com.tr',
  'com.tw',
  'edu.cn',
  'gov.cn',
  'gov.uk',
  'net.au',
  'net.cn',
  'ne.jp',
  'or.jp',
  'org.au',
  'org.cn',
  'org.uk',
]);

const PSEUDO_TRACKER_PATTERNS = [
  /\[\s*dht\s*\]/i,
  /\[\s*pex\s*\]/i,
  /\[\s*lsd\s*\]/i,
];

function getTrackerHostname(raw: string) {
  if (!raw) {
    return 'Unknown';
  }

  try {
    return new URL(raw).hostname.replace(/^www\./, '') || 'Unknown';
  } catch {
    return raw
      .replace(/^[a-z][a-z\d+\-.]*:\/\//i, '')
      .split('/')[0]
      .replace(/^www\./, '')
      || 'Unknown';
  }
}

function isIpLikeHost(hostname: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
}

function isPseudoTracker(raw: string) {
  const normalized = raw.trim();

  return PSEUDO_TRACKER_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function getPreferredTracker(trackers: string[]) {
  const candidates = trackers
    .map((tracker) => tracker.trim())
    .filter(Boolean);

  return candidates.find((tracker) => !isPseudoTracker(tracker)) ?? candidates[0] ?? null;
}

export function getTrackerHostLabel(raw: string) {
  const hostname = getTrackerHostname(raw).replace(/\.$/, '');

  if (!hostname || hostname === 'Unknown') {
    return 'Unknown';
  }

  if (hostname === 'localhost' || isIpLikeHost(hostname)) {
    return hostname;
  }

  const segments = hostname.split('.').filter(Boolean);

  if (segments.length <= 1) {
    return hostname;
  }

  const suffix = `${segments[segments.length - 2]}.${segments[segments.length - 1]}`;

  if (COMMON_SECOND_LEVEL_SUFFIXES.has(suffix) && segments.length >= 3) {
    return segments[segments.length - 3];
  }

  return segments[segments.length - 2];
}
