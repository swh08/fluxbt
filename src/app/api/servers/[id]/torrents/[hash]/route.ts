import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/auth/session';
import { getTorrentDetails } from '@/lib/app-state';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string; hash: string }> },
) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id, hash } = await context.params;
  const torrent = await getTorrentDetails(session.user.id, id, hash);

  if (!torrent) {
    return NextResponse.json({ message: 'TORRENT_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json(torrent);
}
