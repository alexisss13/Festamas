// Calcado de saas-platform/src/lib/rate-limit.ts (mismo patrón, mismo caveat).
//
// En memoria, por proceso — suficiente mientras esta app corre en una sola
// instancia. Deja de funcionar correctamente en cuanto haya más de una réplica
// sirviendo tráfico (cada una tendría su propio contador independiente,
// permitiendo hasta N intentos POR RÉPLICA en vez de N en total) — en ese
// momento hay que reemplazar este Map por un store compartido (Redis con TTL,
// por ejemplo). No se implementó eso aquí porque no hay una instancia de
// Redis disponible en este entorno y añadir esa dependencia sin poder
// probarla sería especulativo.
type Attempt = { count: number; resetAt: number };

const buckets = new Map<string, Attempt>();

export function checkRateLimit(key: string, options: { max: number; windowMs: number }, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.max - 1 };
  }
  if (current.count >= options.max) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { allowed: true, remaining: options.max - current.count };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
