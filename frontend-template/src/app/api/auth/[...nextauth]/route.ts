import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || 'Failed to refresh token');
    }

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + (data.data.expiresIn || 3600) * 1000,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError' as const,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantSlug: { label: 'Tenant', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          if (credentials.tenantSlug) {
            headers['X-Tenant-Slug'] = credentials.tenantSlug;
          }

          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.status) {
            throw new Error(data.message || 'Invalid credentials');
          }

          const { user, tokens } = data.data;

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            role: user.role,
            tenantId: user.tenantId || user.tenant_id,
            tenantSlug: credentials.tenantSlug || undefined,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpires: Date.now() + (tokens.expiresIn || 3600) * 1000,
          };
        } catch (error: any) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenantSlug,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Return previous token if access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        role: token.role as 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN',
        tenantId: token.tenantId as string | undefined,
        tenantSlug: token.tenantSlug as string | undefined,
      };
      session.accessToken = token.accessToken as string;

      if (token.error) {
        session.error = token.error as 'RefreshAccessTokenError';
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
