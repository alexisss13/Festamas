import { auth } from '@/auth';

export default auth((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  const userRole = auth?.user?.role;

  // Rutas de admin
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  
  // Rutas protegidas para usuarios autenticados
  const isProtectedRoute = 
    nextUrl.pathname.startsWith('/profile') ||
    nextUrl.pathname.startsWith('/orders') ||
    nextUrl.pathname.startsWith('/favorites');

  // Si está en ruta de admin
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/login', nextUrl));
    }

    const adminRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER', 'SELLER'];
    if (!adminRoles.includes(userRole as string)) {
      return Response.redirect(new URL('/', nextUrl));
    }
  }

  // Si está en ruta protegida de usuario
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return Response.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  // Si está logueado y trata de acceder a login/registro, redirigir según rol
  if (isLoggedIn && (nextUrl.pathname === '/auth/login' || nextUrl.pathname === '/auth/new-account')) {
    const adminRoles = ['ADMIN', 'OWNER', 'SUPER_ADMIN', 'MANAGER', 'SELLER'];
    if (adminRoles.includes(userRole as string)) {
      return Response.redirect(new URL('/admin/dashboard', nextUrl));
    }
    return Response.redirect(new URL('/', nextUrl));
  }

  return;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};