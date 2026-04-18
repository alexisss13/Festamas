// src/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  
  debug: process.env.NODE_ENV === 'development',

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ 
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              name: true,
              email: true,
              emailVerified: true,
              password: true,
              role: true,
              image: true,
              businessId: true,
              branchId: true,
              isActive: true,
            }
          });

          if (!user || !user.password) return null;
          if (!user.isActive) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) return null;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = user;
          return userWithoutPassword as any;
        }
        return null;
      },
    }),
  ],
});