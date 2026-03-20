import { describe, expect, it } from 'vitest';
import { isAuthPage, isPublicPath } from '@/lib/auth/routing';

describe('isAuthPage', () => {
  it('returns true for login and register pages', () => {
    expect(isAuthPage('/login')).toBe(true);
    expect(isAuthPage('/register')).toBe(true);
  });

  it('returns false for the app home page', () => {
    expect(isAuthPage('/')).toBe(false);
  });
});

describe('isPublicPath', () => {
  it('returns true for auth routes and static assets', () => {
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/register')).toBe(true);
    expect(isPublicPath('/api/auth/session')).toBe(true);
    expect(isPublicPath('/_next/static/chunk.js')).toBe(true);
    expect(isPublicPath('/logo.svg')).toBe(true);
  });

  it('returns false for protected application routes', () => {
    expect(isPublicPath('/')).toBe(false);
    expect(isPublicPath('/dashboard')).toBe(false);
  });
});
