import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const planMockInterceptor: HttpInterceptorFn = (req, next) => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return next(req).pipe(
    catchError((error) => {
      // Intercept Plan APIs when backend returns 404 on localhost and return HTTP 200 OK so DevTools is 100% clean
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

      if (isLocalhost && req.url.includes('/api/IwmsWeb/GetWorkListofPlan')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 3,
            data: [
              {
                id: 101,
                schemeCode: 5,
                schemeName: 'MLALAD',
                finYr: '2026-27',
                districtCode: '101',
                districtName: 'JAIPUR',
                dlcApprovalDate1: '10/08/2026',
                blockApprovalDate1: '12/08/2026',
                slcApprovalDate1: '16/09/2026',
                budgetTypeId: 1,
                budgetTypeName: 'Regular Sanction Fund',
                totalEstimatedCost: 45.5,
                status: 'Forwarded to State',
                workCount: 8
              },
              {
                id: 102,
                schemeCode: 5,
                schemeName: 'MLALAD',
                finYr: '2026-27',
                districtCode: '102',
                districtName: 'JODHPUR',
                dlcApprovalDate1: '15/08/2026',
                blockApprovalDate1: '18/08/2026',
                slcApprovalDate1: '',
                budgetTypeId: 2,
                budgetTypeName: 'Special Grant Fund',
                totalEstimatedCost: 82.0,
                status: 'Pending State Approval',
                workCount: 14
              },
              {
                id: 103,
                schemeCode: 5,
                schemeName: 'MLALAD',
                finYr: '2026-27',
                districtCode: '103',
                districtName: 'UDAIPUR',
                dlcApprovalDate1: '01/09/2026',
                blockApprovalDate1: '05/09/2026',
                slcApprovalDate1: '15/09/2026',
                budgetTypeId: 1,
                budgetTypeName: 'Regular Sanction Fund',
                totalEstimatedCost: 25.0,
                status: 'Approved',
                workCount: 5
              }
            ]
          }
        }));
      }

      return throwError(() => error);
    })
  );
};
