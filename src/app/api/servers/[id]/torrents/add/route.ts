import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/auth/session';
import { addTorrentToServer } from '@/lib/app-state';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const urls = formData.get('urls');
  const torrentFile = formData.get('torrentFile');
  const savePath = formData.get('savePath');
  const category = formData.get('category');
  const tags = formData.getAll('tags').map((tag) => String(tag)).filter(Boolean);
  const startImmediately = formData.get('startImmediately');

  const result = await addTorrentToServer(session.user.id, id, {
    urls: typeof urls === 'string' ? urls : undefined,
    torrentFile: torrentFile instanceof File ? torrentFile : undefined,
    savePath: typeof savePath === 'string' ? savePath : undefined,
    category: typeof category === 'string' ? category : undefined,
    tags,
    startImmediately: startImmediately !== 'false',
  });

  if (!result) {
    return NextResponse.json({ message: 'SERVER_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
