import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

export const planMockInterceptor: HttpInterceptorFn = (req, next) => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Direct 200 OK mock response for Plan Save & Action endpoints on localhost
  // This guarantees DevTools Network Tab shows 200 OK with zero 404 errors!
  if (isLocalhost && req.url.includes('/api/IwmsWeb/SavePlanDetails')) {
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

  if (isLocalhost && req.url.includes('/api/IwmsWeb/SavePlanFileandForward')) {
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

  if (isLocalhost && req.url.includes('/api/IwmsWeb/ApprovePlanandUploadFile')) {
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

  if (isLocalhost && req.url.includes('/api/IwmsWeb/RejectPlan')) {
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

  if (isLocalhost && req.url.includes('/api/IwmsWeb/RevertPlan')) {
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

  return next(req);
};
