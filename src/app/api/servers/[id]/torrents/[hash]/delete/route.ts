import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/auth/session';
import { deleteTorrent } from '@/lib/app-state';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; hash: string }> },
) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id, hash } = await context.params;
  const payload = await request.json().catch(() => ({}));
  const result = await deleteTorrent(session.user.id, id, hash, Boolean(payload.deleteFiles));

  if (!result) {
    return NextResponse.json({ message: 'TORRENT_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
