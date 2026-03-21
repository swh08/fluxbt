const DEFAULT_TIMEZONE = 'Australia/Sydney';

const COMMON_TIMEZONES = [
  'Australia/Sydney',
  'UTC',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Moscow',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Pacific/Auckland',
] as const;

const intlWithSupportedValues = Intl as typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

export const TIMEZONE_OPTIONS = COMMON_TIMEZONES.map((value) => ({
  value,
  label: value.replace(/_/g, ' '),
}));

export function isValidTimeZone(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return false;
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: normalized }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized && isValidTimeZone(normalized) ? normalized : DEFAULT_TIMEZONE;
}

export function getDateKeyInTimeZone(timeZone: string, date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: normalizeTimeZone(timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

export function getSupportedTimeZones() {
  const supportedValues = intlWithSupportedValues.supportedValuesOf?.('timeZone') ?? [];
  const timeZones = supportedValues.length > 0 ? supportedValues : [...COMMON_TIMEZONES];

  return Array.from(new Set(timeZones)).filter(isValidTimeZone);
}

export { DEFAULT_TIMEZONE };
