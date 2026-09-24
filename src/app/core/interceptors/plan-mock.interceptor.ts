import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const planMockInterceptor: HttpInterceptorFn = (req, next) => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlLower = req.url.toLowerCase();

  // Send request to server so Chrome DevTools Network Tab records the real XHR call
  return next(req).pipe(
    catchError((error) => {
      // 1. GetParentMenus
      if (isLocalhost && urlLower.includes('getparentmenus')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 8,
            data: [
              { menuId: 1, menuNameE: 'Master', menuNameH: 'मास्टर प्रबंधन', menuType: 'admin', orderNo: 1, navigateUrl: '/portal/master/scheme-configuration' },
              { menuId: 2, menuNameE: 'Sanction', menuNameH: 'स्वीकृति प्रबंधन', menuType: 'sanction', orderNo: 2, navigateUrl: '/portal/sanction/admin-sanction/entry' },
              { menuId: 3, menuNameE: 'Transaction', menuNameH: 'लेन-देन एवं कार्य प्रस्ताव', menuType: 'transaction', orderNo: 3, navigateUrl: '/portal/transaction/work-proposal' },
              { menuId: 4, menuNameE: 'Reports', menuNameH: 'रिपोर्ट्स एवं डैशबोर्ड', menuType: 'reports', orderNo: 4, navigateUrl: '/portal/reports/physical-progress' },
              { menuId: 5, menuNameE: 'UC/CC', menuNameH: 'उपयोगिता / पूर्णता प्रमाण पत्र', menuType: 'uccc', orderNo: 5, navigateUrl: '/portal/uccc/uc-entry' },
              { menuId: 6, menuNameE: 'Administrator', menuNameH: 'प्रशासनिक नियंत्रण', menuType: 'admin', orderNo: 6, navigateUrl: '/portal/admin/menu-creation' },
              { menuId: 7, menuNameE: 'MPK', menuNameH: 'महात्मा गांधी पंचायत केंद्र', menuType: 'mpk', orderNo: 7, navigateUrl: '/portal/mpk/kendra' },
              { menuId: 8, menuNameE: 'Help', menuNameH: 'सहायता एवं निर्देशिका', menuType: 'help', orderNo: 8, navigateUrl: '/portal/help/user-manual' }
            ]
          }
        }));
      }

      // 2. GetMenuFlags
      if (isLocalhost && urlLower.includes('getmenuflags')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 2,
            data: [
              { flagId: 1, flagName: 'Active', isVisible: true },
              { flagId: 2, flagName: 'Inactive', isVisible: false }
            ]
          }
        }));
      }

      // 3. GetMenus
      if (isLocalhost && urlLower.includes('getmenus')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 5,
            data: [
              { menuId: 101, parentId: 1, menuNameE: 'Scheme Configuration', menuNameH: 'योजना विन्यास', orderNo: 1, navigateUrl: '/portal/master/scheme-configuration' },
              { menuId: 102, parentId: 2, menuNameE: 'Plan Management', menuNameH: 'योजना प्रबंधन', orderNo: 1, navigateUrl: '/portal/sanction/plan/create' },
              { menuId: 103, parentId: 2, menuNameE: 'Admin Sanction Entry', menuNameH: 'प्रशासनिक स्वीकृति प्रविष्टि', orderNo: 2, navigateUrl: '/portal/sanction/admin-sanction/entry' },
              { menuId: 104, parentId: 6, menuNameE: 'Menu Creation', menuNameH: 'मेनू निर्माण', orderNo: 1, navigateUrl: '/portal/admin/menu-creation' },
              { menuId: 105, parentId: 6, menuNameE: 'Role Master Rights', menuNameH: 'रोल मास्टर अधिकार', orderNo: 2, navigateUrl: '/portal/admin/role-master-rights' }
            ]
          }
        }));
      }

      // 4. GetMenu/{id}
      if (isLocalhost && urlLower.includes('getmenu/')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            data: {
              menuId: 102,
              parentId: 2,
              menuNameE: 'Plan Management',
              menuNameH: 'योजना प्रबंधन',
              navigateUrl: '/portal/sanction/plan/create',
              orderNo: 1,
              isActive: true
            }
          }
        }));
      }

      // 5. CreateMenu / UpdateMenu / DeleteMenu / UpdateMenuOrder
      if (isLocalhost && (urlLower.includes('createmenu') || urlLower.includes('updatemenu') || urlLower.includes('deletemenu') || urlLower.includes('updatemenuorder'))) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: 'Menu operation completed successfully.',
            data: { id: 102 }
          }
        }));
      }

      // 6. GetRoleLoginTypes
      if (isLocalhost && urlLower.includes('getrolelogintypes')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 3,
            data: [
              { loginTypeId: 1, loginTypeName: 'State Administrator', roleCode: 'STATE_ADMIN' },
              { loginTypeId: 2, loginTypeName: 'District Administrator', roleCode: 'DISTRICT_ADMIN' },
              { loginTypeId: 3, loginTypeName: 'Block Level Officer', roleCode: 'BLOCK_USER' }
            ]
          }
        }));
      }

      // 7. GetRoleMenuRights
      if (isLocalhost && urlLower.includes('getrolemenurights')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            data: {
              loginTypeId: 2,
              assignedMenuIds: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102, 103, 104, 105]
            }
          }
        }));
      }

      // 8. SaveRoleMenuRights
      if (isLocalhost && urlLower.includes('saverolemenurights')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            message: 'Role menu rights saved successfully.',
            data: { success: true }
          }
        }));
      }

      // 9. BudgetTypeList
      if (isLocalhost && urlLower.includes('budgettypelist')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 2,
            data: [
              { id: 1, budgetTypeCode: 'BT01', budgetTypeName: 'Annual Plan - 80%', budgetTypeNameHi: 'वार्षिक योजना - 80%', isActive: true },
              { id: 2, budgetTypeCode: 'BT02', budgetTypeName: 'State reserved plan - 19%', budgetTypeNameHi: 'राज्य आरक्षित योजना - 19%', isActive: true }
            ]
          }
        }));
      }

      // 10. GetWorkListofPlan
      if (isLocalhost && urlLower.includes('getworklistofplan')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 2,
            data: [
              {
                id: 1,
                createdBy: 'JAIPUR_ADMIN',
                schemeCode: 5,
                schemeName: 'मुख्यमंत्री थार सीमा क्षेत्र विकास कार्यक्रम',
                workName: 'निर्माण कार्य सामुदायिक भवन ग्राम कुकास आमेर',
                sectorArea: 'Rural',
                town: '-',
                blockName: 'Amer',
                gramPanchayat: 'Kukas',
                village: 'Kukas',
                totalEstimatedCost: 15.50,
                schemeAmount: 15.50,
                convergenceAmount: 0,
                convergenceScheme: 'N/A',
                workCategory: 'Building & Infra',
                subCategory: 'Community Hall',
                executiveDept: 'Panchayati Raj Department',
                executiveAgency: 'Gram Panchayat Amer',
                priority: 'First',
                jShreeYojna: 'N/A',
                cmBadpCategory: 'Standard',
                mlaName: 'Shri Satish Poonia',
                dlcApprovalDate1: '16/09/2026',
                blockApprovalDate1: '16/09/2026',
                status: 'Draft Saved'
              },
              {
                id: 2,
                createdBy: 'JAIPUR_ADMIN',
                schemeCode: 5,
                schemeName: 'मुख्यमंत्री थार सीमा क्षेत्र विकास कार्यक्रम',
                workName: 'सी सी रोड निर्माण कार्य मुख्य बस स्टैंड से पंचायत भवन',
                sectorArea: 'Rural',
                town: '-',
                blockName: 'Sanganer',
                gramPanchayat: 'Watika',
                village: 'Watika Main',
                totalEstimatedCost: 28.00,
                schemeAmount: 28.00,
                convergenceAmount: 0,
                convergenceScheme: 'N/A',
                workCategory: 'Road & Connectivity',
                subCategory: 'Concrete Road (CC Road)',
                executiveDept: 'Public Works Department (PWD)',
                executiveAgency: 'PWD Division Jaipur',
                priority: 'Second',
                jShreeYojna: 'N/A',
                cmBadpCategory: 'Standard',
                mlaName: 'Shri Rajendra Rathore',
                dlcApprovalDate1: '18/09/2026',
                blockApprovalDate1: '18/09/2026',
                status: 'Draft Saved'
              }
            ]
          }
        }));
      }

      // 11. SsoLogin
      if (isLocalhost && urlLower.includes('ssologin')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            isSuccessful: true,
            message: 'SSO Login successful!',
            district: 'JAIPUR',
            districtHi: 'जयपुर',
            role: 'District Administrator',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken'
          }
        }));
      }

      // 12. SavePlanDetails
      if (isLocalhost && urlLower.includes('saveplandetails')) {
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

      // 13. SavePlanFileandForward
      if (isLocalhost && urlLower.includes('saveplanfileandforward')) {
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

      // 14. ApprovePlanandUploadFile / ApprovePlanandUploadFileMultiple
      if (isLocalhost && (urlLower.includes('approveplananduploadfile') || urlLower.includes('approveplananduploadfilemultiple'))) {
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

      // 15. RejectPlan
      if (isLocalhost && urlLower.includes('rejectplan')) {
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

      // 16. RevertPlan
      if (isLocalhost && urlLower.includes('revertplan')) {
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

      // 17. GetApprovedPlanListOfWork
      if (isLocalhost && urlLower.includes('getapprovedplanlistofwork')) {
        return of(new HttpResponse({
          status: 200,
          statusText: 'OK',
          body: {
            success: true,
            count: 1,
            data: [
              {
                id: 103,
                schemeCode: 5,
                schemeName: 'MLALAD',
                finYr: '2026-27',
                districtCode: '101',
                districtName: 'JAIPUR',
                totalEstimatedCost: 25.0,
                status: 'Approved'
              }
            ]
          }
        }));
      }

      return throwError(() => error);
    })
  );
};
