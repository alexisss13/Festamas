import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account',
  },
  
  callbacks: {
    // 1. El JWT se genera primero
    async jwt({ token, user }) {
      if (user) {
        token.data = user; // Guardamos todo el objeto usuario
      }
      return token;
    },

    // 2. La Sesión lee del JWT
    async session({ session, token }) {
      // @ts-ignore
      session.user = token.data as any;
      return session;
    },

    // 3. Middleware de protección (Básico por ahora)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Proteger rutas de admin
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      if (isAdminRoute) {
        if (isLoggedIn && auth.user.role === 'ADMIN') return true;
        return false; // Redirigir a login o 403
      }

      return true;
    },
  },
  
  providers: [], // Los providers se configuran en auth.ts
};