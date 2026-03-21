import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/auth/session';
import { getAppState } from '@/lib/app-state';

export async function GET(request: NextRequest) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const selectedServerId = request.nextUrl.searchParams.get('serverId');

  try {
    const state = await getAppState(session.user.id, selectedServerId);
    return NextResponse.json(state);
  } catch (error) {
    console.error('Failed to load app state.', error);
    return NextResponse.json({ message: 'APP_STATE_LOAD_FAILED' }, { status: 500 });
  }
}
