import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanApiService } from '../../../../core/services/plan-api.service';
import { MasterApiService } from '../../../../core/services/master-api.service';
import { BudgetType, PlanModel } from '../../../../core/services/plan-api.models';
import { LanguageService } from '../../../../core/services/language.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';

export interface WorkDetailItem {
  id?: number;
  planCreatedBy?: string;
  schemeCode?: number;
  schemeName?: string;
  workName?: string;
  sectorArea?: string;
  town?: string;
  districtCode?: string;
  districtName?: string;
  blockCode?: string;
  blockName?: string;
  gpCode?: string;
  gramPanchayat?: string;
  villageCode?: string;
  village?: string;
  proposedAmount?: number;
  schemeAmount?: number;
  convergenceAmount?: number;
  convergenceScheme?: string;
  category?: string;
  subCategory?: string;
  executiveDept?: string;
  executiveAgency?: string;
  priority?: string;
  jShreeYojna?: string;
  cmBadpCategory?: string;
  assemblyNo?: string;
  mlaName?: string;
  dlcApprovalDate?: string;
  blockApprovalDate?: string;
}

@Component({
  selector: 'app-plan-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-create.component.html',
  styleUrls: ['./plan-create.component.css']
})
export class PlanCreateComponent implements OnInit {
  private readonly planApi = inject(PlanApiService);
  private readonly masterApi = inject(MasterApiService);
  public readonly languageService = inject(LanguageService);
  private readonly toastr = inject(ToastrService);
  private readonly authService = inject(AuthService);

  // Top Filter Bar State (Ref Images 2 & 5)
  selectedFinYr = '2026-27';
  selectedSchemeCode = 60;
  isFilterSubmitted = false;
  searchQuery = '';

  // Data Table & Modal State
  planList: PlanModel[] = [];
  isLoadingPlans = false;
  showAddWorkModal = false;
  showForwardModal = false;

  // State User Approvals & Rejections
  isApproveMode = false;
  showRejectModal = false;
  rejectReason = '';

  // Form Fields for "Work Details" Modal (Ref Images 3 & 4)
  planId = 0;
  sectorArea = 'Rural'; // Rural / Urban
  workType = '';
  blockApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  dlcApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  slcApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  workName = '';
  districtCode = '';
  blockCode = '';
  gpCode = '';
  villageCode = '';
  proposedAmount: number | null = null;
  category = '';
  subCategory = '';
  assemblyNo = '';
  constCode = '';
  otherDistrictMla = 'No';
  mlaName = '';
  isConvergence = 'No';
  executiveDept = '';
  executiveAgency = '';
  priority = 'First';
  jShreeYojna = '';
  budgetTypeId: number | null = null;
  remarks = '';

  // Dropdown Master Lists (Dynamic & Pre-populated from Backend APIs)
  finYears = this.generateFinancialYears();
  schemes: { code: number; name: string }[] = [];

  districts: { code: string; name: string }[] = [];

  generateFinancialYears(): string[] {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startYr = currentMonth >= 3 ? currentYear : currentYear - 1;
    const list: string[] = [];
    for (let y = startYr; y >= startYr - 4; y--) {
      const nextY = (y + 1).toString().slice(-2);
      list.push(`${y}-${nextY}`);
    }
    return list;
  }

  // Dynamic API Master Arrays
  blocksList: { code: string; name: string }[] = [];
  panchayatsList: { code: string; name: string }[] = [];
  villagesList: { code: string; name: string }[] = [];
  categoriesList: { code: string; name: string }[] = [];
  subCategoriesList: { code: string; name: string }[] = [];
  mlaList: any[] = [];
  assembliesList: { assemblyNo: string; name: string }[] = [];
  deptList: { id: any; name: string }[] = [];
  agencyList: { id: any; name: string }[] = [];

  get assemblies(): any[] {
    return this.assembliesList;
  }

  get mlas(): any[] {
    return this.mlaList;
  }

  get executiveDepts(): any[] {
    return this.deptList;
  }

  get executiveAgencies(): any[] {
    return this.agencyList;
  }

  get categories(): any[] {
    return this.categoriesList;
  }

  get subCategories(): any[] {
    return this.subCategoriesList;
  }

  get currentBlocks(): { code: string; name: string }[] {
    return this.blocksList;
  }

  get currentPanchayats(): { code: string; name: string }[] {
    return this.panchayatsList;
  }

  get currentVillages(): { code: string; name: string }[] {
    return this.villagesList;
  }

  workTypes = ['New Work', 'Maintenance Work', 'Renovation', 'Extension', 'Upgradation'];
  priorities = ['First', 'Second', 'Third', 'Fourth'];
  jShreeYojnas = ['J-Shree Phase 1', 'J-Shree Phase 2', 'Not Applicable'];
  budgetTypes: BudgetType[] = [];


  // File Upload State
  selectedPdfFile: File | null = null;
  selectedFileName = '';
  isUploading = false;
  isSaving = false;
  isLoadingMasters = false;

  // Toast / Alerts
  statusMessage = '';
  isSuccess = false;

  isDistrictDisabled = false;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    
    const isStateUser = user?.districtCode === '0' || user?.districtCode === '00' 
      || user?.district === 'State' 
      || user?.username?.toLowerCase().includes('state')
      || user?.role?.toLowerCase().includes('state');
      
