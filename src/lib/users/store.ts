import { db } from '@/lib/db';
import { normalizeTimeZone } from '@/lib/timezones';

export async function getUserTimezone(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });

  return normalizeTimeZone(user?.timezone);
}

export async function updateUserTimezone(userId: string, timezone: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      timezone: normalizeTimeZone(timezone),
    },
    select: { timezone: true },
  });
}
