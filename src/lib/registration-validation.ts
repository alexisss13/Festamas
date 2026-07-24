// Validación pura extraída de registerUser (src/actions/auth-actions.ts) para
// poder probarla sin tocar Prisma/bcrypt.

export function validateRegistration(name: string, email: string, password: string): string | null {
  if (!name || name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (!email || !email.includes('@')) return 'El correo no es válido';
  if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}
