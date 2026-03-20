import type { DefaultSession } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    username: string;
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      username: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    username?: string;
  }
}
