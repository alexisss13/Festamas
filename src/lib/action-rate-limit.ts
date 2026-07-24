import { headers } from 'next/headers';
import { checkRateLimit, resetRateLimit } from './rate-limit';

// Mismos límites que saas-platform usa para su propio login (5 intentos /
// 15 min). Registro y checkout son límites nuevos, pensados para frenar abuso
// obvio (creación masiva de cuentas, prueba de tarjetas robadas) sin afectar
// a un comprador real que se equivoca un par de veces.
const LOGIN_LIMIT = { max: 5, windowMs: 15 * 60_000 };
const REGISTER_LIMIT = { max: 5, windowMs: 60 * 60_000 };
const CHECKOUT_LIMIT = { max: 10, windowMs: 15 * 60_000 };

export async function clientIp() {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

export async function checkLoginRateLimit(email: string) {
  const ip = await clientIp();
  return checkRateLimit(`login:${ip}:${email.toLowerCase()}`, LOGIN_LIMIT);
}

export async function resetLoginRateLimit(email: string) {
  resetRateLimit(`login:${await clientIp()}:${email.toLowerCase()}`);
}

export async function checkRegisterRateLimit() {
  return checkRateLimit(`register:${await clientIp()}`, REGISTER_LIMIT);
}

export async function checkCheckoutRateLimit() {
  return checkRateLimit(`checkout:${await clientIp()}`, CHECKOUT_LIMIT);
}
