import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';

import { LanguageService } from '../../core/services/language.service';
import { AuthService, UserSession } from '../../core/services/auth.service';
import { MenuApiService } from '../../core/services/menu-api.service';
import { 
  MenuLevelName, MenuListItemDto, ParentMenuDto, 
  MenuFlagDto, SaveMenuRequest, toMenuLevelName 
} from '../../core/services/menu-api.models';
import { RoleMasterApiService } from '../../core/services/role-master-api.service';
import { LoginTypeDto, RoleMenuNodeDto } from '../../core/services/role-master-api.models';

interface ModuleRecord {
  id: string;
  referenceNo: string;
  titleHi: string;
  titleEn: string;
  scheme: string;
  gramPanchayat: string;
  amountLakhs: number;
  status: 'Approved' | 'Pending Review' | 'In Progress' | 'Verified';
  statusHi: string;
  date: string;
}

@Component({
  selector: 'app-module-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './module-workspace.component.html',
  styleUrls: ['./module-workspace.component.css']
})
export class ModuleWorkspaceComponent implements OnInit {
  user: UserSession | null = null;
  moduleKey: string = '';
  moduleTitleEn: string = 'Work Module Dashboard';
  moduleTitleHi: string = 'कार्य मॉड्यूल डैशबोर्ड';
  moduleDescEn: string = 'Integrated Departmental Work Execution & Monitoring Workspace';
  moduleDescHi: string = 'ग्रामीण विकास एवं पंचायती राज विभाग - एकीकृत कार्य प्रबंधन डैशबोर्ड';
  moduleBadgeEn: string = '2026-27 ACTIVE';
  moduleBadgeHi: string = '2026-27 सक्रिय';

  records: ModuleRecord[] = [
    {
      id: 'WRK-2026-001',
      referenceNo: 'RJ-JPR-2026-10482',
      titleHi: 'राजकीय उच्च माध्यमिक विद्यालय भवन निर्माण एवं चारदीवारी',
      titleEn: 'Govt. Sr. Sec. School Building Construction & Boundary Wall',
      scheme: 'MLA-LAD',
      gramPanchayat: 'बस्सी (Bassi)',
      amountLakhs: 24.50,
      status: 'In Progress',
      statusHi: 'प्रगतिरत',
      date: '15-Jul-2026'
    },
    {
      id: 'WRK-2026-002',
      referenceNo: 'RJ-JPR-2026-10491',
      titleHi: 'ग्राम पंचायत कार्यालय एवं महात्मा गांधी पंचायत केंद्र (MPK) निर्माण',
      titleEn: 'Gram Panchayat Office & MPK Kendra Construction',
      scheme: 'MP-LAD',
      gramPanchayat: 'चाकसू (Chaksu)',
      amountLakhs: 18.00,
      status: 'Approved',
      statusHi: 'स्वीकृत (AS)',
      date: '20-Jul-2026'
    },
    {
      id: 'WRK-2026-003',
      referenceNo: 'RJ-JPR-2026-10512',
      titleHi: 'सीमेंट कंक्रीट सड़क (CC Road) एवं नाली निर्माण कार्य',
      titleEn: 'CC Road & Underground Drainage Pipeline Work',
      scheme: 'MMVY',
      gramPanchayat: 'जमवारामगढ़ (Jamwa Ramgarh)',
      amountLakhs: 14.75,
      status: 'Pending Review',
      statusHi: 'समीक्षाधीन',
      date: '25-Jul-2026'
    },
    {
      id: 'WRK-2026-004',
      referenceNo: 'RJ-JPR-2026-10539',
      titleHi: 'आंगनबाड़ी केंद्र भवन सुदृढ़ीकरण एवं पेयजल सुविधा',
      titleEn: 'Anganwadi Center Building Upgradation & Drinking Water',
      scheme: 'MLA-LAD',
      gramPanchayat: 'सांगानेर (Sanganer)',
      amountLakhs: 8.20,
      status: 'Verified',
      statusHi: 'सत्यापित',
      date: '28-Jul-2026'
    }
  ];

