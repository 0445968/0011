export type BiviSurface = 'public' | 'client' | 'staff' | 'unknown';

const DEFAULT_PUBLIC_ORIGIN = 'https://bivi.pro';
const DEFAULT_CLIENT_ORIGIN = 'https://app.bivi.pro';
const DEFAULT_STAFF_ORIGIN = 'https://staff.bivi.pro';

function normalizedOrigin(value: string | undefined, fallback: string) {
  const raw = value?.trim() || fallback;
  const url = new URL(raw);
  const local =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '[::1]' ||
    url.hostname.endsWith('.localhost');

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/' ||
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && local))
  ) {
    throw new Error('Bivi surface URLs must be canonical HTTPS origins. Local .localhost HTTP origins are allowed for development.');
  }

  return url.origin;
}

export function publicOrigin() {
  return normalizedOrigin(process.env.INQUIRY_APP_URL, DEFAULT_PUBLIC_ORIGIN);
}

export function clientOrigin() {
  return normalizedOrigin(
    process.env.NEXT_PUBLIC_BIVI_APP_URL,
    DEFAULT_CLIENT_ORIGIN
  );
}

export function staffOrigin() {
  return normalizedOrigin(
    process.env.NEXT_PUBLIC_BIVI_STAFF_URL,
    DEFAULT_STAFF_ORIGIN
  );
}

function hostnameFromHost(host: string | null | undefined) {
  if (!host) return '';
  try {
    return new URL(`http://${host.split(',')[0].trim()}`).hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function surfaceFromHost(host: string | null | undefined): BiviSurface {
  const hostname = hostnameFromHost(host);
  if (!hostname) return 'unknown';

  if (hostname === new URL(clientOrigin()).hostname.toLowerCase()) return 'client';
  if (hostname === new URL(staffOrigin()).hostname.toLowerCase()) return 'staff';
  if (hostname === new URL(publicOrigin()).hostname.toLowerCase()) return 'public';

  return 'unknown';
}

export function requestSurface(request: Request): BiviSurface {
  return surfaceFromHost(
    request.headers.get('x-forwarded-host') || request.headers.get('host')
  );
}

export function cleanClientPath(pathname: string) {
  if (pathname === '/client') return '/';
  if (pathname.startsWith('/client/')) return pathname.slice('/client'.length) || '/';
  return pathname;
}

export function cleanStaffPath(pathname: string) {
  if (pathname === '/admin') return '/';
  if (pathname.startsWith('/admin/')) return pathname.slice('/admin'.length) || '/';
  return pathname;
}

export function browserAccountOrigins() {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname.toLowerCase();
  const isProductionPublic = hostname === 'bivi.pro' || hostname === 'www.bivi.pro';
  const isLocalPublic = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

  if (!isProductionPublic && !isLocalPublic) return null;

  try {
    return {
      client: clientOrigin(),
      staff: staffOrigin(),
    };
  } catch {
    return null;
  }
}
