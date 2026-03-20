export interface SessionUserIdentity {
  username?: string | null;
  name?: string | null;
}

export function getSessionUserDisplayName(user: SessionUserIdentity): string {
  const username = user.username?.trim();

  if (username) {
    return username;
  }

  const name = user.name?.trim();

  if (name) {
    return name;
  }

  return 'User';
}

export function getSessionUserInitial(user: SessionUserIdentity): string {
  return getSessionUserDisplayName(user).charAt(0).toUpperCase();
}
