import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { portalFromPath } from '@/lib/auth/rbac'
import { supabaseAnonKey, supabaseUrl } from '@/lib/env'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const portal = portalFromPath(pathname)
  const isLoginPage = pathname === '/login'
  if (portal && !user && !isLoginPage) {
    // One universal login page for every account type.
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  // Run on pages/routes only. Skip Next internals, the ported /assets + /images
  // folders and any static file, so we don't fire an auth refresh per asset.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
