import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

describe('rate limit', () => {
  it('permite hasta el máximo de intentos dentro de la ventana', () => {
    const key = `test:${Math.random()}`;
    const opts = { max: 3, windowMs: 60_000 };
    const now = 1_000_000;
    expect(checkRateLimit(key, opts, now).allowed).toBe(true);
    expect(checkRateLimit(key, opts, now + 1).allowed).toBe(true);
    expect(checkRateLimit(key, opts, now + 2).allowed).toBe(true);
  });

  it('bloquea a partir del intento número max+1', () => {
    const key = `test:${Math.random()}`;
    const opts = { max: 2, windowMs: 60_000 };
    const now = 1_000_000;
    checkRateLimit(key, opts, now);
    checkRateLimit(key, opts, now + 1);
    const blocked = checkRateLimit(key, opts, now + 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('reinicia el contador una vez que pasa la ventana', () => {
    const key = `test:${Math.random()}`;
    const opts = { max: 1, windowMs: 1000 };
    const now = 1_000_000;
    expect(checkRateLimit(key, opts, now).allowed).toBe(true);
    expect(checkRateLimit(key, opts, now + 500).allowed).toBe(false);
    expect(checkRateLimit(key, opts, now + 1001).allowed).toBe(true);
  });

  it('resetRateLimit limpia el contador antes de que expire la ventana', () => {
    const key = `test:${Math.random()}`;
    const opts = { max: 1, windowMs: 60_000 };
    const now = 1_000_000;
    checkRateLimit(key, opts, now);
    expect(checkRateLimit(key, opts, now + 1).allowed).toBe(false);
    resetRateLimit(key);
    expect(checkRateLimit(key, opts, now + 2).allowed).toBe(true);
  });

  it('cuentas independientes no se pisan entre sí', () => {
    const opts = { max: 1, windowMs: 60_000 };
    const now = 1_000_000;
    const a = `test:a:${Math.random()}`;
    const b = `test:b:${Math.random()}`;
    expect(checkRateLimit(a, opts, now).allowed).toBe(true);
    expect(checkRateLimit(b, opts, now).allowed).toBe(true);
  });
});
