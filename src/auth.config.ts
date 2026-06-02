import type { NextAuthConfig } from 'next-auth';
import prisma from '@/lib/prisma';
import { canAccessEcommerceAdmin } from '@/lib/permissions';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account',
  },

  callbacks: {
    // ── SignIn: vincular Customer al User OAuth ───────────────────────────────
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
            select: { id: true, customerId: true },
          });

          if (dbUser && !dbUser.customerId) {
            let customer = await prisma.customer.findFirst({
              where: { email: user.email.toLowerCase() },
            });

            if (!customer) {
              const business = await prisma.business.findFirst({ select: { id: true } });
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

            if (customer) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { customerId: customer.id },
              });
            }
          }
        } catch (error) {
          console.error('Error vinculando Customer en signIn:', error);
        }
      }
      return true;
    },

    // ── JWT: persiste datos del usuario incluyendo permisos ──────────────────
    async jwt({ token, user }) {
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
          permissions: (user as any).permissions ?? null,
        };
      }
      return token;
    },

    // ── Session: expone datos del JWT ─────────────────────────────────────────
    async session({ session, token }) {
      if (token.data) {
        session.user = token.data as any;
      }
      return session;
    },

    // ── Authorized: middleware de rutas ───────────────────────────────────────
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const user = auth?.user as any;

      // ── Rutas admin ──
      if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false;

        // Verificación rápida con datos del JWT (sin DB)
        if (canAccessEcommerceAdmin(user)) return true;

        // Usuario logueado pero sin permiso → redirigir a página de acceso denegado
        return Response.redirect(new URL('/admin-denied', nextUrl));
      }

      // ── Rutas protegidas del cliente ──
      const isProtected =
        nextUrl.pathname.startsWith('/profile') ||
        nextUrl.pathname.startsWith('/orders') ||
        nextUrl.pathname.startsWith('/favorites');

      if (isProtected && !isLoggedIn) return false;

      return true;
    },
  },

  providers: [],
};
