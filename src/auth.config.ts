import type { NextAuthConfig } from 'next-auth';
import prisma from '@/lib/prisma';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account',
  },
  
  callbacks: {
    // 0. SignIn callback - Se ejecuta cuando un usuario inicia sesión
    async signIn({ user, account }) {
      // Solo procesar para OAuth (Google, etc.)
      if (account?.provider === 'google' && user.email) {
        try {
          // Buscar el usuario en la base de datos
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
            select: { id: true, customerId: true }
          });

          // Si el usuario existe pero no tiene Customer vinculado
          if (dbUser && !dbUser.customerId) {
            // Buscar si existe un Customer con este email (creado desde el POS)
            let customer = await prisma.customer.findFirst({
              where: { email: user.email.toLowerCase() },
            });

            // Si no existe Customer, crear uno nuevo
            if (!customer) {
              const business = await prisma.business.findFirst({
                select: { id: true }
              });

              if (business) {
                customer = await prisma.customer.create({
                  data: {
                    businessId: business.id,
                    name: user.name || 'Usuario',
                    email: user.email.toLowerCase(),
                    pointsBalance: 0,
                    totalSpent: 0,
                    visits: 0,
                  },
                });
              }
            }

            // Vincular el Customer al User
            if (customer) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { customerId: customer.id }
              });
            }
          }
        } catch (error) {
          console.error('Error vinculando Customer en signIn:', error);
          // No bloqueamos el login si falla la vinculación
        }
      }
      
      return true;
    },

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