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
  mlaList: any[] = [];
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
        this.deptList = items.map((d: any, index: number) => ({
          id: d.deptId || d.departmentId || d.deptCode || d.id || (index + 1),
          name: d.deptNameE || d.departmentName || d.deptName || d.name || 'Panchayati Raj Department'
        }));
      }
    });
  }

  loadAgencies(): void {
    this.masterApi.getAgencies(this.districtCode, '6').subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.agencyList = items.map((a: any, index: number) => ({
          id: a.agencyId || a.agencyCode || a.id || (index + 1),
          name: a.agencyNameE || a.agencyName || a.name || 'Gram Panchayat Amer'
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

  onSaveAndForwardFile(): void {
    if (!this.selectedPdfFile) {
      this.showToast('Please select a valid PDF file to upload.', 'error');
      return;
    }

    this.isUploading = true;
    const fields: any = {
      SchemeCode: Number(this.selectedSchemeCode),
      FinYr: this.selectedFinYr,
      DistrictCode: this.districtCode,
      Remarks: this.remarks
    };

    if (this.isApproveMode) {
      // ----------------------------------------------------
      // STATE APPROVAL LOGIC
      // ----------------------------------------------------
      this.planApi.approvePlanAndUploadFile(this.selectedPdfFile, fields).subscribe({
        next: (res) => {
          this.isUploading = false;
          this.showForwardModal = false;
          this.showToast(res?.message || 'Plan approved successfully!', 'success');
          this.onFilterSubmit(); // Reload grid
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Error approving PDF:', err);
          this.showToast(err?.error?.message || 'Failed to approve Plan PDF.', 'error');
        }
      });
    } else {
      // ----------------------------------------------------
      // DISTRICT FORWARD LOGIC
      // ----------------------------------------------------
      this.planApi.savePlanFileAndForward(this.selectedPdfFile, fields).subscribe({
        next: (res) => {
          this.isUploading = false;
          this.showForwardModal = false;
          this.showToast(res?.message || 'District Plan PDF saved and forwarded to State successfully!', 'success');
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

  onRejectPlan(): void {
    if (!this.rejectReason || this.rejectReason.trim().length < 5) {
      this.showToast('Please enter a valid rejection reason.', 'error');
      return;
    }
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
        this.onFilterSubmit(); // Reload grid
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

    const revertModel = {
      schemeCode: Number(this.selectedSchemeCode),
      finYr: this.selectedFinYr,
      districtCode: this.districtCode,
      reason: reason.trim()
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

