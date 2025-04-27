import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bu dosya sadece uyumluluğu korumak için boş olarak bırakılmıştır
// Yetkilendirme artık AuthGuard bileşeni ile gerçekleştirilmektedir
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Hiçbir yola eşleşmemesi için boş bir dizi kullanıyoruz
export const config = {
  matcher: [],
};