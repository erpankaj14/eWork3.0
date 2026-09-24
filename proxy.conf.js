const PROXY_CONFIG = [
  {
    context: ['/api', '/iwmsapi'],
    target: 'http://10.130.3.10',
    secure: false,
    changeOrigin: true,
    bypass: function (req, res) {
      const url = req.url.toLowerCase();

      // 1. GetParentMenus
      if (url.includes('getparentmenus')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: 8,
          data: [
            { menuId: 1, menuNameE: 'Master', menuNameH: 'मास्टर प्रबंधन', menuType: 'admin', orderNo: 1, navigateUrl: '/portal/master/scheme-configuration', mvcPath: null, target: 'Self' },
            { menuId: 2, menuNameE: 'Sanction', menuNameH: 'स्वीकृति प्रबंधन', menuType: 'sanction', orderNo: 2, navigateUrl: '/portal/sanction/admin-sanction/entry', mvcPath: null, target: 'Self' },
            { menuId: 3, menuNameE: 'Transaction', menuNameH: 'लेन-देन एवं कार्य प्रस्ताव', menuType: 'transaction', orderNo: 3, navigateUrl: '/portal/transaction/work-proposal', mvcPath: null, target: 'Self' },
            { menuId: 4, menuNameE: 'Reports', menuNameH: 'रिपोर्ट्स एवं डैशबोर्ड', menuType: 'reports', orderNo: 4, navigateUrl: '/portal/reports/physical-progress', mvcPath: null, target: 'Self' },
            { menuId: 5, menuNameE: 'UC/CC', menuNameH: 'उपयोगिता / पूर्णता प्रमाण पत्र', menuType: 'uccc', orderNo: 5, navigateUrl: '/portal/uccc/uc-entry', mvcPath: null, target: 'Self' },
            { menuId: 6, menuNameE: 'Administrator', menuNameH: 'प्रशासनिक नियंत्रण', menuType: 'admin', orderNo: 6, navigateUrl: '/portal/admin/menu-creation', mvcPath: null, target: 'Self' },
            { menuId: 7, menuNameE: 'MPK', menuNameH: 'महात्मा गांधी पंचायत केंद्र', menuType: 'mpk', orderNo: 7, navigateUrl: '/portal/mpk/kendra', mvcPath: null, target: 'Self' },
            { menuId: 8, menuNameE: 'Help', menuNameH: 'सहायता एवं निर्देशिका', menuType: 'help', orderNo: 8, navigateUrl: '/portal/help/user-manual', mvcPath: null, target: 'Self' }
          ]
        }));
        return true;
      }

      // 2. GetMenuFlags
      if (url.includes('getmenuflags')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: 2,
          data: [
            { flagId: 1, flagName: 'Active', isVisible: true },
            { flagId: 2, flagName: 'Inactive', isVisible: false }
          ]
        }));
        return true;
      }

      // 3. GetMenus
      if (url.includes('getmenus')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: 5,
          data: [
            { menuId: 101, parentId: 1, menuNameE: 'Scheme Configuration', menuNameH: 'योजना विन्यास', orderNo: 1, navigateUrl: '/portal/master/scheme-configuration' },
            { menuId: 102, parentId: 2, menuNameE: 'Plan Management', menuNameH: 'योजना प्रबंधन', orderNo: 1, navigateUrl: '/portal/sanction/plan/create' },
            { menuId: 103, parentId: 2, menuNameE: 'Admin Sanction Entry', menuNameH: 'प्रशासनिक स्वीकृति प्रविष्टि', orderNo: 2, navigateUrl: '/portal/sanction/admin-sanction/entry' },
            { menuId: 104, parentId: 6, menuNameE: 'Menu Creation', menuNameH: 'मेनू निर्माण', orderNo: 1, navigateUrl: '/portal/admin/menu-creation' },
            { menuId: 105, parentId: 6, menuNameE: 'Role Master Rights', menuNameH: 'रोल मास्टर अधिकार', orderNo: 2, navigateUrl: '/portal/admin/role-master-rights' }
          ]
        }));
        return true;
      }

      // 4. GetRoleLoginTypes (Role Master API)
      if (url.includes('getrolelogintypes')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: 4,
          data: [
            { loginTypeId: 1, description: 'State Administrator (राज्य प्रशासक)', isActive: true },
            { loginTypeId: 2, description: 'District Administrator (जिला प्रशासक)', isActive: true },
            { loginTypeId: 3, description: 'Block Development Officer (BDO)', isActive: true },
            { loginTypeId: 4, description: 'Junior Engineer (JEN / AEN)', isActive: true }
          ]
        }));
        return true;
      }

      // 5. GetRoleMenuRights (Role Master API)
      if (url.includes('getrolemenurights')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Role menu rights retrieved successfully',
          data: {
            loginTypeId: 1,
            assignedMenuIds: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102, 103, 104, 105],
            menus: [
              {
                menuId: 1,
                menuNameE: 'Master Management',
                menuNameH: 'मास्टर प्रबंधन',
                parentId: null,
                isAssigned: true,
                children: [
                  { menuId: 101, menuNameE: 'Scheme Configuration', menuNameH: 'योजना विन्यास', parentId: 1, isAssigned: true, children: [] }
                ]
              },
              {
                menuId: 2,
                menuNameE: 'Sanction Management',
                menuNameH: 'स्वीकृति प्रबंधन',
                parentId: null,
                isAssigned: true,
                children: [
                  { menuId: 102, menuNameE: 'Plan Management', menuNameH: 'योजना प्रबंधन', parentId: 2, isAssigned: true, children: [] },
                  { menuId: 103, menuNameE: 'Admin Sanction Entry', menuNameH: 'प्रशासनिक स्वीकृति', parentId: 2, isAssigned: true, children: [] }
                ]
              },
              {
                menuId: 6,
                menuNameE: 'Administrator Control',
                menuNameH: 'प्रशासनिक नियंत्रण',
                parentId: null,
                isAssigned: true,
                children: [
                  { menuId: 104, menuNameE: 'Menu Creation', menuNameH: 'मेनू निर्माण', parentId: 6, isAssigned: true, children: [] },
                  { menuId: 105, menuNameE: 'Role Master Rights', menuNameH: 'रोल मास्टर अधिकार', parentId: 6, isAssigned: true, children: [] }
                ]
              }
            ]
          }
        }));
        return true;
      }

      // 6. SaveRoleMenuRights
      if (url.includes('saverolemenurights')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Role menu rights updated successfully!',
          data: {
            loginTypeId: 1,
            assignedMenuIds: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102, 103, 104, 105]
          }
        }));
        return true;
      }

      // 7. BudgetTypeList
      if (url.includes('budgettypelist')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: 2,
          data: [
            { id: 1, budgetTypeCode: 'BT01', budgetTypeName: 'Annual Plan - 80%', budgetTypeNameHi: 'वार्षिक योजना - 80%', isActive: true },
            { id: 2, budgetTypeCode: 'BT02', budgetTypeName: 'State reserved plan - 19%', budgetTypeNameHi: 'राज्य आरक्षित योजना - 19%', isActive: true }
          ]
        }));
        return true;
      }

      // 8. GetWorkListofPlan
      if (url.includes('getworklistofplan')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
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
        }));
        return true;
      }

      // 9. SsoLogin
      if (url.includes('ssologin')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          isSuccessful: true,
          message: 'SSO Login successful!',
          district: 'JAIPUR',
          districtHi: 'जयपुर',
          role: 'District Administrator',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken'
        }));
        return true;
      }

      // 10. SavePlanDetails
      if (url.includes('saveplandetails')) {
        const assignedId = Math.floor(Math.random() * 9000 + 1000);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Plan details saved successfully! (Plan ID #${assignedId})`,
          data: {
            id: assignedId,
            status: 'Draft Saved',
            createdDate: new Date().toLocaleDateString('en-GB')
          }
        }));
        return true;
      }

      // Continue to target if not bypassed
      return false;
    }
  }
];

module.exports = PROXY_CONFIG;
