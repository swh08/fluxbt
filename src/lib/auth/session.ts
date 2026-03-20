import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export function getAppSession() {
  return getServerSession(authOptions);
}
