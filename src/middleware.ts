import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// JWT token interface
interface JwtPayload {
  sub: string;
  exp: number;
  role?: string;
  userId?: string;
  username?: string;
}

/**
 * Middleware for authentication and authorization
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const isPublicPath = 
    pathname === '/' || 
    pathname === '/auth/login' || 
    pathname === '/auth/forgot-password' || 
    pathname.startsWith('/auth/reset-password');
  
  // Get the token from the cookies - safely handle undefined value
  const authCookie = request.cookies.get('auth_token');
  console.log('Middleware: auth_token çerezi kontrolü:', 
    authCookie ? `${authCookie.value.substring(0, 20)}...` : 'Çerez bulunamadı');
  
  const token = authCookie?.value || '';
  
  // Tüm çerezleri log'a yazdır
  console.log('Middleware: Tüm çerezler:', 
    Array.from(request.cookies.getAll())
      .map(cookie => `${cookie.name}: ${cookie.value ? 'Var' : 'Yok'}`)
      .join(', '));
  
  // If the path is public and user is authenticated, redirect to dashboard
  if (isPublicPath && token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is valid and not expired
      if (decoded.exp > currentTime) {
        console.log('Middleware: Kullanıcı oturum açmış, dashboard\'a yönlendiriliyor');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // If token is invalid, continue to the public page
      console.error('Invalid token in middleware:', error);
    }
  }
  
  // If the path requires authentication and user is not authenticated
  if (!isPublicPath && (!token || isTokenExpired(token))) {
    console.log('Middleware: Yetkilendirme gerektiren yol, token bulunamadı veya süresi dolmuş');
    // Save the original URL to redirect back after login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // Role-based access control for specific paths
  if (token && !isTokenExpired(token)) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const userRole = decoded.role;
      
      // Skip role check if role not found in token
      if (!userRole) return NextResponse.next();
      
      // Admin-only paths
      if (pathname.startsWith('/dashboard/settings') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Manager or Admin paths
      if (
        (pathname.startsWith('/dashboard/companies') || 
         pathname.startsWith('/dashboard/reports')) && 
        !['admin', 'manager'].includes(userRole)
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Role check error in middleware:', error);
      
      // If there's an error checking the role, clear the invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

/**
 * Check if a token is expired
 */
function isTokenExpired(token: string): boolean {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return decoded.exp < currentTime;
  } catch (error) {
    // If token can't be decoded, consider it expired
    console.error('Token validation error:', error);
    return true;
  }
}

export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
};