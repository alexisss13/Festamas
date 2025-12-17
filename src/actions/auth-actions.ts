'use server';

import { signIn, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import { AuthError } from 'next-auth';
import bcryptjs from 'bcryptjs';

// --- NUEVO: LOGIN CON GOOGLE ---
export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/' });
}

// --- LOGIN CREDENCIALES (Existente) ---
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false,
    });

    return 'Success';

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas.';
        default:
          return 'Algo salió mal.';
      }
    }
    throw error;
  }
}

// --- REGISTRO DE USUARIO (Existente) ---
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
        role: 'USER',
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
  await signOut();
}