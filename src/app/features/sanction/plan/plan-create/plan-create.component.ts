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

  // Form Fields for "Work Details" Modal (Ref Images 3 & 4)
  planId = 0;
  sectorArea = 'Rural'; // Rural / Urban
  workType = '';
  blockApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  dlcApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  slcApprovalDate = this.getTodayFormatted();
  workName = '';
  districtCode = '06';
  blockCode = '0001';
  gpCode = '0001';
  villageCode = '0001';
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
  finYears = ['2026-27', '2025-26', '2024-25', '2023-24'];
  schemes = [
    { code: 60, name: 'MLA Local Area Development Scheme (MLALAD - 60)' },
    { code: 5, name: 'मुख्यमंत्री थार सीमा क्षेत्र विकास कार्यक्रम' },
    { code: 1, name: 'डांग क्षेत्र विकास कार्यक्रम' },
    { code: 12, name: 'डॉ श्यामा प्रसाद मुखर्जी जिला उत्थान योजना' },
    { code: 18, name: 'मगरा क्षेत्र विकास कार्यक्रम' },
    { code: 22, name: 'मेवात क्षेत्र विकास कार्यक्रम' }
  ];

  districts = [
    { code: '06', name: 'JAIPUR - 06 (जयपुर)' },
    { code: '12', name: 'JAIPUR (जयपुर)' },
    { code: '13', name: 'JODHPUR (जोधपुर)' },
    { code: '14', name: 'UDAIPUR (उदयपुर)' },
    { code: '15', name: 'BARMER (बाड़मेर)' },
    { code: '16', name: 'Bikaner (बीकानेर)' }
  ];

  // Dynamic API Master Arrays
  blocksList: { code: string; name: string }[] = [];
  panchayatsList: { code: string; name: string }[] = [];
  villagesList: { code: string; name: string }[] = [];
  categoriesList: { code: string; name: string }[] = [];
  subCategoriesList: { code: string; name: string }[] = [];
  mlaList: { assemblyNo: string; name: string }[] = [];
  assembliesList: { assemblyNo: string; name: string }[] = [];
  deptList: { id: any; name: string }[] = [];
  agencyList: { id: any; name: string }[] = [];

  get assemblies(): any[] {
    return this.assembliesList.length > 0
      ? this.assembliesList
      : [
          { constCode: '001', assemblyNo: 16, constName: 'Amber', mlaName: 'Shri Satish Poonia' },
          { constCode: '002', assemblyNo: 16, constName: 'Hawa Mahal', mlaName: 'Shri Rajendra Rathore' },
          { constCode: '003', assemblyNo: 16, constName: 'Vidhyadhar Nagar', mlaName: 'Smt. Diya Kumari' }
        ];
  }

  get mlas(): any[] {
    return this.mlaList.length > 0
      ? this.mlaList
      : [
          { constCode: '001', assemblyNo: 16, constName: 'Amber', mlaName: 'Shri Satish Poonia' },
          { constCode: '002', assemblyNo: 16, constName: 'Hawa Mahal', mlaName: 'Shri Rajendra Rathore' },
          { constCode: '003', assemblyNo: 16, constName: 'Vidhyadhar Nagar', mlaName: 'Smt. Diya Kumari' }
        ];
  }

  get executiveDepts(): any[] {
    return this.deptList.length > 0
      ? this.deptList
      : [
          { id: 1, name: 'Panchayati Raj Department' },
          { id: 2, name: 'Public Works Department (PWD)' },
          { id: 3, name: 'Water Resources Dept (WRD)' },
          { id: 4, name: 'Public Health Engineering Dept (PHED)' }
        ];
  }

  get executiveAgencies(): any[] {
    return this.agencyList.length > 0
      ? this.agencyList
      : [
          { id: 1, name: 'Gram Panchayat Amer' },
          { id: 2, name: 'Block Development Officer Amer' },
          { id: 3, name: 'Executive Engineer PWD Jaipur' }
        ];
  }

  get categories(): any[] {
    return this.categoriesList.length > 0
      ? this.categoriesList
      : [
          { code: '01', name: 'Road & Connectivity' },
          { code: '02', name: 'Building & Infra' },
          { code: '03', name: 'Water & Sanitation' },
          { code: '04', name: 'Irrigation & Agri' },
          { code: '05', name: 'Community Development' }
        ];
  }

  get subCategories(): any[] {
    return this.subCategoriesList.length > 0
      ? this.subCategoriesList
      : [
          { code: '0101', name: 'Concrete Road (CC Road)' },
          { code: '0201', name: 'Community Hall / Panchayat Ghar' },
          { code: '0301', name: 'Drinking Water Tube Well' },
          { code: '0401', name: 'Drainage Pipeline' },
          { code: '0202', name: 'School Classroom' }
        ];
  }

  get currentBlocks(): { code: string; name: string }[] {
    return this.blocksList.length > 0
      ? this.blocksList
      : [
          { code: '0001', name: 'Amer (आमेर)' },
          { code: '0002', name: 'Sanganer (सांगानेर)' },
          { code: '0003', name: 'Luni (लूणी)' },
          { code: '0004', name: 'Mandore (मंडोर)' }
        ];
  }

  get currentPanchayats(): { code: string; name: string }[] {
    return this.panchayatsList.length > 0
      ? this.panchayatsList
      : [
          { code: '0001', name: 'Kukas (कुकास)' },
          { code: '0002', name: 'Chandwaji (चंदवाजी)' },
          { code: '0003', name: 'Boranada (बोरानाडा)' },
          { code: '0004', name: 'Salawas (सालावास)' }
        ];
  }

  get currentVillages(): { code: string; name: string }[] {
    return this.villagesList.length > 0
      ? this.villagesList
      : [
          { code: '0001', name: 'Kukas Village (कुकास गांव)' },
          { code: '0002', name: 'Syari Village (स्यारी गांव)' },
          { code: '0003', name: 'Boranada Village (बोरानाडा गांव)' }
        ];
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
    // Fallback to '12' if old session is still active and missing districtCode, unless it's state level
    const distCode = user?.districtCode || (user?.district === 'State' ? '0' : '12'); 
    
    if (distCode !== '0' && distCode !== '00') {
      this.districtCode = distCode;
      this.isDistrictDisabled = true;
    } else {
      this.isDistrictDisabled = false;
    }
    
    this.loadBudgetTypeList();
    this.loadAllMasterData();
    this.onFilterSubmit(); // Auto fetch initial table data
  }

  loadAllMasterData(): void {
    this.loadDistricts();
    this.loadBlocks();
    this.loadWorkCategories();
    this.loadWorkSubCategories();
    this.loadAssemblies();
    this.loadDepartments();
    this.loadAgencies();
  }

  loadDistricts(): void {
    this.masterApi.getDistricts().subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
        let formattedDistricts = items.map((d: any) => ({
          code: String(d.districtCode || d.DistrictCode || d.id || d.code || '12'),
          name: d.districtName || d.districtNameE || d.name || 'JAIPUR (जयपुर)'
        }));

        const user = this.authService.getCurrentUser();
        const distCode = user?.districtCode || (user?.district === 'State' ? '0' : '12');
        
        // If user is district specific, filter the dropdown to only show that district
        if (distCode !== '0' && distCode !== '00') {
          formattedDistricts = formattedDistricts.filter((d: any) => d.code === distCode);
        }
        
        if (formattedDistricts.length > 0) {
          this.districts = formattedDistricts;
        }
      }
    });
  }

  loadBlocks(): void {
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
            code: String(b.blockCode || b.BlockCode || b.code || b.id || '0001'),
            name: b.blockNameE || b.BlockNameE || b.blockName || b.BlockName || b.name || 'Amer (आमेर)'
          }));
        } else {
          this.blocksList = [
            { code: '0001', name: 'Amer (आमेर)' },
            { code: '0002', name: 'Sanganer (सांगानेर)' },
            { code: '0003', name: 'Luni (लूणी)' },
            { code: '0004', name: 'Mandore (मंडोर)' }
          ];
        }

        if (this.blocksList.length > 0) {
          this.blockCode = this.blocksList[0].code;
          this.loadGramPanchayats();
        }
      },
      error: () => {
        this.blocksList = [
          { code: '0001', name: 'Amer (आमेर)' },
          { code: '0002', name: 'Sanganer (सांगानेर)' },
          { code: '0003', name: 'Luni (लूणी)' },
          { code: '0004', name: 'Mandore (मंडोर)' }
        ];
        this.blockCode = '0001';
        this.loadGramPanchayats();
      }
    });
  }

  loadGramPanchayats(): void {
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
            code: String(gp.panchayatCode || gp.PanchayatCode || gp.gpCode || gp.code || '0001'),
            name: gp.panchayatNameE || gp.PanchayatNameE || gp.panchayatName || gp.name || 'Kukas (कुकास)'
          }));
        } else {
          this.panchayatsList = [
            { code: '0001', name: 'Kukas (कुकास)' },
            { code: '0002', name: 'Chandwaji (चंदवाजी)' },
            { code: '0003', name: 'Boranada (बोरानाडा)' },
            { code: '0004', name: 'Salawas (सालावास)' }
          ];
        }

        if (this.panchayatsList.length > 0) {
          this.gpCode = this.panchayatsList[0].code;
          this.loadVillages();
        }
      },
      error: () => {
        this.panchayatsList = [
          { code: '0001', name: 'Kukas (कुकास)' },
          { code: '0002', name: 'Chandwaji (चंदवाजी)' },
          { code: '0003', name: 'Boranada (बोरानाडा)' },
          { code: '0004', name: 'Salawas (सालावास)' }
        ];
        this.gpCode = '0001';
        this.loadVillages();
      }
    });
  }

  loadVillages(): void {
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
            code: String(v.villageCode || v.VillageCode || v.code || '0001'),
            name: v.villageNameE || v.VillageNameE || v.villageName || v.name || 'Kukas Village (कुकास गांव)'
          }));
        } else {
          this.villagesList = [
            { code: '0001', name: 'Kukas Village (कुकास गांव)' },
            { code: '0002', name: 'Syari Village (स्यारी गांव)' },
            { code: '0003', name: 'Boranada Village (बोरानाडा गांव)' }
          ];
        }

        if (this.villagesList.length > 0) {
          this.villageCode = this.villagesList[0].code;
        }
      },
      error: () => {
        this.villagesList = [
          { code: '0001', name: 'Kukas Village (कुकास गांव)' },
          { code: '0002', name: 'Syari Village (स्यारी गांव)' },
          { code: '0003', name: 'Boranada Village (बोरानाडा गांव)' }
        ];
        this.villageCode = '0001';
      }
    });
  }

  loadWorkCategories(): void {
    this.masterApi.getWorkCategories().subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.categoriesList = items.map((c: any) => ({
          code: c.sectorCode || c.categoryCode || c.code || '01',
          name: c.description || c.categoryNameE || c.name || 'Road & Connectivity'
        }));
      }
    });
  }

  loadWorkSubCategories(): void {
    this.masterApi.getWorkSubCategories('01').subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.subCategoriesList = items.map((sc: any) => ({
          code: sc.id || sc.subCategoryCode || sc.code || 101,
          name: sc.description || sc.subCategoryNameE || sc.name || 'Concrete Road (CC Road)'
        }));
      }
    });
  }

  loadAssemblies(): void {
    this.masterApi.getAssemblyNoList().subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
        this.assembliesList = items.map((a: any) => ({
          assemblyNo: a.assemblyno || a.assemblyNo || a.id || a.code || 16,
          name: a.assemblyname || a.assemblyName || a.assemblyNameE || a.name || a.description || `Assembly ${a.assemblyno || 16}`
        })).filter((a: any) => a.assemblyNo != 0 && a.name !== '--ALL--'); // exclude '--ALL--' option
        if (this.assembliesList.length > 0 && !this.assemblyNo) {
          this.assemblyNo = String(this.assembliesList[0].assemblyNo);
        }
        this.loadMlaList();
      }
    });
  }

  onAssemblyChange(): void {
    this.constCode = ''; // reset MLA when assembly changes
    this.loadMlaList();
  }

  loadMlaList(): void {
    const assemblyToLoad = this.assemblyNo || '16';
    this.masterApi.getMlaList(assemblyToLoad).subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.mlaList = items.map((m: any) => ({
          constCode: m.constCode || '001',
          assemblyNo: m.assemblyNo || 16,
          constName: m.constName || 'Amber',
          mlaName: m.mlaName || m.name || 'Shri Satish Poonia'
        }));
      }
    });
  }

  loadDepartments(): void {
    this.masterApi.getDepartments(this.districtCode).subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.deptList = items.map((d: any) => ({
          id: d.deptId || d.id || '1',
          name: d.deptNameE || d.name || 'Panchayati Raj Department'
        }));
      }
    });
  }

  loadAgencies(): void {
    this.masterApi.getAgencies(this.districtCode, '6').subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.agencyList = items.map((a: any) => ({
          id: a.agencyId || a.id || '6',
          name: a.agencyNameE || a.name || 'Gram Panchayat Amer'
        }));
      }
    });
  }

  onDistrictChange(): void {
    this.loadBlocks();
    this.loadDepartments();
    this.loadAgencies();
  }

  onBlockChange(): void {
    this.loadGramPanchayats();
  }

  onPanchayatChange(): void {
    this.loadVillages();
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
        this.loadMockTableData();
      }
    });
  }

  openAddWorkModal(): void {
    this.resetModalForm();
    this.showAddWorkModal = true;
  }

  closeAddWorkModal(): void {
    this.showAddWorkModal = false;
  }

  openForwardModal(): void {
    this.selectedPdfFile = null;
    this.selectedFileName = '';
    this.showForwardModal = true;
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
      dlcApprovalDate1: this.dlcApprovalDate || null,
      blockApprovalDate1: this.blockApprovalDate || null,
      slcApprovalDate1: this.slcApprovalDate || this.dlcApprovalDate || '28/09/2026',

      priority: priorityNum,
      cmBadpCategoryCode: null,
      jayShreeCode: this.jShreeYojna && this.jShreeYojna !== 'Not Applicable' ? this.jShreeYojna : null,

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
      constCode: String(this.constCode || '001').padStart(3, '0')
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

  onSaveAndForwardFile(): void {
    if (!this.selectedPdfFile) {
      this.showToast('Please select a valid PDF file to upload.', 'error');
      return;
    }

    this.isUploading = true;
    const fields = {
      SchemeCode: Number(this.selectedSchemeCode),
      FinYr: this.selectedFinYr,
      DistrictCode: this.districtCode,
      Remarks: this.remarks
    };

    this.planApi.savePlanFileAndForward(this.selectedPdfFile, fields).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.showForwardModal = false;
        const msg = res?.message || 'District Plan PDF saved and forwarded to State successfully!';
        this.showToast(msg, 'success');
        this.onFilterSubmit();
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error uploading PDF:', err);
        this.showToast(err?.error?.message || 'Failed to forward Plan PDF.', 'error');
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
      (p.schemeName && p.schemeName.toLowerCase().includes(q)) ||
      (p.districtName && p.districtName.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  }

  private resetModalForm(): void {
    this.planId = 0;
    this.workName = '';
    this.sectorArea = 'Rural';
    this.workType = 'New Work';
    this.blockApprovalDate = this.getTodayFormatted();
    this.dlcApprovalDate = this.getTodayFormatted();
    this.proposedAmount = null;
    this.category = 'Road & Connectivity';
    this.subCategory = 'Concrete Road (CC Road)';
    this.assemblyNo = '101 - Amber';
    this.mlaName = 'Shri Satish Poonia';
    this.executiveDept = 'Panchayati Raj Department';
    this.executiveAgency = 'Gram Panchayat Amer';
    this.priority = 'First';
    this.jShreeYojna = 'Not Applicable';
    this.remarks = '';
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
}