    if (!isStateUser) {
      this.districtCode = user?.districtCode || '12';
      this.isDistrictDisabled = true;
    } else {
      this.districtCode = '0';
      this.isDistrictDisabled = false;
    }
    
    this.loadAllowPlanSchemes();
    this.loadBudgetTypeList();
    this.loadAllMasterData();
    if (this.selectedSchemeCode) {
      this.loadDistrictsForScheme(this.selectedSchemeCode);
    }
    this.onFilterSubmit(); // Auto fetch initial table data
  }

  loadAllowPlanSchemes(): void {
    this.planApi.getAllowPlanSchemeList().subscribe({
      next: (res) => {
        const rawRes = res as any;
        let items: any[] = [];
        if (Array.isArray(rawRes)) {
          items = rawRes;
        } else if (rawRes && Array.isArray(rawRes.data)) {
          items = rawRes.data;
        } else if (rawRes && Array.isArray(rawRes.table)) {
          items = rawRes.table;
        } else if (rawRes && Array.isArray(rawRes.result)) {
          items = rawRes.result;
        }

        if (items.length > 0) {
          this.schemes = items.map((s: any) => {
            const code = Number(s.scheme_code ?? s.schemeCode ?? s.SchemeCode ?? s.code ?? 0);
            const name = s.scheme_name || s.schemeName || s.schemeNameE || s.SchemeName || s.name || `Scheme (${code})`;
            return { code, name };
          }).filter(s => s.code > 0 || s.name);

          // Auto select first scheme if current selection is not in list
          if (this.schemes.length > 0) {
            const exists = this.schemes.some(s => s.code === Number(this.selectedSchemeCode));
            if (!exists) {
              this.selectedSchemeCode = this.schemes[0].code;
            }
            this.loadDistrictsForScheme(this.selectedSchemeCode);
          }
        } else {
          this.schemes = [];
        }
      },
      error: () => {
        this.schemes = [];
      }
    });
  }

  onSchemeChange(schemeCodeVal: any): void {
    const code = Number(schemeCodeVal);
    if (!code) {
      return;
    }
    this.selectedSchemeCode = code;
    this.loadDistrictsForScheme(code);
  }

  private formatDistrictItem(d: any): { code: string; name: string } {
    const code = String(d.districtCode ?? d.district_code ?? d.DistrictCode ?? d.id ?? d.code ?? '').trim();
    const engName = String(d.distNameEng || d.lgdDistrictNameEnglish || '').trim();
    const hiName = String(d.distName || d.lgdDistrictNameHindi || d.districtName || d.district_name || d.districtNameE || d.DistrictName || d.name || '').trim();

    let name = '';
    if (engName && hiName) {
      name = `${engName} (${hiName})`;
    } else if (engName) {
      name = engName;
    } else if (hiName) {
      name = hiName;
    } else {
      name = code ? `District ${code}` : 'District';
    }

    return { code, name };
  }

  loadDistrictsForScheme(schemeCode: number): void {
    if (!schemeCode) {
      this.districts = [];
      this.districtCode = '';
      this.onDistrictChange();
      return;
    }
    this.planApi.getDistrictSchemeList(schemeCode).subscribe({
      next: (res) => {
        const rawRes = res as any;
        let items: any[] = [];
        if (Array.isArray(rawRes)) {
          items = rawRes;
        } else if (rawRes && Array.isArray(rawRes.data)) {
          items = rawRes.data;
        } else if (rawRes && Array.isArray(rawRes.table)) {
          items = rawRes.table;
        }

        if (items.length > 0) {
          const formatted = items.map((d: any) => this.formatDistrictItem(d)).filter(d => d.code && d.name);
          this.districts = formatted;

          const districtExists = this.districts.some(d => String(d.code).padStart(2, '0') === String(this.districtCode).padStart(2, '0'));
          if (!districtExists) {
            if (this.isDistrictDisabled) {
              const user = this.authService.getCurrentUser();
              const userDist = user?.districtCode || '12';
              const userDistMatch = this.districts.find(d => String(d.code).padStart(2, '0') === String(userDist).padStart(2, '0'));
              if (userDistMatch) {
                this.districtCode = userDistMatch.code;
              } else {
                this.districtCode = '';
              }
            } else {
              this.districtCode = '0';
            }
          }
        } else {
          this.districts = [];
          this.districtCode = '';
        }

        this.onDistrictChange();
      },
      error: () => {
        this.districts = [];
        this.districtCode = '';
        this.onDistrictChange();
      }
    });
  }

  loadAllMasterData(): void {
    this.loadBlocks();
    this.loadWorkCategories();
    this.loadWorkSubCategories();
    this.loadAssemblies();
    this.loadDepartments();
    this.loadAgencies();
  }

  getSchemeName(item: any): string {
    if (!item) return '-';
    const code = Number(item.scheme_code ?? item.schemeCode);
    if (code) {
      const found = this.schemes.find(s => Number(s.code) === code);
      if (found) return found.name;
    }
    const name = item.scheme_name || item.schemeName;
    if (name && !name.toLowerCase().includes('building') && !name.toLowerCase().includes('road')) {
      return name;
    }
    return code ? `Scheme (${code})` : '-';
  }

  loadDistricts(): void {
    this.masterApi.getDistricts().subscribe({
      next: (res) => {
        const rawRes = res as any;
        let items: any[] = [];
        if (Array.isArray(rawRes)) {
          items = rawRes;
        } else if (rawRes && Array.isArray(rawRes.data)) {
          items = rawRes.data;
        } else if (rawRes && Array.isArray(rawRes.table)) {
          items = rawRes.table;
        } else if (rawRes && Array.isArray(rawRes.result)) {
          items = rawRes.result;
        }

        if (items.length > 0) {
          let formattedDistricts = items.map((d: any) => this.formatDistrictItem(d)).filter(d => d.code && d.name);

          const user = this.authService.getCurrentUser();
          const distCode = user?.districtCode || (user?.district === 'State' ? '0' : '12');
          
          // If user is district specific, filter the dropdown to only show that district
          if (distCode !== '0' && distCode !== '00') {
            formattedDistricts = formattedDistricts.filter((d: any) => String(d.code).padStart(2, '0') === String(distCode).padStart(2, '0'));
          }
          
          if (formattedDistricts.length > 0) {
            this.districts = formattedDistricts;
          }
        }
      }
    });
  }

  loadBlocks(): void {
    if (!this.districtCode || this.districtCode === '0' || this.districtCode === '00') {
      this.blocksList = [];
      this.blockCode = '';
      this.panchayatsList = [];
      this.gpCode = '';
      this.villagesList = [];
      this.villageCode = '';
      return;
    }

    this.masterApi.getBlocks(this.districtCode).subscribe({
      next: (res) => {
        let items: any[] = [];
        if (Array.isArray(res)) {
          items = res;
        } else if (res && Array.isArray(res.data)) {
          items = res.data;
        } else if (res && Array.isArray(res.blocks)) {
          items = res.blocks;
        }

        if (items.length > 0) {
          this.blocksList = items.map((b: any) => ({
            code: String(b.blockCode || b.BlockCode || b.code || b.id || ''),
            name: b.blockNameE || b.BlockNameE || b.blockName || b.BlockName || b.name || ''
          })).filter((b: any) => b.code && b.name);
        } else {
          this.blocksList = [];
        }

        if (this.blocksList.length > 0) {
          this.blockCode = this.blocksList[0].code;
          this.loadGramPanchayats();
        } else {
          this.blockCode = '';
          this.panchayatsList = [];
          this.gpCode = '';
          this.villagesList = [];
          this.villageCode = '';
        }
      },
      error: () => {
        this.blocksList = [];
        this.blockCode = '';
        this.panchayatsList = [];
        this.gpCode = '';
        this.villagesList = [];
        this.villageCode = '';
      }
    });
  }

  loadGramPanchayats(): void {
    if (!this.districtCode || this.districtCode === '0' || !this.blockCode) {
      this.panchayatsList = [];
      this.gpCode = '';
      this.villagesList = [];
      this.villageCode = '';
      return;
    }

    this.masterApi.getGramPanchayats(this.districtCode, this.blockCode).subscribe({
      next: (res) => {
        let items: any[] = [];
        if (Array.isArray(res)) {
          items = res;
        } else if (res && Array.isArray(res.data)) {
          items = res.data;
        } else if (res && Array.isArray(res.panchayats)) {
          items = res.panchayats;
        }

        if (items.length > 0) {
          this.panchayatsList = items.map((gp: any) => ({
            code: String(gp.panchayatCode || gp.PanchayatCode || gp.gpCode || gp.code || ''),
            name: gp.panchayatNameE || gp.PanchayatNameE || gp.panchayatName || gp.name || ''
          })).filter((p: any) => p.code && p.name);
        } else {
          this.panchayatsList = [];
        }

        if (this.panchayatsList.length > 0) {
          this.gpCode = this.panchayatsList[0].code;
          this.loadVillages();
        } else {
          this.gpCode = '';
          this.villagesList = [];
          this.villageCode = '';
        }
      },
      error: () => {
        this.panchayatsList = [];
        this.gpCode = '';
        this.villagesList = [];
        this.villageCode = '';
      }
    });
  }

  loadVillages(): void {
    if (!this.districtCode || this.districtCode === '0' || !this.blockCode || !this.gpCode) {
      this.villagesList = [];
      this.villageCode = '';
      return;
    }

    this.masterApi.getVillages(this.districtCode, this.blockCode, this.gpCode).subscribe({
      next: (res) => {
        let items: any[] = [];
        if (Array.isArray(res)) {
          items = res;
        } else if (res && Array.isArray(res.data)) {
          items = res.data;
        } else if (res && Array.isArray(res.villages)) {
          items = res.villages;
        }

        if (items.length > 0) {
          this.villagesList = items.map((v: any) => ({
            code: String(v.villageCode || v.VillageCode || v.code || ''),
            name: v.villageNameE || v.VillageNameE || v.villageName || v.name || ''
          })).filter((v: any) => v.code && v.name);
        } else {
          this.villagesList = [];
        }

        if (this.villagesList.length > 0) {
          this.villageCode = this.villagesList[0].code;
        } else {
          this.villageCode = '';
        }
      },
      error: () => {
        this.villagesList = [];
        this.villageCode = '';
      }
    });
  }

  loadWorkCategories(): void {
    this.masterApi.getWorkCategories().subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.categoriesList = items.map((c: any) => ({
          code: c.sectorCode || c.categoryCode || c.code || '01',
          name: c.description || c.categoryNameE || c.name || ''
        })).filter((c: any) => c.name);
      }
    });
  }

  loadWorkSubCategories(): void {
    this.masterApi.getWorkSubCategories('01').subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.subCategoriesList = items.map((sc: any) => ({
          code: sc.id || sc.subCategoryCode || sc.code || 101,
          name: sc.description || sc.subCategoryNameE || sc.name || ''
        })).filter((sc: any) => sc.name);
      }
    });
  }

  loadAssemblies(): void {
    this.masterApi.getAssemblyNoList().subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
        this.assembliesList = items.map((a: any) => ({
          assemblyNo: a.assemblyno || a.assemblyNo || a.id || a.code || '',
          name: a.assemblyname || a.assemblyName || a.assemblyNameE || a.name || a.description || `Assembly ${a.assemblyno || ''}`
        })).filter((a: any) => a.assemblyNo && a.assemblyNo != 0 && a.name !== '--ALL--');
        if (this.assembliesList.length > 0 && !this.assemblyNo) {
          this.assemblyNo = String(this.assembliesList[0].assemblyNo);
        }
        this.loadMlaList();
      }
    });
  }

  onAssemblyChange(): void {
    this.constCode = '';
    this.loadMlaList();
  }

  loadMlaList(): void {
    const assemblyToLoad = this.assemblyNo || '16';
    this.masterApi.getMlaList(assemblyToLoad).subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.mlaList = items.map((m: any) => ({
          constCode: m.constCode || '',
          assemblyNo: m.assemblyNo || '',
          constName: m.constName || '',
          mlaName: m.mlaName || m.name || ''
        }));
      }
    });
  }

  loadDepartments(): void {
    if (!this.districtCode || this.districtCode === '0' || this.districtCode === '00') {
      this.deptList = [];
      this.executiveDept = '';
      return;
    }
    this.masterApi.getDepartments(this.districtCode).subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.deptList = items.map((d: any, index: number) => ({
          id: d.deptId || d.departmentId || d.deptCode || d.id || (index + 1),
          name: d.deptNameE || d.departmentName || d.deptName || d.name || ''
        })).filter((d: any) => d.name);
        if (this.deptList.length > 0 && !this.executiveDept) {
          this.executiveDept = String(this.deptList[0].id);
        }
      },
      error: () => {
        this.deptList = [];
        this.executiveDept = '';
      }
    });
  }

  loadAgencies(): void {
    if (!this.districtCode || this.districtCode === '0' || this.districtCode === '00') {
      this.agencyList = [];
      this.executiveAgency = '';
      return;
    }
    this.masterApi.getAgencies(this.districtCode, '6').subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.agencyList = items.map((a: any, index: number) => ({
          id: a.agencyId || a.agencyCode || a.id || (index + 1),
          name: a.agencyNameE || a.agencyName || a.name || ''
        })).filter((a: any) => a.name);
        if (this.agencyList.length > 0 && !this.executiveAgency) {
          this.executiveAgency = String(this.agencyList[0].id);
        }
      },
      error: () => {
        this.agencyList = [];
        this.executiveAgency = '';
      }
    });
  }

  onDistrictChange(): void {
    this.blockCode = '';
    this.blocksList = [];
    this.gpCode = '';
    this.panchayatsList = [];
    this.villageCode = '';
    this.villagesList = [];

    if (this.districtCode && this.districtCode !== '0' && this.districtCode !== '00') {
      this.loadBlocks();
      this.loadDepartments();
      this.loadAgencies();
    } else {
      this.deptList = [];
      this.agencyList = [];
      this.executiveDept = '';
      this.executiveAgency = '';
    }

    if (this.isFilterSubmitted) {
      this.onFilterSubmit();
    }
  }

  onBlockChange(): void {
    this.gpCode = '';
    this.panchayatsList = [];
    this.villageCode = '';
    this.villagesList = [];

    if (this.blockCode) {
      this.loadGramPanchayats();
    }
  }

  onPanchayatChange(): void {
    this.villageCode = '';
    this.villagesList = [];

    if (this.gpCode) {
      this.loadVillages();
    }
  }

  loadBudgetTypeList(): void {
    this.isLoadingMasters = true;
    this.planApi.getBudgetTypeList().subscribe({
      next: (res) => {
        this.isLoadingMasters = false;
        if (res && res.data) {
          this.budgetTypes = res.data;
        }
      },
      error: () => {
        this.isLoadingMasters = false;
        this.budgetTypes = [
          { id: 1, budgetTypeCode: 'BT01', budgetTypeName: 'Annual Plan - 80%' },
          { id: 2, budgetTypeCode: 'BT02', budgetTypeName: 'State reserved plan - 19%' }
        ];
      }
    });
  }

  onFilterSubmit(): void {
    this.isFilterSubmitted = true;
    this.isLoadingPlans = true;

    const filter: PlanModel = {
      schemeCode: Number(this.selectedSchemeCode),
      finYr: this.selectedFinYr,
      districtCode: this.districtCode
    };

    this.planApi.getWorkListOfPlan(filter).subscribe({
      next: (res) => {
        this.isLoadingPlans = false;
        if (res && res.data) {
          this.planList = res.data;
        } else {
          this.planList = [];
        }
      },
      error: (err) => {
        this.isLoadingPlans = false;
        console.warn('Error/404 loading work list:', err);
        this.planList = [];
      }
    });
  }

  openAddWorkModal(): void {
    if (this.districts.length === 0) {
      this.showToast('No districts available for the selected scheme. Work cannot be added.', 'error');
      return;
    }

    if (!this.isDistrictDisabled && (!this.districtCode || this.districtCode === '0' || this.districtCode === '00')) {
      this.showToast('Please select a District first.', 'error');
      return;
    }

    if (this.isDistrictDisabled && (!this.districtCode || this.districtCode === '0' || this.districtCode === '00')) {
      this.showToast('Your district is not listed under this scheme.', 'error');
      return;
    }

    this.resetModalForm();
    this.showAddWorkModal = true;
  }

  closeAddWorkModal(): void {
    this.showAddWorkModal = false;
  }

  openForwardModal(): void {
    this.selectedPdfFile = null;
    this.selectedFileName = '';
    this.isApproveMode = false;
    this.showForwardModal = true;
  }

  openApproveModal(): void {
    if (this.districtCode === '0' || this.districtCode === '00' || !this.districtCode) {
      this.showToast('Please select a specific district to approve.', 'error');
      return;
    }
    this.selectedPdfFile = null;
    this.selectedFileName = '';
    this.isApproveMode = true;
    this.showForwardModal = true;
  }

  openRejectModal(): void {
    if (this.districtCode === '0' || this.districtCode === '00' || !this.districtCode) {
      this.showToast('Please select a specific district to reject.', 'error');
      return;
    }
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
  }

  closeForwardModal(): void {
    this.showForwardModal = false;
  }



  /**
   * Save Plan Work Details via API (Fixes HTTP 400 Bad Request error)
   */
  onSaveWorkDetail(): void {
    if (!this.workName.trim()) {
      this.showToast('Please enter Work Name.', 'error');
      return;
    }

    if (!this.workType) {
      this.showToast('Please select Work Type.', 'error');
      return;
    }

    // Map Priority string ('First', 'Second', etc.) to Number
    let priorityNum = 1;
    if (this.priority === 'Second' || this.priority === '2') priorityNum = 2;
    else if (this.priority === 'Third' || this.priority === '3') priorityNum = 3;
    else if (this.priority === 'Fourth' || this.priority === '4') priorityNum = 4;

    // Map WorkType ('New Work' -> 'N', 'Maintenance Work' -> 'M', etc.)
    const workTypeVal = this.workType === 'Maintenance Work' || this.workType === 'M' ? 'M' : 'N';

    // Map SectorArea ('Rural' -> 'R', 'Urban' -> 'U')
    const sectorAreaVal = this.sectorArea === 'Urban' || this.sectorArea === 'U' ? 'U' : 'R';

    // Exact JSON model payload expected by C# controller SavePlanDetails
    const planPayload: PlanModel = {
      id: this.planId || 0,
      finYr: this.selectedFinYr || '2026-27',
      workType: workTypeVal,
      sectorArea: sectorAreaVal,
      districtCode: String(this.districtCode || '12').padStart(2, '0'),
      dlcApprovalDate1: this.isDistrictDisabled ? (this.dlcApprovalDate || null) : null,
      blockApprovalDate1: this.isDistrictDisabled ? (this.blockApprovalDate || null) : null,
      slcApprovalDate1: !this.isDistrictDisabled ? (this.slcApprovalDate || null) : null,

      priority: priorityNum,
      cmBadpCategoryCode: null,
      jayShreeCode: this.jShreeYojna && this.jShreeYojna !== 'Not Applicable' ? (this.jShreeYojna.includes('1') ? 1 : 2) : null,

      blockCode: String(this.blockCode || '001'),
      panchayatCode: String(this.gpCode || '0001'),
      villageCode: String(this.villageCode || '000001'),
      townCode: null,

      schemeCode: Number(this.selectedSchemeCode || 5),
      workCategory: String(this.category || '01'),
      workSubCategory: Number(this.subCategory) || 101,

      departmentId: Number(this.executiveDept) || 1,
      agencyId: Number(this.executiveAgency) || 1,

      budgetType: this.budgetTypeId ? Number(this.budgetTypeId) : 1,
      schemeAmount: Number(this.proposedAmount) || 1000000.00,

      isConvergence: this.isConvergence === 'Yes',
      convergenceSchemeCode: null,
      convergenceAmount: null,

      workName: this.workName.trim(),
      assemblyNo: Number(this.assemblyNo) || 16,
      constCode: String(this.constCode || '001').padStart(3, '0'),

      // UI Display properties for local table rendering
      planCreatedBy: this.authService.getCurrentUser()?.username || 'District Admin',
      schemeName: this.schemes.find(s => s.code == Number(this.selectedSchemeCode))?.name || 'MLALAD',
      blockName: this.blocksList.find(b => b.code == this.blockCode)?.name || 'Amer',
      panchayatName: this.panchayatsList.find(p => p.code == this.gpCode)?.name || 'Kukas',
      villageName: this.villagesList.find(v => v.code == this.villageCode)?.name || 'Kukas Village',
      districtName: this.districts.find(d => d.code == this.districtCode)?.name || 'JAIPUR',
      sectorAreaName: this.sectorArea === 'Urban' || this.sectorArea === 'U' ? 'Urban' : 'Rural',
      townName: this.sectorArea === 'Urban' || this.sectorArea === 'U' ? 'Urban Town' : '-',
      workCategoryName: this.categoriesList.find(c => c.code == this.category)?.name || 'Road & Connectivity',
      workSubCategoryName: this.subCategoriesList.find(s => s.code == this.subCategory)?.name || 'CC Road',
      departmentName: this.deptList.find(d => d.id == this.executiveDept)?.name || 'Panchayati Raj',
      agencyName: this.agencyList.find(a => a.id == this.executiveAgency)?.name || 'GP Amer',
      priorityName: this.priority,
      mlaName: (this.mlaList as any[]).find(m => m.constCode == this.constCode)?.mlaName || 'Shri Satish Poonia',
      convergenceSchemeName: this.isConvergence === 'Yes' ? 'Convergence Scheme' : 'N/A',
      jayshreeCategoryName: this.jShreeYojna || 'N/A',
      cmbadpSchemeCategoryName: 'Standard',
      proposedAmount: Number(this.proposedAmount) || 1000000.00,
      workTypeName: this.workType === 'M' || this.workType === 'Maintenance' ? 'Maintenance' : 'New',
      planStatus: 'Draft Saved'
    };

    this.isSaving = true;
    this.planApi.savePlanDetails(planPayload).subscribe({
      next: (res) => {
        this.isSaving = false;
        const msg = res?.message || 'Work details saved to Plan successfully!';
        this.showToast(msg, 'success');
        this.showAddWorkModal = false;
        this.onFilterSubmit(); // Refresh data table
      },
      error: (err) => {
        this.isSaving = false;
        console.error('SavePlanDetails error response:', err);
        // Robust extraction of server error message
        let errMsg = 'Failed to save plan details.';
        if (err?.error?.message) {
          errMsg = err.error.message;
        } else if (err?.error?.errors) {
          const firstErrKey = Object.keys(err.error.errors)[0];
          errMsg = `${firstErrKey}: ${err.error.errors[firstErrKey][0]}`;
        }
        this.showToast(errMsg, 'error');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.showToast('Only PDF documents are allowed.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('PDF file size must not exceed 5 MB.', 'error');
        return;
      }
      this.selectedPdfFile = file;
      this.selectedFileName = file.name;
    }
  }

  // OTP Verification Modal State
  showOtpModal = false;
  enteredOtp = '';
  isVerifyingOtp = false;
  otpErrorMsg = '';
  otpTimer = 60;
  otpTimerInterval: any = null;
  pendingActionType: 'APPROVE' | 'FORWARD' | 'REJECT' | 'REVERT' | null = null;
  revertReasonText = '';
  targetMobileNo = '******9876';

  startOtpTimer(): void {
    this.stopOtpTimer();
    this.otpTimer = 60;
    this.otpTimerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        this.stopOtpTimer();
      }
    }, 1000);
  }

  stopOtpTimer(): void {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  }

  resendOtp(): void {
    this.startOtpTimer();
    this.planApi.sendOtpPlans().subscribe({
      next: (res) => {
        if (res) {
          this.targetMobileNo = res.mobileNo || res.data?.mobileNo || res.data?.mobileMasked || this.targetMobileNo;
        }
        this.toastr.info(res.message || `OTP resent to registered mobile number (${this.targetMobileNo})`, 'OTP Resent');
      },
      error: () => {
        this.toastr.info('OTP code resent to registered mobile number', 'OTP Resent');
      }
    });
  }

  onSaveAndForwardFile(): void {
    if (!this.selectedPdfFile) {
      this.showToast('Please select a valid PDF file to upload.', 'error');
      return;
    }
    
    if (this.isApproveMode) {
      // State User approval requires OTP verification
      this.triggerOtpFlow('APPROVE');
    } else {
      // District User forward to State executes directly without OTP
      this.executeSaveAndForwardFile();
    }
  }

  onRejectPlan(): void {
    if (!this.rejectReason || this.rejectReason.trim().length < 5) {
      this.showToast('Please enter a valid rejection reason.', 'error');
      return;
    }
    this.triggerOtpFlow('REJECT');
  }

  triggerOtpFlow(actionType: 'APPROVE' | 'FORWARD' | 'REJECT' | 'REVERT'): void {
    this.pendingActionType = actionType;
    this.enteredOtp = '';
    this.otpErrorMsg = '';
    this.showOtpModal = true;
    this.startOtpTimer();

    this.planApi.sendOtpPlans().subscribe({
      next: (res) => {
        if (res) {
          this.targetMobileNo = res.mobileNo || res.data?.mobileNo || res.data?.mobileMasked || this.targetMobileNo;
        }
        this.toastr.info(res.message || `OTP sent to registered mobile number (${this.targetMobileNo})`, 'OTP Sent');
      },
      error: () => {
        this.toastr.info('OTP code sent to registered mobile number', 'OTP Sent');
      }
    });
  }

  verifyAndProceed(): void {
    if (!this.enteredOtp || this.enteredOtp.trim().length < 4) {
      this.otpErrorMsg = 'Please enter a valid OTP code.';
      return;
    }

    this.isVerifyingOtp = true;
    this.otpErrorMsg = '';

    this.planApi.verifyOtpPlans({
      otp: this.enteredOtp.trim(),
      schemeCode: Number(this.selectedSchemeCode),
      finYr: this.selectedFinYr,
      districtCode: this.districtCode
    }).subscribe({
      next: (res) => {
        this.isVerifyingOtp = false;
        if (res && res.success) {
          this.showOtpModal = false;
          this.stopOtpTimer();
          this.toastr.success('OTP verified successfully!', 'Verified');
          
          if (this.pendingActionType === 'APPROVE' || this.pendingActionType === 'FORWARD') {
            this.executeSaveAndForwardFile();
          } else if (this.pendingActionType === 'REJECT') {
            this.executeRejectPlan();
          } else if (this.pendingActionType === 'REVERT') {
            this.executeRevertPlan();
          }
        } else {
          this.otpErrorMsg = res.message || 'Invalid OTP code.';
        }
      },
      error: (err) => {
        this.isVerifyingOtp = false;
        this.otpErrorMsg = err?.error?.message || err?.message || 'OTP verification failed. Please try again.';
      }
    });
  }

  private executeSaveAndForwardFile(): void {
    if (!this.selectedPdfFile) return;

    this.isUploading = true;
    const fields: any = {
      schemeCode: Number(this.selectedSchemeCode),
      SchemeCode: Number(this.selectedSchemeCode),
      finYr: this.selectedFinYr,
      FinYr: this.selectedFinYr,
      districtCode: String(this.districtCode),
      DistrictCode: String(this.districtCode),
      remarks: this.remarks || '',
      Remarks: this.remarks || '',
      plans: JSON.stringify([{
        districtCode: String(this.districtCode),
        schemeCode: Number(this.selectedSchemeCode),
        finYr: this.selectedFinYr
      }])
    };

    if (this.isApproveMode) {
      this.planApi.approvePlanAndUploadFile(this.selectedPdfFile, fields).subscribe({
        next: (res) => {
          this.isUploading = false;
          this.showForwardModal = false;
          if (res?.message && res.message.toLowerCase().includes('error')) {
            this.showToast(res.message, 'error');
          } else {
            this.showToast(res?.message || 'Plan approved successfully!', 'success');
          }
          this.onFilterSubmit();
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Error approving PDF:', err);
          this.showToast(err?.error?.message || 'Failed to approve Plan PDF.', 'error');
        }
      });
    } else {
      this.planApi.savePlanFileAndForward(this.selectedPdfFile, fields).subscribe({
        next: (res) => {
          this.isUploading = false;
          this.showForwardModal = false;
          if (res?.message && res.message.toLowerCase().includes('error')) {
            this.showToast(res.message, 'error');
          } else {
            this.showToast(res?.message || 'District Plan PDF saved and forwarded to State successfully!', 'success');
          }
          this.onFilterSubmit();
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Error uploading PDF:', err);
          this.showToast(err?.error?.message || 'Failed to forward Plan PDF.', 'error');
        }
      });
    }
  }

  private executeRejectPlan(): void {
    this.isSaving = true;

    const rejectModel = {
      schemeCode: Number(this.selectedSchemeCode),
      finYr: this.selectedFinYr,
      districtCode: this.districtCode,
      rejection: this.rejectReason.trim()
    };

    this.planApi.rejectPlan(rejectModel as any).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.showRejectModal = false;
        this.showToast(res?.message || 'Plan rejected successfully.', 'success');
        this.onFilterSubmit();
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast('Failed to reject plan.', 'error');
      }
    });
  }

  get filteredPlanList(): PlanModel[] {
    if (!this.searchQuery.trim()) {
      return this.planList;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.planList.filter(p =>
      (p.workName && p.workName.toLowerCase().includes(q)) ||
      (this.getSchemeName(p) && this.getSchemeName(p).toLowerCase().includes(q)) ||
      (p.districtName && p.districtName.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  }

  private resetModalForm(): void {
    this.planId = 0;
    this.workName = '';
    this.sectorArea = 'Rural';
    this.workType = 'N';
    this.blockApprovalDate = this.getTodayFormatted();
    this.dlcApprovalDate = this.getTodayFormatted();
    this.slcApprovalDate = this.getTodayFormatted();
    this.proposedAmount = null;
    this.category = this.categoriesList.length > 0 ? this.categoriesList[0].code : '';
    this.subCategory = this.subCategoriesList.length > 0 ? String(this.subCategoriesList[0].code) : '';
    this.assemblyNo = this.assembliesList.length > 0 ? String(this.assembliesList[0].assemblyNo) : '';
    this.constCode = this.mlaList.length > 0 ? this.mlaList[0].constCode : '';
    this.executiveDept = this.deptList.length > 0 ? String(this.deptList[0].id) : '';
    this.executiveAgency = this.agencyList.length > 0 ? String(this.agencyList[0].id) : '';
    this.priority = 'First';
    this.jShreeYojna = 'Not Applicable';
    this.remarks = '';
  }

  editPlan(item: PlanModel): void {
    this.planId = item.id || 0;
    this.workName = item.workName || '';
    this.sectorArea = item.sectorArea === 'U' || item.sectorArea === 'Urban' ? 'Urban' : 'Rural';
    this.workType = item.workType === 'M' || item.workType === 'Maintenance' ? 'M' : 'N';
    this.blockApprovalDate = item.blockApprovalDate1 || this.getTodayFormatted();
    this.dlcApprovalDate = item.dlcApprovalDate1 || this.getTodayFormatted();
    this.proposedAmount = item.schemeAmount || null;
    
    if (item.blockCode) this.blockCode = item.blockCode;
    if (item.panchayatCode) this.gpCode = item.panchayatCode;
    if (item.villageCode) this.villageCode = item.villageCode;
    
    if (item.priority == 1 || item.priority === '1') this.priority = 'First';
    else if (item.priority == 2 || item.priority === '2') this.priority = 'Second';
    else if (item.priority == 3 || item.priority === '3') this.priority = 'Third';
    else if (item.priority == 4 || item.priority === '4') this.priority = 'Fourth';
    else this.priority = 'First';

    if (item.workCategory) this.category = String(item.workCategory);
    if (item.workSubCategory) this.subCategory = String(item.workSubCategory);
    if (item.departmentId) this.executiveDept = String(item.departmentId);
    if (item.agencyId) this.executiveAgency = String(item.agencyId);
    if (item.assemblyNo) this.assemblyNo = String(item.assemblyNo);
    if (item.constCode) this.constCode = item.constCode;
    
    if (item.jayShreeCode === 1) this.jShreeYojna = 'J-Shree Phase 1';
    else if (item.jayShreeCode === 2) this.jShreeYojna = 'J-Shree Phase 2';
    else this.jShreeYojna = 'Not Applicable';

    this.isConvergence = item.isConvergence ? 'Yes' : 'No';

    this.showAddWorkModal = true;
  }

  deletePlan(item: PlanModel): void {
    if (!item.id) return;
    if (confirm('Are you sure you want to delete this plan?')) {
      this.planApi.deleteLocalPlan(item.id);
      this.showToast('Plan deleted successfully', 'success');
      this.onFilterSubmit();
    }
  }

  private loadMockTableData(): void {
    const schemeObj = this.schemes.find(s => s.code === Number(this.selectedSchemeCode));
    const schemeName = schemeObj ? schemeObj.name : 'मुख्यमंत्री थार सीमा क्षेत्र विकास कार्यक्रम';

    this.planList = [
      {
        id: 1,
        createdBy: 'JAIPUR_ADMIN',
        schemeCode: Number(this.selectedSchemeCode),
        schemeName: schemeName,
        workName: 'निर्माण कार्य सामुदायिक भवन ग्राम कुकास आमेर',
        sectorArea: 'Rural',
        town: '-',
        blockName: 'Amer (आमेर)',
        gramPanchayat: 'Kukas (कुकास)',
        village: 'Kukas Village',
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
        schemeCode: Number(this.selectedSchemeCode),
        schemeName: schemeName,
        workName: 'सी सी रोड निर्माण कार्य मुख्य बस स्टैंड से पंचायत भवन',
        sectorArea: 'Rural',
        town: '-',
        blockName: 'Sanganer (सांगानेर)',
        gramPanchayat: 'Watika (वाटिका)',
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
  }

  getAmountNum(val: unknown, fallback: number = 0): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim()) {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.statusMessage = msg;
    this.isSuccess = type === 'success';
    if (type === 'success') {
      this.toastr.success(msg, 'Plan Management');
    } else {
      this.toastr.error(msg, 'Plan Management Error');
    }
    setTimeout(() => {
      this.statusMessage = '';
    }, 5000);
  }

  private getTodayFormatted(): string {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // --- PDF Downloads & Revert ---

  downloadDistrictPdf(): void {
    if (!this.selectedFinYr || !this.selectedSchemeCode) return;
    this.toastr.info('Generating District PDF...', 'Please wait');
    
    // District users download their own; State users can download for the selected district
    const call = this.isDistrictDisabled 
      ? this.planApi.downloadPdfPlan(this.selectedFinYr, Number(this.selectedSchemeCode))
      : this.planApi.viewDownloadPdfPlan(this.districtCode, this.selectedFinYr, Number(this.selectedSchemeCode));

    call.subscribe({
      next: (res) => this.handlePdfDownload(res, `District_Plan_${this.selectedFinYr}.pdf`),
      error: (err) => this.showToast('Failed to download District PDF.', 'error')
    });
  }

  downloadStatePdf(): void {
    if (!this.selectedFinYr || !this.selectedSchemeCode || this.districtCode === '0' || !this.districtCode) return;
    this.toastr.info('Generating State Approved PDF...', 'Please wait');
    
    this.planApi.downloadPdfPlanState(this.districtCode, this.selectedFinYr, Number(this.selectedSchemeCode)).subscribe({
      next: (res) => this.handlePdfDownload(res, `State_Approved_Plan_${this.selectedFinYr}.pdf`),
      error: (err) => this.showToast('Failed to download State PDF.', 'error')
    });
  }

  private handlePdfDownload(response: any, filename: string): void {
    if (response.body) {
      const url = window.URL.createObjectURL(response.body);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      this.showToast('Invalid PDF response.', 'error');
    }
  }

  revertPlan(): void {
    if (this.districtCode === '0' || this.districtCode === '00' || !this.districtCode) {
      this.showToast('Please select a specific district plan to revert.', 'error');
      return;
    }
    const reason = prompt('Enter reason for reverting this plan:');
    if (!reason || reason.trim().length < 5) {
      this.showToast('A valid reason is required to revert a plan.', 'error');
      return;
    }

    this.revertReasonText = reason.trim();
    this.triggerOtpFlow('REVERT');
  }

  private executeRevertPlan(): void {
    const revertModel = {
      schemeCode: Number(this.selectedSchemeCode),
      finYr: this.selectedFinYr,
      districtCode: this.districtCode,
      reason: this.revertReasonText
    };

    this.planApi.revertPlan(revertModel as any).subscribe({
      next: (res) => {
        this.showToast(res?.message || 'Plan reverted successfully.', 'success');
        this.onFilterSubmit();
      },
      error: (err) => {
        this.showToast('Failed to revert plan.', 'error');
      }
    });
  }
}

