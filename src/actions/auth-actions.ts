'use server';

import { signIn, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import { AuthError } from 'next-auth';
import bcryptjs from 'bcryptjs';

// --- LOGIN CON GOOGLE ---
export async function loginWithGoogle() {
  try {
    await signIn('google', { redirectTo: '/' });
  } catch (error) {
    throw error;
  }
}

// --- LOGIN CREDENCIALES ---
export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validar que el usuario existe y está activo
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      select: { 
        id: true,
        role: true,
        isActive: true,
        password: true,
      }
    });

    if (!user) {
      return 'Credenciales inválidas.';
    }

    if (!user.isActive) {
      return 'Tu cuenta está desactivada. Contacta al administrador.';
    }

    // Intentar login
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    // Redirección según rol
    const adminRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER', 'SELLER'];
    if (adminRoles.includes(user.role)) {
      return 'Redirect:Admin';
    }

    return 'Redirect:Home';

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas. Verifica tu correo y contraseña.';
        case 'CallbackRouteError':
          return 'Error al iniciar sesión. Intenta nuevamente.';
        default:
          return 'Algo salió mal. Intenta nuevamente.';
      }
    }
    throw error;
  }
}

// --- REGISTRO DE USUARIO ---
export async function registerUser(name: string, email: string, password: string) {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { ok: false, message: 'El correo ya está registrado' };
    }

    // Validar datos
    if (!name || name.trim().length < 2) {
      return { ok: false, message: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (!email || !email.includes('@')) {
      return { ok: false, message: 'El correo no es válido' };
    }

    if (!password || password.length < 6) {
      return { ok: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Hash de la contraseña
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Crear usuario
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'USER',
        isActive: true,
      },
    });

    return { ok: true, message: 'Usuario creado correctamente' };

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return { ok: false, message: 'Error al crear el usuario. Intenta nuevamente.' };
  }
}

// --- LOGOUT ---
export async function logout() {
  try {
    await signOut({ 
      redirect: true,
      redirectTo: '/' 
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
}