import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account',
  },
  
  callbacks: {
    // 1. El JWT se genera primero
    async jwt({ token, user, trigger }) {
      if (user) {
        token.data = {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          image: user.image,
          businessId: user.businessId,
          branchId: user.branchId,
        };
      }
      
      // Si se actualiza la sesión, refrescar datos del usuario
      if (trigger === 'update') {
        // Aquí podrías refrescar los datos del usuario si es necesario
      }
      
      return token;
    },

    // 2. La Sesión lee del JWT
    async session({ session, token }) {
      if (token.data) {
        session.user = token.data as any;
      }
      return session;
    },

    // 3. Middleware de protección
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      
      // Proteger rutas de admin
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        
        const adminRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER', 'SELLER'];
        if (!adminRoles.includes(userRole as string)) {
          return false;
        }
        
        return true;
      }

      // Proteger rutas de perfil y pedidos
      const isProtectedRoute = nextUrl.pathname.startsWith('/profile') || 
                               nextUrl.pathname.startsWith('/orders') ||
                               nextUrl.pathname.startsWith('/favorites');
      
      if (isProtectedRoute && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  
  providers: [], // Los providers se configuran en auth.ts
};