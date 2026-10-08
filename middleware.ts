import { NextRequest, NextResponse } from 'next/server';

import {
  cleanClientPath,
  cleanStaffPath,
  clientOrigin,
  publicOrigin,
  staffOrigin,
  surfaceFromHost,
} from '@/lib/site/origins';

function withSearch(origin: string, pathname: string, request: NextRequest) {
  const target = new URL(pathname, origin);
  target.search = request.nextUrl.search;
  return target;
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname === '/favicon.ico' ||
    /\.[a-z0-9]{2,8}$/i.test(pathname)
  );
}

function clientInternalPath(pathname: string) {
  if (pathname === '/') return '/client';
  if (pathname === '/login') return '/client/login';
  if (pathname === '/recover') return '/client/recover';
  if (pathname === '/confirm') return '/client/confirm';
  if (pathname === '/password') return '/client/password';
  if (pathname === '/mfa') return '/client/mfa';
  if (pathname === '/security') return '/client/security';
  if (pathname === '/projects' || pathname.startsWith('/projects/')) {
    return `/client${pathname}`;
  }
  return null;
}

function staffInternalPath(pathname: string) {
  if (pathname === '/') return '/admin';
  if (pathname === '/login') return '/admin/login';
  if (pathname === '/leads' || pathname.startsWith('/leads/')) {
    return `/admin${pathname}`;
  }
  if (pathname === '/projects' || pathname.startsWith('/projects/')) {
    return `/admin${pathname}`;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const surface = surfaceFromHost(host);

  if (surface === 'unknown' || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (surface === 'public') {
    if (
      pathname === '/api/account/session' ||
      pathname.startsWith('/api/client/') ||
      pathname.startsWith('/api/admin/')
    ) {
      const target = request.nextUrl.clone();
      target.pathname = '/api/not-found';
      return NextResponse.rewrite(target);
    }

    if (pathname === '/login') {
      return NextResponse.redirect(withSearch(clientOrigin(), '/login', request));
    }

    if (pathname === '/client' || pathname.startsWith('/client/')) {
      return NextResponse.redirect(
        withSearch(clientOrigin(), cleanClientPath(pathname), request)
      );
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return NextResponse.redirect(
        withSearch(staffOrigin(), cleanStaffPath(pathname), request)
      );
    }

    return NextResponse.next();
  }

  if (surface === 'client') {
    if (pathname === '/api/account/session' || pathname.startsWith('/api/client/') || pathname === '/auth/callback') {
      return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
      const target = request.nextUrl.clone();
      target.pathname = '/api/not-found';
      return NextResponse.rewrite(target);
    }

    if (pathname === '/client' || pathname.startsWith('/client/')) {
      return NextResponse.redirect(
        withSearch(clientOrigin(), cleanClientPath(pathname), request)
      );
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return NextResponse.redirect(
        withSearch(staffOrigin(), cleanStaffPath(pathname), request)
      );
    }

    const internal = clientInternalPath(pathname);
    if (internal) {
      const target = request.nextUrl.clone();
      target.pathname = internal;
      return NextResponse.rewrite(target);
    }

    return NextResponse.redirect(withSearch(publicOrigin(), pathname, request));
  }

  if (pathname === '/api/account/session' || pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    const target = request.nextUrl.clone();
      target.pathname = '/api/not-found';
      return NextResponse.rewrite(target);
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.redirect(
      withSearch(staffOrigin(), cleanStaffPath(pathname), request)
    );
  }

  if (pathname === '/client' || pathname.startsWith('/client/')) {
    return NextResponse.redirect(
      withSearch(clientOrigin(), cleanClientPath(pathname), request)
    );
  }

  const internal = staffInternalPath(pathname);
  if (internal) {
    const target = request.nextUrl.clone();
    target.pathname = internal;
    return NextResponse.rewrite(target);
  }

  return NextResponse.redirect(withSearch(publicOrigin(), pathname, request));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
