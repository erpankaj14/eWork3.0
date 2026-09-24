import { HttpInterceptorFn, HttpResponse, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

function getLocalPlans(): any[] {
  try {
    const stored = localStorage.getItem('ework_saved_local_plans');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalPlan(plan: any): any {
  const plans = getLocalPlans();
  const assignedId = plan.id && plan.id > 0 ? plan.id : Math.floor(Math.random() * 9000 + 1000);
  const newPlan = {
    ...plan,
    id: assignedId,
    status: plan.status || 'Draft Saved',
    createdDate: new Date().toLocaleDateString('en-GB')
  };

  const existingIdx = plans.findIndex(p => p.id === assignedId);
  if (existingIdx >= 0) {
    plans[existingIdx] = newPlan;
  } else {
    plans.unshift(newPlan);
  }

  try {
    localStorage.setItem('ework_saved_local_plans', JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save plan to localStorage:', e);
  }
  return newPlan;
}

function createPdfBlobResponse(): HttpResponse<Blob> {
  const pdfContent = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
4 0 obj <</Length 120>> stream
BT /F1 16 Tf 50 720 Td (e-Work 3.0 Plan Document PDF) Tj ET
BT /F1 12 Tf 50 680 Td (Generated for testing and offline development) Tj ET
endstream endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000416 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
495
%%EOF`;
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return new HttpResponse({
    status: 200,
    statusText: 'OK',
    headers: new HttpHeaders({ 'Content-Type': 'application/pdf' }),
    body: blob
  });
}

export const planMockInterceptor: HttpInterceptorFn = (req, next) => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlLower = req.url.toLowerCase();

  // For localhost development, intercept mock endpoints directly to return 200 OK without failing XHR 401s
  if (isLocalhost) {
    // 1. GetParentMenus
    if (urlLower.includes('getparentmenus')) {
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
    if (urlLower.includes('getmenuflags')) {
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
    if (urlLower.includes('getmenus')) {
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
    if (urlLower.includes('getmenu/')) {
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
    if (urlLower.includes('createmenu') || urlLower.includes('updatemenu') || urlLower.includes('deletemenu') || urlLower.includes('updatemenuorder')) {
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
    if (urlLower.includes('getrolelogintypes')) {
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
    if (urlLower.includes('getrolemenurights')) {
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
    if (urlLower.includes('saverolemenurights')) {
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
    if (urlLower.includes('budgettypelist')) {
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
    if (urlLower.includes('getworklistofplan')) {
      const localPlans = getLocalPlans();
      const defaultMockPlans = [
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
      ];

      const existingIds = new Set(defaultMockPlans.map(p => p.id));
      const uniqueLocal = localPlans.filter(p => !existingIds.has(p.id));
      const combined = [...uniqueLocal, ...defaultMockPlans];

      return of(new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: {
          success: true,
          count: combined.length,
          data: combined
        }
      }));
    }

    // 11. SsoLogin
    if (urlLower.includes('ssologin')) {
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
    if (urlLower.includes('saveplandetails')) {
      let bodyPayload: any = {};
      try {
        bodyPayload = req.body || {};
      } catch (e) {}

      const savedPlan = saveLocalPlan(bodyPayload);

      return of(new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: {
          success: true,
          message: `Plan details saved successfully! (Plan ID #${savedPlan.id})`,
          data: savedPlan
        }
      }));
    }

    // 13. PDF Download endpoints
    if (urlLower.includes('downloadpdfplan') || urlLower.includes('viewdownloadpdfplan') || urlLower.includes('downloadpdfplanstate')) {
      return of(createPdfBlobResponse());
    }

    // 14. SavePlanFileandForward
    if (urlLower.includes('saveplanfileandforward')) {
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

    // 15. ApprovePlanandUploadFile / ApprovePlanandUploadFileMultiple
    if (urlLower.includes('approveplananduploadfile') || urlLower.includes('approveplananduploadfilemultiple')) {
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

    // 16. RejectPlan
    if (urlLower.includes('rejectplan')) {
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

    // 17. RevertPlan
    if (urlLower.includes('revertplan')) {
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

    // 18. GetApprovedPlanListOfWork
    if (urlLower.includes('getapprovedplanlistofwork')) {
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
  }

  return next(req);
};
