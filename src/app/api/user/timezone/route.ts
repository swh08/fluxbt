import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/auth/session';
import { isValidTimeZone } from '@/lib/timezones';
import { updateUserTimezone } from '@/lib/users/store';

export async function PATCH(request: NextRequest) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const timezone = typeof body?.timezone === 'string' ? body.timezone.trim() : '';

  if (!isValidTimeZone(timezone)) {
    return NextResponse.json({ message: 'INVALID_TIMEZONE' }, { status: 400 });
  }

  try {
    const user = await updateUserTimezone(session.user.id, timezone);
    return NextResponse.json({ timezone: user.timezone });
  } catch (error) {
    console.error('Failed to update user timezone.', error);
    return NextResponse.json({ message: 'TIMEZONE_UPDATE_FAILED' }, { status: 500 });
  }
}
