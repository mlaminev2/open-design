import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED_ROUTES = ['/compte', '/admin']
const AUTH_ROUTES = ['/connexion', '/inscription']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('me_session')?.value

  const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  const session = token ? await verifyToken(token) : null

  if (isProtected && !session) {
    return NextResponse.redirect(new URL(`/connexion?redirect=${pathname}`, request.url))
  }

  if (pathname.startsWith('/admin') && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/compte', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/compte/:path*', '/admin/:path*', '/connexion', '/inscription'],
}
