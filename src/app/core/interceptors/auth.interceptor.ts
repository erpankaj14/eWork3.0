import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  // Do not attach a previous user's access_token when the active saved session
  // carries a newer token (for example after re-authentication in another tab).
  const savedSession = localStorage.getItem('ework_user_session') ?? sessionStorage.getItem('ework_user_session');
  let sessionToken: string | undefined;
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);
      const value = parsed?.token || parsed?.access_token;
      if (typeof value === 'string') sessionToken = value;
    } catch {
      // Fall back to the dedicated access_token storage key below.
    }
  }

  const normalizedSessionToken = (sessionToken || '').trim().replace(/^Bearer\s+/i, '');
  // The old demo session stored a non-JWT placeholder. Ignore it and fall back
  // to the actual token key instead of sending it to protected APIs.
  let token = normalizedSessionToken.split('.').length === 3
    ? normalizedSessionToken
    : (localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '').trim().replace(/^Bearer\s+/i, '');

  if (!token || /^(undefined|null|\[object Object\])$/i.test(token) || /\/SsoLogin(?:\?|$)/i.test(request.url)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};

