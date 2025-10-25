import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is an admin route (but not login, debug, or API routes)
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin/login' && 
      !pathname.startsWith('/admin/api') &&
      !pathname.startsWith('/api/admin')) {
    
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('🔐 Middleware: Admin route accessed:', pathname);
    console.log('🔐 Middleware: Token present:', !!token);
    console.log('🔐 Middleware: All cookies:', request.cookies.getAll().map(c => c.name));

    if (!token) {
      console.log('🔐 Middleware: No token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify the token using jose (Edge Runtime compatible)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      console.log('🔐 Middleware: Token verified successfully:', { userId: payload.userId, role: payload.role });
      
      // Check if token is expired or invalid
      if (!payload || payload.role !== 'admin') {
        console.log('🔐 Middleware: Invalid role, redirecting to login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      console.log('🔐 Middleware: Access granted to:', pathname);
      // Token is valid, continue to the requested page
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      console.log('🔐 Middleware: Token verification failed:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // For non-admin routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ],
};
