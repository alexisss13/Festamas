import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user as any;
  const isLoggedIn = !!user;

  const isAdminRoute    = nextUrl.pathname.startsWith('/admin');
  const isAdminDenied   = nextUrl.pathname === '/admin-denied';
  const isProtectedRoute =
    nextUrl.pathname.startsWith('/profile') ||
    nextUrl.pathname.startsWith('/orders') ||
    nextUrl.pathname.startsWith('/favorites');
  const isAuthRoute =
    nextUrl.pathname === '/auth/login' ||
    nextUrl.pathname === '/auth/new-account';

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/login', nextUrl));
    }
    // JWT-based fast check (fresh DB check happens in layout.tsx)
    if (!canAccessEcommerceAdmin(user)) {
      return Response.redirect(new URL('/admin-denied', nextUrl));
    }
    return;
  }

  // ── Protected client routes ───────────────────────────────────────────────
  if (isProtectedRoute && !isLoggedIn) {
    const cb = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return Response.redirect(new URL(`/auth/login?callbackUrl=${cb}`, nextUrl));
  }

  // ── Already logged in → skip auth pages ──────────────────────────────────
  if (isLoggedIn && isAuthRoute) {
    if (canAccessEcommerceAdmin(user)) {
      return Response.redirect(new URL('/admin/dashboard', nextUrl));
    }
    return Response.redirect(new URL('/', nextUrl));
  }
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
