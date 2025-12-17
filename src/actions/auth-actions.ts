'use server';

import { signIn, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import { AuthError } from 'next-auth';
import bcryptjs from 'bcryptjs';

// --- NUEVO: LOGIN CON GOOGLE ---
export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/' });
}

// --- LOGIN CREDENCIALES (INTELIGENTE) ---
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    // 1. Intentamos loguear
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false,
    });

    // 2. Si pasa (no da error), verificamos el Rol para redirección
    const email = formData.get('email') as string;
    const user = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase() },
        select: { role: true } // Solo traemos el rol por eficiencia
    });

    if (user?.role === 'ADMIN' || user?.role === 'SELLER') {
        return 'Redirect:Admin';
    }

    return 'Redirect:Home';

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas. Verifica tu contraseña.';
        default:
          return 'Algo salió mal.';
      }
    }
    throw error;
  }
}

// --- REGISTRO DE USUARIO ---
export async function registerUser(name: string, email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      return { ok: false, message: 'El correo ya está registrado' };
    }

    const hashedPassword = bcryptjs.hashSync(password);

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'USER', // Por defecto todos son usuarios
      },
    });

    return { ok: true, message: 'Usuario creado correctamente' };

  } catch (error) {
    console.log(error);
    return { ok: false, message: 'Error al crear el usuario' };
  }
}

// --- LOGOUT ---
export async function logout() {
  await signOut({ redirectTo: '/' });
}