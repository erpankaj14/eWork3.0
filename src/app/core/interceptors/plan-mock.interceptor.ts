import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const planMockInterceptor: HttpInterceptorFn = (req, next) => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlLower = req.url.toLowerCase();

  // Pass every HTTP request to next(req) so Chrome DevTools Network Tab logs the real XHR API call!
  return next(req).pipe(
    catchError((error) => {
      if (isLocalhost && urlLower.includes('/api/iwmsweb/saveplandetails')) {
        let bodyPayload: any = {};
        try {
          bodyPayload = req.body || {};
        } catch (e) {}

        const assignedId = bodyPayload.id && bodyPayload.id > 0 ? bodyPayload.id : Math.floor(Math.random() * 9000 + 1000);

        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: `Plan details saved successfully! (Plan ID #${assignedId})`,
            data: {
              ...bodyPayload,
              id: assignedId,
              status: 'Draft Saved',
              createdDate: new Date().toLocaleDateString('en-GB')
            }
          }
        }));
      }

      if (isLocalhost && urlLower.includes('/api/iwmsweb/saveplanfileandforward')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: 'District Plan PDF saved and forwarded to State successfully!',
            data: {
              schemeCode: 5,
              finYr: '2026-27',
              districtCode: '101'
            }
          }
        }));
      }

      if (isLocalhost && urlLower.includes('/api/iwmsweb/approveplananduploadfile')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: 'Plan approved at State level successfully!',
            data: {
              schemeCode: 5,
              finYr: '2026-27',
              districtCode: '101'
            }
          }
        }));
      }

      if (isLocalhost && urlLower.includes('/api/iwmsweb/rejectplan')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: 'Plan rejected successfully.',
            data: req.body
          }
        }));
      }

      if (isLocalhost && urlLower.includes('/api/iwmsweb/revertplan')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: 'Plan reverted successfully.',
            data: req.body
          }
        }));
      }

      return throwError(() => error);
    })
  );
};
