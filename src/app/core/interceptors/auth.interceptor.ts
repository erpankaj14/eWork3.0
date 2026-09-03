import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  let token = null;
  const savedSession = sessionStorage.getItem('ework_user_session') ?? localStorage.getItem('ework_user_session');
  
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);
      token = parsed.token;
    } catch (e) {
      console.error('Failed to parse user session in interceptor');
    }
  }

  if (!token) return next(request);

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
