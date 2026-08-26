import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/docs', '/login', '/register', '/api/login', '/api/register', '/api/ads/serve', '/api/ads/track'];
  const authRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/docs') || pathname.startsWith('/api/ads/'));

  const token = request.cookies.get('auth_token')?.value;

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    const payload = await verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // Only redirect away from login/register if already authenticated
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/admin') && payload.role !== 'admin' && payload.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }
    
    if (pathname.startsWith('/campaigns') && !['admin', 'superadmin', 'advertiser'].includes(payload.role as string)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files like CSS/JS)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};