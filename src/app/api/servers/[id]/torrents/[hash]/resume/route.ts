import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/auth/session';
import { resumeTorrent } from '@/lib/app-state';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string; hash: string }> },
) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id, hash } = await context.params;
  const result = await resumeTorrent(session.user.id, id, hash);

  if (!result) {
    return NextResponse.json({ message: 'TORRENT_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
