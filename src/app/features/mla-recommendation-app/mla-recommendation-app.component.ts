import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LanguageService } from '../../core/services/language.service';
import { AuthService, UserSession } from '../../core/services/auth.service';
import { MlaRecommendationService } from '../../core/services/mla-recommendation.service';

export interface RecommendationItem {
  id: number;
  workName: string;
  workNameHi?: string;
  finYear: string;
  date: string;
  mlaName: string;
  userName: string;
  workStatus: 'Pending' | 'Approved' | 'Deleted' | 'In Progress';
  workId: string;
  isConversion: 'Yes' | 'No';
  proposedAmount: number; // in lacs
  schemeName: string;
  approvalNo: string;
  sector: 'Rural' | 'Urban';
  districtName: string;
  blockName?: string;
  panchayatName?: string;
  villageName?: string;
  townName?: string;
  executingDept: string;
  executingAgency: string;
  convergence: 'Yes' | 'No';
  pdfFileName?: string;
  pdfFileSize?: string;
  revertRequested?: string;
  deletedStatus?: string;
  revertCompleted?: string;
  platformThrough: string;
}

@Component({
  selector: 'app-mla-recommendation-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mla-recommendation-app.component.html',
  styleUrls: ['./mla-recommendation-app.component.css']
})
export class MlaRecommendationAppComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public languageService = inject(LanguageService);
  private authService = inject(AuthService);
  private mlaService = inject(MlaRecommendationService);
  private sanitizer = inject(DomSanitizer);

  user: UserSession | null = null;

  // Active view: 'dashboard' | 'create' | 'list' | 'detail'
  activeScreen: 'dashboard' | 'create' | 'list' | 'detail' = 'dashboard';

  // Delete modal state
  showDeleteModal = false;
  itemToDelete: RecommendationItem | null = null;

  // PDF Preview modal state
  showPdfModal = false;
  itemToViewPdf: RecommendationItem | null = null;

  // Search & filter for list
  listSearchQuery = '';
  selectedFilter: 'all' | 'pending' | 'deleted' | 'approved' = 'all';

  // Dashboard Financial Year Selection
  selectedFinYear = '';
  finYearOptions: string[] = [];
  isLoadingFinYears = false;
  finYearLoadError = '';
  isLoadingRecommendations = false;
  recommendationLoadError = '';
  editingId: string | null = null;
  isLoadingPdf = false;
  pdfObjectUrl: string | null = null;
  pdfSafeUrl: SafeResourceUrl | null = null;
  pdfLoadError = '';

  // Dashboard Stats matching screenshots
  dashboardStats = {
    totalAllocated: '—',
    availableAmount: '—',
    remainingAmount: '—',
    noOfCcWork: '—',
    noOfProposedWork: '—',
    noOfFsWork: '—',
    fsAmount: '—',
    mlaName: '—',
    constName: '—',
    aNo: '—'
  };

  // Create Recommendation Form Model
  formModel = {
    userName: '',
    financialYear: '',
    recommendationArea: 'Rural' as 'Rural' | 'Urban',
    nameOfTheWork: '',
    proposedAmountInLacs: '',
    scheme: '',
    district: '',
    block: '',
    panchayat: '',
    village: '',
    town: '',
    executingDepartment: '',
    executingAgency: '',
    convergence: 'No' as 'Yes' | 'No',
    pdfFile: null as File | null,
    pdfFileName: ''
  };

  // Dropdown Master Data – populated from backend APIs on init/change
  districts: { code: string; name: string }[] = [];
  blocks: { code: string; name: string }[] = [];
  panchayats: { code: string; name: string }[] = [];
  villages: { code: string; name: string }[] = [];
  towns: { code: string; name: string }[] = [];
  departments: { id: any; name: string }[] = [];
  agencies: { id: any; name: string }[] = [];
  schemes: { code: string; name: string }[] = [];
  isLoadingSchemes = false;
  isLoadingAgencies = false;
  agencyLoadError = '';

  // Active item in Detailed View
  selectedRecommendation: RecommendationItem | null = null;
  recommendations: RecommendationItem[] = [];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(session => {
      this.user = session || this.authService.getCurrentUser();
    });

    // Get district code from logged-in user (same as plan-create)
    const user = this.authService.getCurrentUser();
    const districtCode = user?.districtCode || '';
    this.formModel.userName = user?.username || this.formModel.userName;
    this.formModel.district = districtCode;
    this.loadDistricts(districtCode);
    this.loadSchemes();
    this.loadFinancialYears();
    this.loadRecommendations();

    // Load departments and agencies for the user's district
    this.loadDepartments(districtCode);
    this.loadTowns(districtCode);
    // Default is Rural — pre-load blocks
    this.loadBlocks(districtCode);

    // Existing route handling (unchanged)
    this.route.params.subscribe(params => {
      if (params['view']) {
        const v = params['view'].toLowerCase();
        if (['create', 'list', 'detail', 'dashboard'].includes(v)) {
          this.activeScreen = v as any;
        }
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tab = params['tab'].toLowerCase();
        if (['dashboard', 'create', 'list', 'detail'].includes(tab)) {
          this.activeScreen = tab as any;
        }
      }
      if (params['id']) {
        const item = this.recommendations.find(r => String(r.id) === String(params['id']));
        if (item) {
          this.selectedRecommendation = item;
          this.activeScreen = 'detail';
        }
      }
    });
  }

  // Navigation handlers
  switchScreen(screen: 'dashboard' | 'create' | 'list' | 'detail', item?: RecommendationItem): void {
    this.activeScreen = screen;
    if (item) {
      this.selectedRecommendation = item;
    }
    const targetUrl = screen === 'dashboard' 
      ? '/portal/mla-recommendation-app' 
      : `/portal/mla-recommendation-app/${screen}`;
    this.router.navigate([targetUrl], {
      queryParams: item ? { id: item.id } : {}
    });
  }

  onFinYearChange(): void {
    this.formModel.financialYear = this.selectedFinYear;
    this.loadMlaReport();
    this.loadRecommendations();
  }

  private loadDistricts(defaultCode: string): void {
    this.mlaService.getDistricts().subscribe({
      next: response => {
        this.districts = this.apiRows(response).map(item => ({
          code: String(this.apiValue(item, ['DistrictCode', 'districtCode', 'Code', 'Id'])),
          name: String(this.apiValue(item, ['DistrictName', 'DistName', 'districtName', 'Name']))
        })).filter(item => item.code && item.name);
        if (!this.districts.some(item => item.code === this.formModel.district)) {
          this.formModel.district = this.districts.find(item => item.code === defaultCode)?.code || this.districts[0]?.code || '';
          this.onDistrictChange();
        }
      },
      error: () => this.districts = []
    });
  }

  private loadSchemes(): void {
    this.isLoadingSchemes = true;
    this.mlaService.getSchemeMaster().subscribe({
      next: response => {
        this.schemes = this.apiRows(response).map(item => ({
          code: String(this.apiValue(item, ['SchemeCode', 'schemeCode', 'scheme_code', 'Code'])),
          name: String(this.apiValue(item, ['SchemeName', 'schemeName', 'scheme_name', 'Name'], 'MLA Recommendation'))
        })).filter(item => Number(item.code) === 9);
        this.formModel.scheme = this.schemes[0]?.code || '';
        this.isLoadingSchemes = false;
      },
      error: () => { this.schemes = []; this.formModel.scheme = ''; this.isLoadingSchemes = false; }
    });
  }

  private currentFinYear(): string {
    const now = new Date();
    const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${start}-${String(start + 1).slice(-2)}`;
  }

  private loadFinancialYears(): void {
    this.isLoadingFinYears = true;
    this.finYearLoadError = '';
    this.mlaService.getFinancialYears().subscribe({
      next: response => {
        this.finYearOptions = this.apiRows(response).map(row => {
          const value = typeof row === 'string' || typeof row === 'number'
            ? row
            : this.apiValue(row, ['FinYr', 'FinYear', 'FinancialYear', 'Year', 'Financial_Year']);
          return String(value ?? '').trim();
        }).filter((year, index, years) => !!year && years.indexOf(year) === index);

        const currentYear = this.currentFinYear();
        this.selectedFinYear = this.finYearOptions.includes(currentYear)
          ? currentYear
          : (this.finYearOptions[0] || '');
        this.formModel.financialYear = this.selectedFinYear;
        this.isLoadingFinYears = false;
        if (this.selectedFinYear) this.loadMlaReport();
        else this.finYearLoadError = 'Financial year list is empty.';
      },
      error: error => {
        this.finYearOptions = [];
        this.selectedFinYear = '';
        this.formModel.financialYear = '';
        this.finYearLoadError = error?.error?.message || error?.error?.title || 'Financial year API failed.';
        this.isLoadingFinYears = false;
      }
    });
  }

  private apiRows(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (!response || typeof response !== 'object') return [];
    for (const [key, value] of Object.entries(response)) {
      if (/^(data|result|items|table)$/i.test(key)) {
        if (Array.isArray(value)) return value;
        const nested = this.apiRows(value);
        if (nested.length) return nested;
      }
    }
    for (const value of Object.values(response)) {
      if (Array.isArray(value)) return value;
      if (value && typeof value === 'object') {
        const nested = this.apiRows(value);
        if (nested.length) return nested;
      }
    }
    return [];
  }

  private apiValue(row: any, keys: string[], fallback: any = ''): any {
    const wanted = new Set(keys.map(key => key.toLowerCase().replace(/[^a-z0-9]/g, '')));
    const match = Object.entries(row || {}).find(([key]) => wanted.has(key.toLowerCase().replace(/[^a-z0-9]/g, '')));
    return match?.[1] ?? fallback;
  }

  private loadRecommendations(): void {
    const username = this.formModel.userName || this.user?.username;
    if (!username) return;
    this.isLoadingRecommendations = true;
    this.recommendationLoadError = '';
    this.mlaService.reportRecommendation(username).subscribe({
      next: response => {
        if (response?.status === false) {
          this.recommendations = [];
          this.recommendationLoadError = response.message || 'Recommendations could not be loaded.';
        } else {
          this.recommendations = this.apiRows(response).map((row, index) => this.mapRecommendation(row, index));
        }
        this.isLoadingRecommendations = false;
      },
      error: error => {
        this.recommendations = [];
        this.recommendationLoadError = error?.error?.message || error?.error?.title || 'Recommendation list API failed.';
        this.isLoadingRecommendations = false;
      }
    });
  }

  private mapRecommendation(row: any, index: number): RecommendationItem {
    const get = (keys: string[], fallback: any = '') => this.apiValue(row, keys, fallback);
    const id = get(['Id', 'RecommendationId', 'RecId'], index + 1);
    const sector = String(get(['Sector'], 'R')).toUpperCase();
    const state = String(get(['Status', 'WorkStatus', 'RecommendationStatus'], 'Pending'));
    const isDeleted = this.toBoolean(get(['IsDeleted', 'Deleted'], false));
    const isApproved = this.toBoolean(get(['AgencyIsApproved', 'IsApproved', 'Approved'], false));
    const isRevertRequested = this.toBoolean(get(['IsRevertRequested'], false));
    const isRevertCompleted = this.toBoolean(get(['RevertCompleted', 'IsRevertCompleted'], false));
    const isWeb = this.toBoolean(get(['IsWeb'], false));
    return {
      id: Number(id) || index + 1,
      workName: String(get(['WorkName', 'NameOfWork'], '—')),
      workNameHi: get(['WorkNameHi', 'WorkNameHindi'], undefined),
      finYear: String(get(['FinYr', 'FinYear', 'FinancialYear'], this.selectedFinYear)),
      date: this.displayDate(get(['WorkRecptDate', 'Date', 'CreatedDate'], '')),
      mlaName: String(get(['MlaName', 'H_MLAName', 'MLAName'], this.formModel.userName)),
      userName: String(get(['UserName'], this.formModel.userName)),
      workStatus: isDeleted || /delet/i.test(state) ? 'Deleted' : isApproved || /approv|sanction/i.test(state) ? 'Approved' : /progress/i.test(state) ? 'In Progress' : 'Pending',
      workId: String(get(['WorkId'], '-')),
      isConversion: /^(yes|true|1)$/i.test(String(get(['IsConvergence'], 'No'))) ? 'Yes' : 'No',
      proposedAmount: Number(get(['ProposedAmt', 'ProposedAmount', 'Amount'], 0)) || 0,
      schemeName: String(get(['SchemeName', 'SchemeCode'], '-')),
      approvalNo: String(get(['ApprovalNo', 'RecommendationNo', 'LetterNo'], id)),
      sector: sector === 'U' || sector === 'URBAN' ? 'Urban' : 'Rural',
      districtName: String(get(['DistrictName', 'District'], '-')),
      blockName: String(get(['BlockName'], '')),
      panchayatName: String(get(['PanchayatName', 'GramPanchayatName'], '')),
      villageName: String(get(['VillageName'], '')),
      townName: String(get(['TownName'], '')),
      executingDept: String(get(['AgencyName', 'DepartmentName'], '-')),
      executingAgency: String(get(['SubAgencyName'], '-')),
      convergence: /^(yes|true|1)$/i.test(String(get(['IsConvergence', 'Convergence'], 'No'))) ? 'Yes' : 'No',
      pdfFileName: String(get(['FileName', 'PdfFileName'], '')),
      platformThrough: isWeb ? 'Web' : 'Mobile',
      revertRequested: isRevertRequested ? (get(['RevertRequestedDate']) ? this.displayDate(get(['RevertRequestedDate'])) : 'Yes') : 'No',
      deletedStatus: isDeleted ? (get(['DeletedDate']) ? this.displayDate(get(['DeletedDate'])) : 'Yes') : 'No',
      revertCompleted: isRevertCompleted ? 'Yes' : 'No',
      ...( { backendId: String(id), rawWorkRecptDate: get(['WorkRecptDate']), districtCode: String(get(['DistrictCode'])), blockCode: String(get(['BlockCode'])), panchayatCode: String(get(['PanchayatCode'])), villageCode: String(get(['VillageCode', 'VillagCode'])), townCode: String(get(['TownCode'])), departmentId: String(get(['AgencyId', 'DepartmentId'])), subAgencyId: String(get(['SubAgencyId'])), schemeCode: String(get(['SchemeCode'])) } as any )
    };
  }

  private toBoolean(value: any): boolean {
    return value === true || value === 1 || /^(true|1|yes)$/i.test(String(value));
  }

  private displayDate(value: any): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  private loadMlaReport(): void {
    if (!this.formModel.userName) return;
    const aNo = this.formModel.userName.split('-')[0];
    this.mlaService.fetchMlaIndividualReport(this.formModel.userName, this.selectedFinYear, '0', aNo).subscribe({
      next: response => {
        const report = this.apiRows(response)[0] || response?.data || response || {};
        const get = (keys: string[]) => String(this.apiValue(report, keys, '—'));
        this.dashboardStats = {
          totalAllocated: get(['TotalAllocated', 'TotalAllocatedAmount', 'AllocatedAmount', 'TotalAmount']),
          availableAmount: get(['AvailableAmount', 'AvailableAmt', 'BalanceAmount']),
          remainingAmount: get(['RemainingAmount', 'RemainingAmt']),
          noOfCcWork: get(['NoOfCcWork', 'CCWorkCount']),
          noOfProposedWork: get(['NoOfProposedWork', 'ProposedWorkCount']),
          noOfFsWork: get(['NoOfFsWork', 'FSWorkCount']),
          fsAmount: get(['FsAmount', 'FSAmount']),
          mlaName: get(['H_MLAName', 'MlaName', 'MLAName', 'MemberName']),
          constName: get(['Const_Name', 'ConstName', 'ConstituencyName', 'AssemblyName']),
          aNo: get(['a_no', 'AssemblyNo'])
        };
      },
      error: () => undefined
    });
  }

  // ─── Master Data Loading (same pattern as plan-create) ─────────────────

  loadDepartments(districtCode: string): void {
    if (!districtCode) { this.departments = []; return; }
    this.mlaService.getDepartment(districtCode).subscribe({
      next: (res) => {
        const items = this.apiRows(res);
        this.departments = items.map((d: any, i: number) => ({
          id: d.agencyId || d.deptId || d.departmentId || d.deptCode || d.id || (i + 1),
          name: d.agencyName || d.deptNameE || d.departmentName || d.deptName || d.name || ''
        })).filter((d: any) => d.name);
      },
      error: () => { this.departments = []; }
    });
  }

  loadAgencies(districtCode: string): void {
    const departmentId = this.formModel.executingDepartment;
    if (!districtCode || !departmentId) { this.agencies = []; return; }
    this.isLoadingAgencies = true;
    this.agencyLoadError = '';
    this.mlaService.getAgency(districtCode, departmentId).subscribe({
      next: (res) => {
        const items = this.apiRows(res);
        this.agencies = items.map((a: any, i: number) => ({
          id: a.subAgencyId || a.agencyId || a.agencyCode || a.id || (i + 1),
          name: a.subAgencyName || a.agencyName || a.agencyNameE || a.name || ''
        })).filter((a: any) => a.name);
        this.agencyLoadError = this.agencies.length ? '' : 'No agencies found for this department.';
        this.isLoadingAgencies = false;
      },
      error: (error) => { this.agencies = []; this.agencyLoadError = error?.error?.message || 'Agency API failed.'; this.isLoadingAgencies = false; }
    });
  }

  onDepartmentChange(): void {
    this.formModel.executingAgency = '';
    this.loadAgencies(this.formModel.district);
  }

  onDistrictChange(): void {
    this.formModel.block = this.formModel.panchayat = this.formModel.village = this.formModel.town = '';
    this.formModel.executingDepartment = this.formModel.executingAgency = '';
    this.agencies = [];
    const districtCode = this.formModel.district;
    this.loadDepartments(districtCode);
    this.loadBlocks(districtCode);
    this.loadTowns(districtCode);
  }

  loadBlocks(districtCode: string): void {
    if (!districtCode) { this.blocks = []; return; }
    this.mlaService.getBlocks(districtCode).subscribe({
      next: (res) => {
        const items = this.apiRows(res);
        this.blocks = items.map((b: any) => ({
          code: String(b.blockCode || b.BlockCode || b.code || ''),
          name: b.blockNameE || b.BlockNameE || b.blockName || b.name || ''
        })).filter((b: any) => b.code && b.name);
      },
      error: () => { this.blocks = []; }
    });
  }

  loadGramPanchayats(districtCode: string, blockCode: string): void {
    if (!districtCode || !blockCode) { this.panchayats = []; return; }
    this.mlaService.getGramPanchayats(districtCode, blockCode).subscribe({
      next: (res) => {
        const items = this.apiRows(res);
        this.panchayats = items.map((gp: any) => ({
          code: String(gp.panchayatCode || gp.PanchayatCode || gp.gpCode || gp.code || ''),
          name: gp.panchayatNameE || gp.PanchayatNameE || gp.panchayatName || gp.name || ''
        })).filter((p: any) => p.code && p.name);
      },
      error: () => { this.panchayats = []; }
    });
  }

  loadVillages(districtCode: string, blockCode: string, panchayatCode: string): void {
    if (!districtCode || !blockCode || !panchayatCode) { this.villages = []; return; }
    this.mlaService.getVillages(districtCode, blockCode, panchayatCode).subscribe({
      next: (res) => {
        const items = this.apiRows(res);
        this.villages = items.map((v: any) => ({
          code: String(v.villagCode || v.villageCode || v.VillageCode || v.code || ''),
          name: v.villageName || v.villageNameE || v.VillageNameE || v.name || ''
        })).filter((v: any) => v.code && v.name);
      },
      error: () => { this.villages = []; }
    });
  }

  loadTowns(districtCode: string): void {
    if (!districtCode) { this.towns = []; return; }
    this.mlaService.getTown(districtCode).subscribe({
      next: (res) => {
        const items = this.apiRows(res);
        this.towns = items.map((t: any) => ({
          code: String(t.townCode || t.TownCode || t.code || ''),
          name: t.townNameE || t.TownNameE || t.townName || t.name || ''
        })).filter((t: any) => t.code && t.name);
      },
      error: () => { this.towns = []; }
    });
  }

  // Area toggle — load towns OR blocks based on selection
  onAreaChange(area: 'Rural' | 'Urban'): void {
    this.formModel.recommendationArea = area;
    this.formModel.block = '';
    this.formModel.panchayat = '';
    this.formModel.village = '';
    this.formModel.town = '';
    const districtCode = this.formModel.district || this.authService.getCurrentUser()?.districtCode || '';
    if (area === 'Rural') {
      this.loadBlocks(districtCode);
    } else {
      this.loadTowns(districtCode);
    }
  }

  onBlockChange(): void {
    this.formModel.panchayat = '';
    this.formModel.village = '';
    this.panchayats = [];
    this.villages = [];
    if (this.formModel.block) {
      const districtCode = this.formModel.district || this.authService.getCurrentUser()?.districtCode || '';
      this.loadGramPanchayats(districtCode, this.formModel.block);
    }
  }

  onPanchayatChange(): void {
    this.formModel.village = '';
    this.villages = [];
    if (this.formModel.panchayat) {
      const districtCode = this.formModel.district || this.authService.getCurrentUser()?.districtCode || '';
      this.loadVillages(districtCode, this.formModel.block, this.formModel.panchayat);
    }
  }

  submitRecommendation(): void {
    if (!this.formModel.financialYear || !this.finYearOptions.includes(this.formModel.financialYear)) {
      this.toastr.warning(this.finYearLoadError || 'Please select a valid Financial Year.');
      return;
    }
    if (!this.formModel.nameOfTheWork.trim()) {
      this.toastr.warning('कृपया कार्य का नाम दर्ज करें (Please enter Name of the work).');
      return;
    }
    if (!this.formModel.proposedAmountInLacs || Number(this.formModel.proposedAmountInLacs) <= 0) {
      this.toastr.warning('कृपया मान्य प्रस्तावित राशि दर्ज करें (Please enter valid Proposed Amount).');
      return;
    }
    if (!this.formModel.district || !this.formModel.executingDepartment || !this.formModel.executingAgency) {
      this.toastr.warning('Please select District, Department and Agency.');
      return;
    }
    if (!this.formModel.scheme || !this.schemes.some(item => Number(item.code) === 9)) {
      this.toastr.warning('MLA scheme (SchemeCode 9) is unavailable from SchemeMaster.');
      return;
    }
    if (!this.formModel.pdfFile) {
      this.toastr.warning('Please upload the required recommendation PDF.');
      return;
    }
    if (this.formModel.recommendationArea === 'Rural' && !this.formModel.block) {
      this.toastr.warning('कृपया ब्लॉक का चयन करें (Please select Block).');
      return;
    }
    if (this.formModel.recommendationArea === 'Urban' && !this.formModel.town) {
      this.toastr.warning('कृपया शहर/कस्बे का चयन करें (Please select Town).');
      return;
    }
    // Build payload matching backend fields
    const payload = {
      BlockCode: this.formModel.recommendationArea === 'Rural' ? this.formModel.block : undefined,
      PanchayatCode: this.formModel.recommendationArea === 'Rural' ? this.formModel.panchayat : undefined,
      VillageCode: this.formModel.recommendationArea === 'Rural' ? this.formModel.village : undefined,
      TownCode: this.formModel.recommendationArea === 'Urban' ? this.formModel.town : undefined,
      FinYr: this.formModel.financialYear,
      Sector: this.formModel.recommendationArea === 'Rural' ? 'R' : 'U',
      WorkName: this.formModel.nameOfTheWork.trim(),
      UserName: this.formModel.userName,
      SchemeCode: String(this.formModel.scheme).padStart(2, '0'),
      DistrictCode: this.formModel.district,
      WorkRecptDate: this.editingId && this.selectedRecommendation
        ? ((this.selectedRecommendation as any).rawWorkRecptDate || new Date().toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0],
      AgencyId: this.formModel.executingDepartment,
      SubAgencyId: this.formModel.executingAgency,
      IsConvergence: this.formModel.convergence,
      ProposedAmt: this.formModel.proposedAmountInLacs,
    };
    const wasEditing = !!this.editingId;
    const request = this.editingId
      ? this.mlaService.updateRecommendation(this.editingId, payload, this.formModel.pdfFile || undefined)
      : this.mlaService.saveRecommendation(payload, this.formModel.pdfFile || undefined);
    request.subscribe(res => {
      if (res?.status === false) {
        this.toastr.error(res?.message || 'Recommendation was rejected by the server.');
        return;
      }
      this.toastr.success(res?.message || (wasEditing ? 'Recommendation updated.' : 'Recommendation submitted.'));
      this.editingId = null;
      this.loadRecommendations();
      this.loadMlaReport();
      this.switchScreen('list');
    }, err => {
      this.toastr.error(err?.error?.message || err?.error?.title || ('Save failed: ' + err.message));
    });
  }

  // Delete Action & Modal Handling
  promptDelete(item: RecommendationItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;
    // Call backend to delete
    const id = String((this.itemToDelete as any).backendId || this.itemToDelete.id);
    this.mlaService.deleteRecommendation(id).subscribe(response => {
      if (response?.status === false) {
        this.toastr.error(response?.message || 'Recommendation could not be deleted.');
        return;
      }
      this.toastr.info(`अनुशंसा #${this.itemToDelete!.approvalNo} को निरस्त (Deleted) चिह्नित कर दिया गया है।`);
      this.recommendations = this.recommendations.filter(r => String((r as any).backendId || r.id) !== id);
      this.itemToDelete = null;
      this.showDeleteModal = false;
      this.loadRecommendations();
      this.loadMlaReport();
    }, err => {
      this.toastr.error('डिलीट करने में त्रुटि: ' + err.message);
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  // Edit Action: pre-populate create form
  editRecommendation(item: RecommendationItem): void {
    this.editingId = String((item as any).backendId || item.id);
    this.formModel.nameOfTheWork = item.workName;
    this.formModel.proposedAmountInLacs = String(item.proposedAmount);
    this.formModel.recommendationArea = item.sector as any;
    this.formModel.financialYear = item.finYear;
    this.formModel.scheme = String((item as any).schemeCode || this.schemes.find(scheme => scheme.name === item.schemeName)?.code || '');
    this.formModel.district = (item as any).districtCode || this.formModel.district;
    if (item.sector === 'Rural') {
      this.formModel.block = (item as any).blockCode || '';
      this.formModel.panchayat = (item as any).panchayatCode || '';
      this.formModel.village = (item as any).villageCode || '';
      this.loadBlocks(this.formModel.district);
      if (this.formModel.block) this.loadGramPanchayats(this.formModel.district, this.formModel.block);
      if (this.formModel.panchayat) this.loadVillages(this.formModel.district, this.formModel.block, this.formModel.panchayat);
    } else {
      this.formModel.town = (item as any).townCode || '';
      this.loadTowns(this.formModel.district);
    }
    this.formModel.executingDepartment = (item as any).departmentId || '';
    this.formModel.executingAgency = (item as any).subAgencyId || '';
    this.loadAgencies(this.formModel.district);
    this.formModel.convergence = item.convergence as any;
    this.formModel.pdfFileName = item.pdfFileName || '';
    this.toastr.info(`संपादन हेतु फॉर्म लोड किया गया: ${item.workName}`);
    this.switchScreen('create');
  }

  // PDF Preview Action
  openPdfModal(item: RecommendationItem): void {
    this.itemToViewPdf = item;
    this.showPdfModal = true;
    this.isLoadingPdf = true;
    this.pdfLoadError = '';
    this.mlaService.fetchPdf(String((item as any).backendId || item.id)).subscribe({
      next: (blob: Blob) => {
        this.isLoadingPdf = false;
        if (this.pdfObjectUrl) URL.revokeObjectURL(this.pdfObjectUrl);
        this.pdfObjectUrl = URL.createObjectURL(blob);
        this.pdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfObjectUrl);
      },
      error: error => {
        this.isLoadingPdf = false;
        this.pdfLoadError = error?.error?.message || 'PDF could not be fetched.';
        this.toastr.error(error?.error?.message || 'PDF could not be fetched.');
      }
    });
  }

  closePdfModal(): void {
    this.showPdfModal = false;
    this.itemToViewPdf = null;
    if (this.pdfObjectUrl) URL.revokeObjectURL(this.pdfObjectUrl);
    this.pdfObjectUrl = null;
    this.pdfSafeUrl = null;
    this.pdfLoadError = '';
  }


  printPdf(): void {
    window.print();
  }


  // File selection handler for PDF upload
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.toastr.warning('कृपया केवल PDF फ़ाइल अपलोड करें।');
        return;
      }
      this.formModel.pdfFile = file;
      this.formModel.pdfFileName = file.name;
    }
  }

  // Remove selected PDF file
  removeSelectedFile(): void {
    this.formModel.pdfFile = null;
    this.formModel.pdfFileName = '';
  }

  // Reset the create-recommendation form
  resetForm(): void {
    this.editingId = null;
    this.formModel.nameOfTheWork = '';
    this.formModel.proposedAmountInLacs = '';
    this.formModel.financialYear = this.selectedFinYear;
    this.formModel.recommendationArea = 'Rural';
    this.formModel.block = '';
    this.formModel.panchayat = '';
    this.formModel.village = '';
    this.formModel.town = '';
    this.formModel.executingDepartment = '';
    this.formModel.executingAgency = '';
    this.agencies = [];
    this.formModel.convergence = 'No';
    this.formModel.pdfFile = null;
    this.formModel.pdfFileName = '';
  }

  // Filtered recommendations list
  get filteredRecommendations(): RecommendationItem[] {
    let result = this.recommendations;

    if (this.selectedFilter === 'pending') {
      result = result.filter((r: RecommendationItem) => r.workStatus === 'Pending');
    } else if (this.selectedFilter === 'approved') {
      result = result.filter((r: RecommendationItem) => r.workStatus === 'Approved');
    } else if (this.selectedFilter === 'deleted') {
      result = result.filter((r: RecommendationItem) => r.workStatus === 'Deleted');
    }

    if (this.listSearchQuery && this.listSearchQuery.trim()) {
      const q = this.listSearchQuery.toLowerCase().trim();
      result = result.filter((r: RecommendationItem) =>
        r.workName.toLowerCase().includes(q) ||
        (r.workNameHi && r.workNameHi.toLowerCase().includes(q)) ||
        r.approvalNo.toLowerCase().includes(q) ||
        r.finYear.toLowerCase().includes(q) ||
        r.districtName.toLowerCase().includes(q)
      );
    }

    return result;
  }
}