  // --- Menu API integration fields ---
  mainMenus: ParentMenuDto[] = [];
  parentMenus: MenuListItemDto[] = [];
  menuFlags: MenuFlagDto[] = [];
  gridRows: MenuListItemDto[] = [];
  orderRows: MenuListItemDto[] = []; 
  editingMenuId: number | null = null;
  private fb = inject(FormBuilder);
  private roleApi = inject(RoleMasterApiService);

  // --- Role Master API state ---
  loginTypes: LoginTypeDto[] = [];
  menuTree: RoleMenuNodeDto[] = [];
  selectedMenuIds = new Set<number>();
  private readonly nodeById = new Map<number, RoleMenuNodeDto>();
  private readonly parentById = new Map<number, number>();
  roleLoading = false;
  roleSaving = false;
  loginTypeControl = this.fb.control<number | null>(null);

  form = this.fb.nonNullable.group({
    menuType: this.fb.nonNullable.control<MenuLevelName>('MainMenu'),
    mainMenuId: this.fb.control<number | null>(null),
    parentMenuId: this.fb.control<number | null>(null),
    menuNameE: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(49)]),
    menuNameH: this.fb.control<string | null>(null, Validators.maxLength(49)),
    menuNameG: this.fb.control<string | null>(null, Validators.maxLength(49)),
    navigatePage: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(299)]),
    isMvc: this.fb.nonNullable.control(false),
    isEstimate: this.fb.nonNullable.control(false),
    menuFlag: this.fb.control<number | null>(null),
    imgUrl: this.fb.control<string | null>(null, Validators.maxLength(200)),
    imgColor: this.fb.control<string | null>('#E15B25', Validators.maxLength(50))
  });

  // Form models for other administrator sub-pages
  createLoginType: string = '';
  createUsername: string = '';
  createPassword: string = '';
  createConfirmPassword: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  targetSsoId: string = '';
  deactivateReason: string = '';
  resetNewPassword: string = '';
  mlaConstituency: string = '';
  mlaName: string = '';
  mlaSsoId: string = '';
  switchSsoId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public languageService: LanguageService,
    private authService: AuthService,
    private menuApi: MenuApiService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(session => {
      this.user = session || this.authService.getCurrentUser();
    });

    this.route.url.subscribe(() => {
      this.updateModuleMetadata(this.router.url);
      if (this.moduleKey === 'menu-creation') {
        this.loadInitialMenuData();
      } else if (this.moduleKey === 'create-role') {
        this.loadRoleInitialData();
      }
    });
    
    // Fallback for initial load
    this.updateModuleMetadata(this.router.url);
    if (this.moduleKey === 'menu-creation') {
      this.loadInitialMenuData();
    } else if (this.moduleKey === 'create-role') {
      this.loadRoleInitialData();
    }
  }

  // --- Menu API Methods ---

  private loadInitialMenuData(): void {
    forkJoin({
      mainMenus: this.menuApi.getParentMenus(),
      flags: this.menuApi.getMenuFlags(),
      grid: this.menuApi.getMenus(null, 'MainMenu')
    }).subscribe({
      next: ({ mainMenus, flags, grid }) => {
        this.mainMenus = mainMenus.data;
        this.menuFlags = flags.data;
        this.gridRows = grid.data;
        this.orderRows = [...grid.data];
      },
      error: error => this.showApiError(error)
    });
  }

  onMenuTypeChanged(type: string): void {
    const menuType = type as MenuLevelName;
    this.form.patchValue({ mainMenuId: null, parentMenuId: null });
    this.parentMenus = [];
   
    if (menuType === 'MainMenu' || menuType === 'MlaMenu') {
      this.menuApi.getMenus(null, menuType).subscribe({
        next: response => {
          this.gridRows = response.data;
          this.orderRows = [...response.data];
        },
        error: error => this.showApiError(error)
      });
    } else {
      this.gridRows = [];
      this.orderRows = [];
    }
  }
   
  onMainMenuChanged(mainMenuId: any): void {
    const id = mainMenuId ? Number(mainMenuId) : null;
    this.form.patchValue({ parentMenuId: null });
    if (!id) {
      this.parentMenus = [];
      this.gridRows = [];
      this.orderRows = [];
      return;
    }

    this.menuApi.getMenus(id).subscribe({
      next: response => {
        this.parentMenus = response.data;
        if (this.form.controls.menuType.value === 'ParentMenu') {
          this.gridRows = response.data;
          this.orderRows = [...response.data];
        }
      },
      error: error => this.showApiError(error)
    });
  }
   
  onParentMenuChanged(parentMenuId: any): void {
    const id = parentMenuId ? Number(parentMenuId) : null;
    if (!id) {
      this.gridRows = [];
      this.orderRows = [];
      return;
    }

    this.menuApi.getMenus(id).subscribe({
      next: response => {
        this.gridRows = response.data;
        this.orderRows = [...response.data];
      },
      error: error => this.showApiError(error)
    });
  }

  editMenu(menuId: number): void {
    this.menuApi.getMenu(menuId).subscribe({
      next: response => {
        const item = response.data;
        const menuType = toMenuLevelName(item.menuType);
       
        this.editingMenuId = item.menuId;
        this.form.patchValue({ ...item, menuType });
       
        if (menuType === 'SubMenu' && item.mainMenuId) {
          this.menuApi.getMenus(item.mainMenuId).subscribe({
            next: parentResp => this.parentMenus = parentResp.data,
            error: error => this.showApiError(error)
          });
        }
      },
      error: error => this.showApiError(error)
    });
  }

  saveMenu(): void {
    if (this.form.invalid) {
      this.toast.error('Please fill all required fields correctly.');
      return;
    }

    const body: SaveMenuRequest = this.form.getRawValue();
    // Convert numeric strings back to numbers if needed
    if (body.mainMenuId) body.mainMenuId = Number(body.mainMenuId);
    if (body.parentMenuId) body.parentMenuId = Number(body.parentMenuId);
    if (body.menuFlag) body.menuFlag = Number(body.menuFlag);

    if (this.editingMenuId) {
      this.menuApi.updateMenu(this.editingMenuId, body).subscribe({
        next: response => {
          this.toast.success(response.message);
          this.resetAndReload();
        },
        error: error => this.showApiError(error)
      });
    } else {
      this.menuApi.createMenu(body).subscribe({
        next: response => {
          this.toast.success(response.message);
          this.resetAndReload();
        },
        error: error => this.showApiError(error)
      });
    }
  }

  deleteMenu(menuId: number): void {
    if (!confirm('Are you sure you want to delete this menu?')) return;
    
    this.menuApi.deleteMenu(menuId).subscribe({
      next: response => {
        this.toast.success(response.message);
        this.reloadCurrentList();
      },
      error: error => {
        if (error.status === 409) {
          this.toast.warning(error.error?.message || 'Delete blocked by user rights.');
          return;
        }
        this.showApiError(error);
      }
    });
  }

  drop(event: CdkDragDrop<MenuListItemDto[]>): void {
    moveItemInArray(this.orderRows, event.previousIndex, event.currentIndex);
  }
   
  saveOrder(): void {
    const type = this.form.controls.menuType.value;
    let parentId: number | null = null;
    
    if (type === 'ParentMenu') parentId = Number(this.form.controls.mainMenuId.value) || null;
    else if (type === 'SubMenu') parentId = Number(this.form.controls.parentMenuId.value) || null;

    this.menuApi.updateMenuOrder({
      parentId,
      menuIds: this.orderRows.map(x => x.menuId)
    }).subscribe({
      next: response => {
        this.toast.success(response.message);
        this.reloadCurrentList();
      },
      error: error => this.showApiError(error)
    });
  }

  resetOrder(): void {
    this.orderRows = [...this.gridRows];
  }

  resetAndReload(): void {
    this.editingMenuId = null;
    const currentType = this.form.controls.menuType.value;
    const mainId = this.form.controls.mainMenuId.value;
    const parentId = this.form.controls.parentMenuId.value;
    
    this.form.reset({ menuType: currentType, mainMenuId: mainId, parentMenuId: parentId, isMvc: false, isEstimate: false, imgColor: '#E15B25' });
    this.reloadCurrentList();
  }

  reloadCurrentList(): void {
    const type = this.form.controls.menuType.value;
    if (type === 'MainMenu' || type === 'MlaMenu') {
      this.onMenuTypeChanged(type);
    } else if (type === 'ParentMenu') {
      this.onMainMenuChanged(this.form.controls.mainMenuId.value);
    } else if (type === 'SubMenu') {
      this.onParentMenuChanged(this.form.controls.parentMenuId.value);
    }
  }

  private showApiError(error: HttpErrorResponse): void {
    const message = error.error?.message ?? 'Unable to complete the request.';
    if (error.status === 401) {
      this.authService.logout();
      return;
    }
    this.toast.error(message);
  }

  // --- Role Master API Methods ---
  private loadRoleInitialData(): void {
    if (this.loginTypes.length === 0) {
      this.roleApi.getLoginTypes().subscribe({
        next: response => this.loginTypes = response.data,
        error: error => this.showApiError(error)
      });
    }
  }

  onLoginTypeChanged(loginTypeId: number | null): void {
    if (!loginTypeId) {
      this.menuTree = [];
      this.selectedMenuIds.clear();
      return;
    }
    this.roleLoading = true;
    this.roleApi.getRoleMenuRights(loginTypeId).subscribe({
      next: response => {
        this.menuTree = response.data.menus;
        this.selectedMenuIds = new Set(response.data.assignedMenuIds);
        this.indexTree(this.menuTree);
        this.roleLoading = false;
      },
      error: error => {
        this.roleLoading = false;
        this.showApiError(error);
      }
    });
  }

  private indexTree(nodes: RoleMenuNodeDto[]): void {
    this.nodeById.clear();
    this.parentById.clear();
    const visit = (items: RoleMenuNodeDto[]): void => {
      for (const node of items) {
        this.nodeById.set(node.menuId, node);
        if (node.parentId !== null) {
          this.parentById.set(node.menuId, node.parentId);
        }
        visit(node.children);
      }
    };
    visit(nodes);
  }

  onMenuCheckboxChanged(node: RoleMenuNodeDto, checked: boolean): void {
    this.setNodeAndDescendants(node, checked);
    if (checked) {
      this.selectAncestors(node.parentId);
    }
  }

  private setNodeAndDescendants(node: RoleMenuNodeDto, checked: boolean): void {
    if (checked) {
      this.selectedMenuIds.add(node.menuId);
    } else {
      this.selectedMenuIds.delete(node.menuId);
    }
    node.children.forEach(child => this.setNodeAndDescendants(child, checked));
  }

  private selectAncestors(parentId: number | null): void {
    let currentId = parentId;
    while (currentId !== null) {
      this.selectedMenuIds.add(currentId);
      currentId = this.parentById.get(currentId) ?? null;
    }
  }

  selectAllRights(): void {
    this.nodeById.forEach(node => this.selectedMenuIds.add(node.menuId));
  }

  clearAllRights(): void {
    this.selectedMenuIds.clear();
  }

  trackByMenuId(_index: number, node: RoleMenuNodeDto): number {
    return node.menuId;
  }

  saveRights(): void {
    const loginTypeId = this.loginTypeControl.value;
    if (loginTypeId === null) {
      this.toast.warning('Select a login type.');
      return;
    }
    const menuIds = Array.from(this.selectedMenuIds).sort((a, b) => a - b);
    if (menuIds.length === 0 && !confirm('This will remove all menu rights. Continue?')) {
      return;
    }
    this.roleSaving = true;
    this.roleApi.saveRoleMenuRights({ loginTypeId, menuIds }).subscribe({
      next: response => {
        this.selectedMenuIds = new Set(response.data.assignedMenuIds);
        this.roleSaving = false;
        this.toast.success(response.message);
      },
      error: error => {
        this.roleSaving = false;
        this.showApiError(error);
      }
    });
  }

  // --- Utility / UI metadata methods ---

  private updateModuleMetadata(url: string): void {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('planning')) {
      this.moduleTitleEn = 'Planning Stage Workspace';
      this.moduleTitleHi = 'योजना निर्माण (Planning) चरण डैशबोर्ड';
      this.moduleDescEn = 'Gram Panchayat & District Annual Work Plan Formulation & Review';
      this.moduleDescHi = 'ग्राम पंचायत एवं जिला वार्षिक कार्य योजना निर्माण एवं तकनीकी समीक्षा';
    } else if (lowerUrl.includes('bsr')) {
      this.moduleTitleEn = 'BSR Preparation Workspace';
      this.moduleTitleHi = 'बीएसआर तैयारी (BSR Preparation) निर्देशिका';
      this.moduleDescEn = 'Basic Schedule of Rates calculation, item-wise standard adoption';
      this.moduleDescHi = 'बेसिक शेड्यूल ऑफ रेट्स (BSR) निर्धारण एवं मानक दर अनुसूची';
    } else if (lowerUrl.includes('cost-estimation')) {
      this.moduleTitleEn = 'Cost Estimation & Material Evaluation';
      this.moduleTitleHi = 'लागत अनुमान एवं सामग्री मूल्यांकन';
      this.moduleDescEn = 'Detailed item-wise cost estimation & material ratio analysis';
      this.moduleDescHi = 'विस्तृत मदवार लागत अनुमान एवं सामग्री-श्रम अनुपात निर्धारण';
    } else if (lowerUrl.includes('gis')) {
      this.moduleTitleEn = 'GIS Tagging & Site Photo Documentation';
      this.moduleTitleHi = 'जीआईएस टैगिंग एवं स्थल फोटो अपलोड';
      this.moduleDescEn = 'Geo-referenced site tagging & before-work photograph verification';
      this.moduleDescHi = 'जियो-टैगिंग एवं कार्य-पूर्व फोटोग्राफ अपलोड एवं सत्यापन';
    } else if (lowerUrl.includes('technical-sanction')) {
      this.moduleTitleEn = 'Technical Sanction (TS) Processing';
      this.moduleTitleHi = 'तकनीकी स्वीकृति (Technical Sanction) प्रबंधन';
      this.moduleDescEn = 'Engineering verification & Technical Sanction order issuance';
      this.moduleDescHi = 'तकनीकी मूल्यांकन, इंजीनियरिंग सत्यापन एवं TS आदेश जारी करना';
    } else if (lowerUrl.includes('financial-sanction')) {
      this.moduleTitleEn = 'Financial Sanction (FS) & eSign Portal';
      this.moduleTitleHi = 'वित्तीय स्वीकृति (Financial Sanction) एवं ई-हस्ताक्षर';
      this.moduleDescEn = 'Fund allocation approval, eSign file view & FS dispatch';
      this.moduleDescHi = 'राशि आवंटन स्वीकृति, ई-हस्ताक्षर सत्यापन एवं FS प्रेषण';
    } else if (lowerUrl.includes('work-execution')) {
      this.moduleTitleEn = 'Work Execution & Agency Mapping';
      this.moduleTitleHi = 'कार्य निष्पादन एवं कार्यकारी एजेंसी आवंटन';
      this.moduleDescEn = 'Executing agency mapping, muster roll & on-ground work tracking';
      this.moduleDescHi = 'कार्यकारी एजेंसी आवंटन एवं स्थल पर वास्तविक निर्माण कार्य प्रगति';
    } else if (lowerUrl.includes('uccc')) {
      this.moduleTitleEn = 'UC / CC Certificate Management';
      this.moduleTitleHi = 'उपयोगिता (UC) एवं पूर्णता (CC) प्रमाण पत्र';
      this.moduleDescEn = 'Utilization Certificate (UC) entry & Completion Certificate verification';
      this.moduleDescHi = 'उपयोगिता प्रमाण पत्र (UC) एवं कार्य पूर्णता प्रमाण पत्र (CC) प्रविष्टि';
    } else if (lowerUrl.includes('mb-entry') || lowerUrl.includes('transaction')) {
      this.moduleTitleEn = 'Measurement Book (MB) Digital Register';
      this.moduleTitleHi = 'डिजिटल मापन पुस्तिका (M.B. Entry) रजिस्टर';
      this.moduleDescEn = 'Measurement Book (MB) digital recording & junior engineer sign-off';
      this.moduleDescHi = 'डिजिटल मापन पुस्तिका (MB) प्रविष्टि एवं कनिष्ठ अभियंता सत्यापन';
    } else if (lowerUrl.includes('inspection') || lowerUrl.includes('audit')) {
      this.moduleTitleEn = 'Inspection & Quality Audit Register';
      this.moduleTitleHi = 'निरीक्षण एवं गुणवत्ता ऑडिट (Inspection & Audit)';
      this.moduleDescEn = 'Quality control inspection reports, social audit & compliance';
      this.moduleDescHi = 'गुणवत्ता नियंत्रण निरीक्षण, सामाजिक अंकेक्षण एवं अनुपालन रिपोर्ट';
    } else if (lowerUrl.includes('asset')) {
      this.moduleTitleEn = 'Asset Registration & Geo-Updation';
      this.moduleTitleHi = 'परिसंपत्ति पंजीकरण एवं अद्यतन (Asset Register)';
      this.moduleDescEn = 'National asset registry entry, geo-coordinates & updation';
      this.moduleDescHi = 'सरकारी परिसंपत्ति रजिस्टर में पंजीकरण एवं जीआईएस निर्देश अद्यतन';
    } else if (lowerUrl.includes('adjustment')) {
      this.moduleTitleEn = 'Financial Adjustment & Reconciliation';
      this.moduleTitleHi = 'वित्तीय समायोजन एवं समाधान (Adjustment)';
      this.moduleDescEn = 'Financial reconciliation, expenditure adjustments & ledger balancing';
      this.moduleDescHi = 'वित्तीय समायोजन, व्यय समाधान एवं खाता बही संतुलन प्रविष्टि';
    } else if (lowerUrl.includes('payment') || lowerUrl.includes('billing')) {
      this.moduleTitleEn = 'Payment DBT & Final Billing Register';
      this.moduleTitleHi = 'भुगतान (Payment) एवं बिलिंग वाउचर रजिस्टर';
      this.moduleDescEn = 'Direct Benefit Transfer (DBT), contractor bills & Treasury release';
      this.moduleDescHi = 'सीधे बैंक खाते में भुगतान (DBT), संवेदक बिल एवं कोषालय भुगतान';
    } else if (lowerUrl.includes('master')) {
      this.moduleTitleEn = 'Master Management & Configuration';
      this.moduleTitleHi = 'मास्टर प्रबंधन एवं कॉन्फ़िगरेशन (Master Directory)';
      this.moduleDescEn = 'Scheme master parameters, district directory & MLA mapping';
      this.moduleDescHi = 'योजना मास्टर, जिला एवं ब्लॉक निर्देशिका, विधायक क्षेत्र मैपिंग';
    } else if (lowerUrl.includes('reports')) {
      this.moduleTitleEn = 'Reports & Analytics Repository';
      this.moduleTitleHi = 'रिपोर्ट्स एवं विश्लेषण (Reports Repository)';
      this.moduleDescEn = 'Physical progress summary, incomplete works register, MP/MLA LAD';
      this.moduleDescHi = 'भौतिक प्रगति सारांश, अपूर्ण कार्य रजिस्टर, विधायक एवं सांसद निधि';
    } else if (lowerUrl.includes('admin')) {
      const pageId = lowerUrl.split('/').pop() || '';
      this.moduleKey = pageId;
      if (pageId === 'menu-creation') {
        this.moduleTitleEn = 'Menu Creation & Ordering';
        this.moduleTitleHi = 'नया मेनू निर्माण एवं क्रम निर्धारण';
        this.moduleDescEn = 'Configure main menus, parent directories, and sub-menus for e-Work system';
        this.moduleDescHi = 'ई-वर्क सिस्टम के लिए मुख्य मेनू, पैरेंट निर्देशिका और उप-मेनू कॉन्फ़िगर करें';
      } else if (pageId === 'create-user') {
        this.moduleTitleEn = 'Create User Account';
        this.moduleTitleHi = 'नया उपयोगकर्ता खाता बनाएं';
        this.moduleDescEn = 'Register new departmental user accounts and define login profiles';
        this.moduleDescHi = 'विभाग के नए उपयोगकर्ता खाते पंजीकृत करें और लॉगिन प्रोफाइल परिभाषित करें';
      } else if (pageId === 'clear-session') {
        this.moduleTitleEn = 'Clear Active Sessions';
        this.moduleTitleHi = 'सक्रिय उपयोगकर्ता सत्र खाली करें';
        this.moduleDescEn = 'Monitor active user login logs and force-clear inactive sessions';
        this.moduleDescHi = 'सक्रिय उपयोगकर्ता लॉगिन लॉग की निगरानी करें और निष्क्रिय सत्रों को बलपूर्वक साफ़ करें';
      } else if (pageId === 'create-role') {
        this.moduleTitleEn = 'Create Role & Assign Rights';
        this.moduleTitleHi = 'भूमिका निर्माण एवं अधिकार आवंटन';
        this.moduleDescEn = 'Define custom system roles and map user rights across modules';
        this.moduleDescHi = 'कस्टम सिस्टम भूमिकाएं परिभाषित करें और मॉड्यूल के अधिकारों का मैपिंग करें';
      } else if (pageId === 'change-password') {
        this.moduleTitleEn = 'Change Account Password';
        this.moduleTitleHi = 'खाता पासवर्ड बदलें (Change Password)';
        this.moduleDescEn = 'Update your secure portal access credentials';
        this.moduleDescHi = 'सुरक्षित पोर्टल लॉगिन क्रेडेंशियल अपडेट करें';
      } else if (pageId === 'sso-deactivate') {
        this.moduleTitleEn = 'SSO ID Deactivation Panel';
        this.moduleTitleHi = 'एसएसओ आईडी निष्क्रियकरण पोर्टल';
        this.moduleDescEn = 'Temporarily or permanently deactivate SSO accounts for employees';
        this.moduleDescHi = 'कर्मचारियों के लिए एसएसओ खातों को अस्थायी या स्थायी रूप से निष्क्रिय करें';
      } else if (pageId === 'reset-password') {
        this.moduleTitleEn = 'Reset User Password';
        this.moduleTitleHi = 'उपयोगकर्ता पासवर्ड रीसेट पैनल';
        this.moduleDescEn = 'Override and reset security passwords for department personnel';
        this.moduleDescHi = 'विभाग के कर्मियों के सुरक्षा पासवर्ड को रीसेट करें';
      } else if (pageId === 'user-deactivate') {
        this.moduleTitleEn = 'User Deactivation Panel';
        this.moduleTitleHi = 'उपयोगकर्ता निष्क्रियकरण सूची';
        this.moduleDescEn = 'Disable user accounts and restrict system authorization';
        this.moduleDescHi = 'उपयोगकर्ता खातों को अक्षम करें और सिस्टम विशेषाधिकार प्रतिबंधित करें';
      } else if (pageId === 'mla-mapping') {
        this.moduleTitleEn = 'MLA User SSO Mapping';
        this.moduleTitleHi = 'विधायक उपयोगकर्ता एसएसओ मैपिंग';
        this.moduleDescEn = 'Map MLA constituency profiles with valid SSO ID credentials';
        this.moduleDescHi = 'वैध एसएसओ आईडी क्रेडेंशियल के साथ विधायक क्षेत्र प्रोफाइल का मिलान करें';
      } else if (pageId === 'switch-user') {
        this.moduleTitleEn = 'Switch User Session';
        this.moduleTitleHi = 'उपयोगकर्ता सत्र स्विच पैनल';
        this.moduleDescEn = 'Impersonate session logins for troubleshooting system errors';
        this.moduleDescHi = 'सिस्टम त्रुटियों के निवारण के लिए लॉगिन सत्र का अनुकरण करें';
      } else if (pageId === 'fto-cancel') {
        this.moduleTitleEn = 'Approve FTO Cancel Request';
        this.moduleTitleHi = 'FTO रद्द अनुरोध स्वीकृति';
        this.moduleDescEn = 'Authorize fund transfer order cancellation petitions';
        this.moduleDescHi = 'फंड ट्रांसफर ऑर्डर (FTO) रद्द करने के अनुरोधों को स्वीकृत करें';
      } else {
        this.moduleTitleEn = 'Administrator System Control Panel';
        this.moduleTitleHi = 'एडमिनिस्ट्रेटर सिस्टम नियंत्रण पोर्टल';
        this.moduleDescEn = 'User access & permissions, district login activity logs, settings';
        this.moduleDescHi = 'उपयोगकर्ता अधिकार प्रबंधन, जिला लॉग इन गतिविधि, सिस्टम पैरामीटर';
      }
    } else if (lowerUrl.includes('help') || lowerUrl.includes('problem')) {
      this.moduleTitleEn = 'e-Work 2.0 Helpdesk & Technical Support';
      this.moduleTitleHi = 'ई-वर्क 2.0 सहायता केंद्र एवं समस्या निवारण';
      this.moduleDescEn = 'User manuals, Standard Operating Procedures & technical ticketing';
      this.moduleDescHi = 'ई-वर्क 2.0 यूजर मैनुअल, मानक संचालन प्रक्रिया एवं तकनीकी सहायता टिकट';
    } else if (lowerUrl.includes('mpk')) {
      this.moduleTitleEn = 'Mahatma Gandhi Panchayat Kendra (MPK)';
      this.moduleTitleHi = 'महात्मा गांधी पंचायत केंद्र (MPK) पोर्टल';
      this.moduleDescEn = 'MPK Kendra infrastructure management & inspection portal';
      this.moduleDescHi = 'महात्मा गांधी पंचायत केंद्र एवं आधारभूत संरचना निरीक्षण';
    } else {
      this.moduleTitleEn = 'Work Management Module Workspace';
      this.moduleTitleHi = 'कार्य एवं वित्तीय प्रबंधन मॉड्यूल';
      this.moduleDescEn = 'Integrated Departmental Work Execution & Monitoring Workspace';
      this.moduleDescHi = 'ग्रामीण विकास एवं पंचायती राज विभाग - एकीकृत कार्य प्रबंधन डैशबोर्ड';
    }
  }

  get isAdminPage(): boolean {
    return this.router.url.includes('/admin/');
  }

  backToHub(): void {
    this.router.navigate(['/portal/hub']);
  }
}
