// Copia vendorizada de @zaiko/contracts (paquete compartido en
// ../packages/contracts fuera de este repo) — solo lo que ecommerce
// realmente usa: contexto de tenant, firma/verificación HMAC de llamadas
// internas service-to-service, y el envelope success/failure de la API
// interna.
//
// Por qué está copiado en vez de importado: @zaiko/contracts se resuelve hoy
// vía "file:../packages/contracts", una ruta relativa fuera de este
// repositorio que solo existe en el monorepo local del desarrollador. Vercel
// clona únicamente el repo de ecommerce, así que esa carpeta no existe ahí —
// el build de producción habría fallado con "Module not found: Can't
// resolve '@zaiko/contracts'" en cualquier página (ecommerce-context.ts se
// importa desde casi todo el sitio) más las rutas internas. Mismo fix
// aplicado en pos (ver pos/docs/sesiones/2026-07-20-fix-vercel-build-zaiko-contracts.md).
//
// IMPORTANTE: si el paquete original (packages/contracts en el monorepo)
// cambia su lógica de firma/verificación, este archivo debe actualizarse a
// mano en los tres repos (POS, ecommerce, saas-platform) — cada uno tiene
// ahora su propia copia vendorizada por el mismo motivo. Mantener el
// contenido de las funciones de firma IDÉNTICO entre las tres copias es
// obligatorio: son las que verifican las llamadas firmadas entre servicios.

export const CONTRACT_VERSION = '2026-07-18.v1';

export type TenantContext = {
  contractVersion: typeof CONTRACT_VERSION;
  businessId: string;
  branchId?: string;
  userId?: string;
  role?: string;
  source: 'POS' | 'ECOMMERCE' | 'SAAS_PLATFORM';
  requestId: string;
};

export function createTenantContext(input: Omit<TenantContext, 'contractVersion'>): TenantContext {
  return { ...input, contractVersion: CONTRACT_VERSION };
}

export function isTenantContext(value: unknown): value is TenantContext {
  if (!value || typeof value !== 'object') return false;
  const context = value as Record<string, unknown>;
  return context.contractVersion === CONTRACT_VERSION
    && typeof context.businessId === 'string'
    && typeof context.requestId === 'string'
    && ['POS', 'ECOMMERCE', 'SAAS_PLATFORM'].includes(String(context.source));
}

export type ApiMeta = {
  contractVersion: typeof CONTRACT_VERSION;
  requestId: string;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: ApiMeta;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'TENANT_MISMATCH'
  | 'BRANCH_MISMATCH'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'IDEMPOTENCY_REPLAY'
  | 'FEATURE_DISABLED'
  | 'LIMIT_REACHED'
  | 'PAYMENT_FAILED'
  | 'INTERNAL_ERROR';

export function createApiMeta(context: Pick<TenantContext, 'requestId'>): ApiMeta {
  return { contractVersion: CONTRACT_VERSION, requestId: context.requestId };
}

export function success<T>(data: T, context: Pick<TenantContext, 'requestId'>, pagination?: Omit<ApiMeta, 'contractVersion' | 'requestId'>): ApiSuccess<T> {
  return { success: true, data, meta: { ...createApiMeta(context), ...pagination } };
}

export function failure(code: ApiErrorCode, message: string, context: Pick<TenantContext, 'requestId'>, details?: Record<string, unknown>): ApiFailure {
  return { success: false, error: { code, message, details }, meta: createApiMeta(context) };
}

export type InternalRequestHeaders = {
  'x-zaiko-contract': typeof CONTRACT_VERSION;
  'x-zaiko-business': string;
  'x-zaiko-branch'?: string;
  'x-zaiko-user'?: string;
  'x-zaiko-role'?: string;
  'x-zaiko-source': TenantContext['source'];
  'x-zaiko-request': string;
  'x-zaiko-timestamp': string;
  'x-zaiko-signature': string;
};

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function canonicalPayload(context: TenantContext, timestamp: number) {
  return [
    CONTRACT_VERSION,
    context.source,
    context.businessId,
    context.branchId ?? '',
    context.userId ?? '',
    context.role ?? '',
    context.requestId,
    String(timestamp),
  ].join('|');
}

async function signPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

export async function createInternalRequestHeaders(context: TenantContext, secret: string, timestamp = Date.now()): Promise<InternalRequestHeaders> {
  if (!secret) throw new Error('Internal contract secret is required');
  const headers: InternalRequestHeaders = {
    'x-zaiko-contract': CONTRACT_VERSION,
    'x-zaiko-business': context.businessId,
    'x-zaiko-source': context.source,
    'x-zaiko-request': context.requestId,
    'x-zaiko-timestamp': String(timestamp),
    'x-zaiko-signature': await signPayload(canonicalPayload(context, timestamp), secret),
  };
  if (context.branchId) headers['x-zaiko-branch'] = context.branchId;
  if (context.userId) headers['x-zaiko-user'] = context.userId;
  if (context.role) headers['x-zaiko-role'] = context.role;
  return headers;
}

export async function verifyInternalRequestHeaders(headers: Headers, secret: string, maxAgeMs = 300_000) {
  const contract = headers.get('x-zaiko-contract');
  const businessId = headers.get('x-zaiko-business');
  const source = headers.get('x-zaiko-source') as TenantContext['source'] | null;
  const requestId = headers.get('x-zaiko-request');
  const timestampValue = headers.get('x-zaiko-timestamp');
  const signature = headers.get('x-zaiko-signature');
  const timestamp = Number(timestampValue);
  if (!secret || contract !== CONTRACT_VERSION || !businessId || !requestId || !source || !timestampValue || !signature || !Number.isFinite(timestamp)) return null;
  if (!['POS', 'ECOMMERCE', 'SAAS_PLATFORM'].includes(source) || Math.abs(Date.now() - timestamp) > maxAgeMs) return null;
  const context: TenantContext = {
    contractVersion: CONTRACT_VERSION,
    businessId,
    branchId: headers.get('x-zaiko-branch') ?? undefined,
    userId: headers.get('x-zaiko-user') ?? undefined,
    role: headers.get('x-zaiko-role') ?? undefined,
    source,
    requestId,
  };
  const expected = await signPayload(canonicalPayload(context, timestamp), secret);
  return expected === signature ? context : null;
}

export type BusinessVertical = 'COMMERCE' | 'RESTAURANT' | 'SERVICES' | 'PROFESSIONALS';

export type WorkspaceProvisionInput = {
  workspaceName: string;
  ruc?: string;
  address?: string;
  vertical: BusinessVertical;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  idempotencyKey?: string;
  planId?: string;
  deploymentMode?: 'SHARED' | 'DEDICATED';
};

export function isWorkspaceProvisionInput(value: unknown): value is WorkspaceProvisionInput {
  if (!value || typeof value !== 'object') return false;
  const input = value as Record<string, unknown>;
  return typeof input.workspaceName === 'string' && input.workspaceName.trim().length >= 2
    && typeof input.ownerName === 'string' && input.ownerName.trim().length >= 2
    && typeof input.ownerEmail === 'string' && input.ownerEmail.includes('@')
    && typeof input.ownerPassword === 'string' && input.ownerPassword.length >= 8
    && (input.idempotencyKey === undefined || (typeof input.idempotencyKey === 'string' && input.idempotencyKey.trim().length >= 8))
    && ['COMMERCE', 'RESTAURANT', 'SERVICES', 'PROFESSIONALS'].includes(String(input.vertical))
    && (input.planId === undefined || typeof input.planId === 'string')
    && (input.deploymentMode === undefined || ['SHARED', 'DEDICATED'].includes(String(input.deploymentMode)));
}
