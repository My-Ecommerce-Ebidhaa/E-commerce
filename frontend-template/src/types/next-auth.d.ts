import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
    tenantId?: string;
    tenantSlug?: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
      tenantId?: string;
      tenantSlug?: string;
    };
    accessToken: string;
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
    tenantId?: string;
    tenantSlug?: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: 'RefreshAccessTokenError';
  }
}
