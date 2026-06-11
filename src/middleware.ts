import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED_ROUTES = ['/compte']
const AUTH_ROUTES = ['/connexion', '/inscription']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('me_session')?.value

  const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  const session = token ? await verifyToken(token) : null

  // /compte : redirige vers /connexion si pas connecté
  if (isProtected && !session) {
    return NextResponse.redirect(new URL(`/connexion?redirect=${pathname}`, request.url))
  }

  // /admin : si connecté mais pas admin → redirige vers /
  // Si pas connecté → laisse passer (le formulaire inline gère le login)
  if (pathname.startsWith('/admin') && session && session.role !== 'ADMIN') {
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
