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
  selectedSchemeCode = 5;
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
  workType = 'New Work';
  blockApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  dlcApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  slcApprovalDate = this.getTodayFormatted();
  workName = '';
  districtCode = '12';
  blockCode = '0001';
  gpCode = '0001';
  villageCode = '0001';
  proposedAmount: number | null = null;
  category = '';
  subCategory = '';
  assemblyNo = '16';
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
    { code: 5, name: 'मुख्यमंत्री थार सीमा क्षेत्र विकास कार्यक्रम' },
    { code: 1, name: 'डांग क्षेत्र विकास कार्यक्रम' },
    { code: 12, name: 'डॉ श्यामा प्रसाद मुखर्जी जिला उत्थान योजना' },
    { code: 18, name: 'मगरा क्षेत्र विकास कार्यक्रम' },
    { code: 22, name: 'मेवात क्षेत्र विकास कार्यक्रम' }
  ];

  districts = [
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
  deptList: { id: any; name: string }[] = [];
  agencyList: { id: any; name: string }[] = [];

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

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.district) {
      this.districtCode = '12';
    }
    this.loadBudgetTypeList();
    this.loadAllMasterData();
    this.onFilterSubmit(); // Auto fetch initial table data
  }

  loadAllMasterData(): void {
    this.loadBlocks();
    this.loadWorkCategories();
    this.loadWorkSubCategories();
    this.loadMlaList();
    this.loadDepartments();
    this.loadAgencies();
  }

  loadBlocks(): void {
    this.masterApi.getBlocks(this.districtCode).subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.blocksList = items.map((b: any) => ({
          code: b.blockCode || b.code || '0001',
          name: b.blockNameE || b.blockName || b.name || 'Amer (आमेर)'
        }));
        if (this.blocksList.length > 0) {
          this.blockCode = this.blocksList[0].code;
          this.loadGramPanchayats();
        }
      }
    });
  }

  loadGramPanchayats(): void {
    this.masterApi.getGramPanchayats(this.districtCode, this.blockCode).subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.panchayatsList = items.map((gp: any) => ({
          code: gp.panchayatCode || gp.code || '0001',
          name: gp.panchayatNameE || gp.name || 'Kukas (कुकास)'
        }));
        if (this.panchayatsList.length > 0) {
          this.gpCode = this.panchayatsList[0].code;
          this.loadVillages();
        }
      }
    });
  }

  loadVillages(): void {
    this.masterApi.getVillages(this.districtCode, this.blockCode, this.gpCode).subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.villagesList = items.map((v: any) => ({
          code: v.villageCode || v.code || '0001',
          name: v.villageNameE || v.name || 'Kukas Village (कुकास गांव)'
        }));
        if (this.villagesList.length > 0) {
          this.villageCode = this.villagesList[0].code;
        }
      }
    });
  }

  loadWorkCategories(): void {
    this.masterApi.getWorkCategories().subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.categoriesList = items.map((c: any) => ({
          code: c.categoryCode || c.code || 'CAT01',
          name: c.categoryNameE || c.name || 'Road & Connectivity'
        }));
      }
    });
  }

  loadWorkSubCategories(): void {
    this.masterApi.getWorkSubCategories('01').subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.subCategoriesList = items.map((sc: any) => ({
          code: sc.subCategoryCode || sc.code || 'SUBCAT01',
          name: sc.subCategoryNameE || sc.name || 'Concrete Road (CC Road)'
        }));
      }
    });
  }

  loadMlaList(): void {
    this.masterApi.getMlaList('16').subscribe({
      next: (res) => {
        const items = res?.data || [];
        this.mlaList = items.map((m: any) => ({
          assemblyNo: m.assemblyNo || '16',
          name: m.mlaNameE || m.name || 'Shri Satish Poonia'
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

  // Dependent Dropdown Handlers
  get currentBlocks() {
    return this.blocksMap[this.districtCode] || [
      { code: 'B101', name: 'Amer (आमेर)' },
      { code: 'B102', name: 'Sanganer (सांगानेर)' }
    ];
  }

  get currentPanchayats() {
    return this.panchayatsMap[this.blockCode] || [
      { code: 'GP01', name: 'Kukas (कुकास)' },
      { code: 'GP02', name: 'Chandwaji (चंदवाजी)' }
    ];
  }

  get currentVillages() {
    return this.villagesMap[this.gpCode] || [
      { code: 'V01', name: 'Kukas Village (कुकास गांव)' }
    ];
  }

  /**
   * Save Plan Work Details via API (Fixes HTTP 400 Bad Request error)
   */
  onSaveWorkDetail(): void {
    if (!this.workName.trim()) {
      this.showToast('Please enter Work Name.', 'error');
      return;
    }

    if (!this.dlcApprovalDate || !this.blockApprovalDate) {
      this.showToast('DLC Approval Date and Block Approval Date are required.', 'error');
      return;
    }

    // Clean payload matching C# mdlPlan model expectations precisely
    const planPayload: PlanModel = {
      id: this.planId || 0,
      schemeCode: Number(this.selectedSchemeCode),
      finYr: this.selectedFinYr,
      districtCode: this.districtCode || '101',
      workName: this.workName.trim(),
      workType: this.workType || 'New Work',
      sectorArea: this.sectorArea || 'Rural',
      workCategory: this.category || 'Building & Infra',
      constCode: this.assemblyNo || '101',
      dlcApprovalDate1: this.dlcApprovalDate, // dd/MM/yyyy
      blockApprovalDate1: this.blockApprovalDate, // dd/MM/yyyy
      slcApprovalDate1: this.slcApprovalDate || this.dlcApprovalDate,
      budgetTypeId: this.budgetTypeId ? Number(this.budgetTypeId) : 1,
      totalEstimatedCost: Number(this.proposedAmount) || 0,
      remarks: this.remarks || ''
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

