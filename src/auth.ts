import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google'; // 1. Importar Google
import { PrismaAdapter } from '@auth/prisma-adapter'; // 2. Importar Adaptador
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  // 3. CONECTAR LA BASE DE DATOS (IMPORTANTE: castear a 'any' para evitar error de tipos)
  adapter: PrismaAdapter(prisma) as any, 
  
  session: { strategy: 'jwt' }, // Usamos JWT para que sea rápido
  
  providers: [
    // 4. Configurar Google
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // Configurar Credenciales (Correo y Clave)
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          // Si el usuario no tiene password (es de Google), no puede entrar por aquí
          if (!user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword as any;
          }
        }

        console.log('Credenciales inválidas');
        return null;
      },
    }),
  ],
});