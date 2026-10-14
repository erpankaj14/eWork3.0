import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  selectedFinYear = '2025-26';
  finYearOptions = ['2025-26', '2026-27', '2024-25'];

  // Dashboard Stats matching screenshots
  dashboardStats = {
    totalAllocated: '500.00000',
    availableAmount: '400.43631',
    noOfCcWork: '-',
    noOfProposedWork: '25',
    noOfFsWork: '12',
    fsAmount: '99.56369',
    mlaName: 'डॉ. प्रेमचंद बैरवा (Hon\'ble MLA)',
    constName: 'दूदू (Dudu) / 16',
    aNo: '16'
  };

  // Create Recommendation Form Model
  formModel = {
    userName: '16-050',
    financialYear: '2025-26',
    recommendationArea: 'Rural' as 'Rural' | 'Urban',
    nameOfTheWork: '',
    proposedAmountInLacs: '',
    scheme: 'विधायक स्थानीय क्षेत्र विकास योजना',
    district: 'जयपुर',
    block: '',
    panchayat: '',
    village: '',
    town: '',
    executingDepartment: 'आयुर्वेद विभाग',
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

  // Active item in Detailed View
  selectedRecommendation: RecommendationItem | null = null;

  // Initial Sample Recommendation Records matching Image 1
  recommendations: RecommendationItem[] = [
    {
      id: 1,
      workName: 'Road Construction Work Urban',
      workNameHi: 'सड़क निर्माण कार्य (शहरी)',
      finYear: '2025-26',
      date: '2025-08-28',
      mlaName: 'डॉ. प्रेमचंद बैरवा',
      userName: '16-050',
      workStatus: 'Pending',
      workId: '-',
      isConversion: 'No',
      proposedAmount: 12.0,
      schemeName: 'विधायक स्थानीय क्षेत्र विकास योजना',
      approvalNo: '2025-26/16-050/4',
      sector: 'Rural',
      districtName: 'जयपुर',
      blockName: 'जोड़ी',
      panchayatName: 'जोड़ी',
      villageName: 'जोड़ी',
      executingDept: 'आयुर्वेद विभाग',
      executingAgency: 'अधिशाषी अभियंता आयुर्वेद',
      convergence: 'No',
      pdfFileName: 'Road_Construction_Work_Proposal.pdf',
      pdfFileSize: '1.4 MB',
      revertRequested: '-',
      deletedStatus: '-',
      revertCompleted: '-',
      platformThrough: 'Web & Mobile'
    },
    {
      id: 2,
      workName: 'Drinking Water Supply at Govt Schools',
      workNameHi: 'राजकीय विद्यालयों में पेयजल आपूर्ति संयंत्र',
      finYear: '2025-26',
      date: '2025-08-28',
      mlaName: 'डॉ. प्रेमचंद बैरवा',
      userName: '16-050',
      workStatus: 'Pending',
      workId: 'WRK-2025-8842',
      isConversion: 'No',
      proposedAmount: 8.5,
      schemeName: 'विधायक स्थानीय क्षेत्र विकास योजना',
      approvalNo: '2025-26/16-050/3',
      sector: 'Rural',
      districtName: 'जयपुर',
      blockName: 'चाकसू',
      panchayatName: 'चाकसू ग्रामीण',
      villageName: 'मोहनपुरा',
      executingDept: 'जन स्वास्थ्य अभियांत्रिकी विभाग (PHED)',
      executingAgency: 'सहायक अभियंता PHED',
      convergence: 'No',
      pdfFileName: 'Water_Supply_Govt_School.pdf',
      pdfFileSize: '980 KB',
      revertRequested: '-',
      deletedStatus: '-',
      revertCompleted: '-',
      platformThrough: 'Web & Mobile'
    },
    {
      id: 3,
      workName: 'Community Hall Construction Work',
      workNameHi: 'सामुदायिक भवन निर्माण कार्य',
      finYear: '2025-26',
      date: '2025-08-28',
      mlaName: 'डॉ. प्रेमचंद बैरवा',
      userName: '16-050',
      workStatus: 'Approved',
      workId: 'WRK-2025-9103',
      isConversion: 'No',
      proposedAmount: 15.0,
      schemeName: 'विधायक स्थानीय क्षेत्र विकास योजना',
      approvalNo: '2025-26/16-050/2',
      sector: 'Rural',
      districtName: 'जयपुर',
      blockName: 'बस्सी',
      panchayatName: 'तुंगा',
      villageName: 'रामपुरा',
      executingDept: 'पंचायती राज विभाग',
      executingAgency: 'विकास अधिकारी (BDO)',
      convergence: 'Yes',
      pdfFileName: 'Community_Hall_Tunga.pdf',
      pdfFileSize: '2.1 MB',
      revertRequested: '-',
      deletedStatus: '-',
      revertCompleted: '-',
      platformThrough: 'Web & Mobile'
    },
    {
      id: 4,
      workName: 'CC Road Construction & Drainage',
      workNameHi: 'सीसी रोड निर्माण एवं जल निकासी नाली कार्य',
      finYear: '2025-26',
      date: '2025-08-28',
      mlaName: 'डॉ. प्रेमचंद बैरवा',
      userName: '16-050',
      workStatus: 'Deleted',
      workId: '-',
      isConversion: 'No',
      proposedAmount: 10.0,
      schemeName: 'विधायक स्थानीय क्षेत्र विकास योजना',
      approvalNo: '2025-26/16-050/1',
      sector: 'Urban',
      districtName: 'जयपुर',
      townName: 'Jaipur (M Corp.) (Part)',
      executingDept: 'सार्वजनिक निर्माण विभाग (PWD)',
      executingAgency: 'अधिशाषी अभियंता PWD',
      convergence: 'No',
      pdfFileName: 'CC_Road_Drainage_Proposal.pdf',
      pdfFileSize: '1.1 MB',
      revertRequested: '-',
      deletedStatus: 'Yes',
      revertCompleted: '-',
      platformThrough: 'Web & Mobile'
    }
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(session => {
      this.user = session || this.authService.getCurrentUser();
    });

    // Get district code from logged-in user (same as plan-create)
    const user = this.authService.getCurrentUser();
    const districtCode = user?.districtCode || '12';
    this.formModel.district = districtCode;

    // Load departments and agencies for the user's district
    this.loadDepartments(districtCode);
    this.loadAgencies(districtCode);
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
        const item = this.recommendations.find(r => r.id === Number(params['id']));
        if (item) {
          this.selectedRecommendation = item;
          this.activeScreen = 'detail';
        }
      }
    });
    if (!this.selectedRecommendation && this.recommendations.length > 0) {
      this.selectedRecommendation = this.recommendations[0];
    }
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
    // Placeholder for any logic when financial year changes.
  }

  // ─── Master Data Loading (same pattern as plan-create) ─────────────────

  loadDepartments(districtCode: string): void {
    if (!districtCode) { this.departments = []; return; }
    this.mlaService.getDepartment(districtCode).subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
        this.departments = items.map((d: any, i: number) => ({
          id: d.deptId || d.departmentId || d.deptCode || d.id || (i + 1),
          name: d.deptNameE || d.departmentName || d.deptName || d.name || ''
        })).filter((d: any) => d.name);
      },
      error: () => { this.departments = []; }
    });
  }

  loadAgencies(districtCode: string): void {
    if (!districtCode) { this.agencies = []; return; }
    this.mlaService.getAgency(districtCode, '6').subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
        this.agencies = items.map((a: any, i: number) => ({
          id: a.agencyId || a.agencyCode || a.id || (i + 1),
          name: a.agencyNameE || a.agencyName || a.name || ''
        })).filter((a: any) => a.name);
      },
      error: () => { this.agencies = []; }
    });
  }

  loadBlocks(districtCode: string): void {
    if (!districtCode) { this.blocks = []; return; }
    this.mlaService.getBlocks(districtCode).subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
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
        const items = Array.isArray(res) ? res : (res?.data || []);
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
        const items = Array.isArray(res) ? res : (res?.data || []);
        this.villages = items.map((v: any) => ({
          code: String(v.villageCode || v.VillageCode || v.code || ''),
          name: v.villageNameE || v.VillageNameE || v.villageName || v.name || ''
        })).filter((v: any) => v.code && v.name);
      },
      error: () => { this.villages = []; }
    });
  }

  loadTowns(districtCode: string): void {
    if (!districtCode) { this.towns = []; return; }
    this.mlaService.getTown(districtCode).subscribe({
      next: (res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
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
    const districtCode = this.formModel.district || this.authService.getCurrentUser()?.districtCode || '12';
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
      const districtCode = this.formModel.district || this.authService.getCurrentUser()?.districtCode || '12';
      this.loadGramPanchayats(districtCode, this.formModel.block);
    }
  }

  onPanchayatChange(): void {
    this.formModel.village = '';
    this.villages = [];
    if (this.formModel.panchayat) {
      const districtCode = this.formModel.district || this.authService.getCurrentUser()?.districtCode || '12';
      this.loadVillages(districtCode, this.formModel.block, this.formModel.panchayat);
    }
  }

  submitRecommendation(): void {
    if (!this.formModel.nameOfTheWork.trim()) {
      this.toastr.warning('कृपया कार्य का नाम दर्ज करें (Please enter Name of the work).');
      return;
    }
    if (!this.formModel.proposedAmountInLacs || Number(this.formModel.proposedAmountInLacs) <= 0) {
      this.toastr.warning('कृपया मान्य प्रस्तावित राशि दर्ज करें (Please enter valid Proposed Amount).');
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
      Sector: this.formModel.recommendationArea,
      WorkName: this.formModel.nameOfTheWork.trim(),
      UserName: this.formModel.userName,
      SchemeCode: this.formModel.scheme,
      DistrictCode: this.formModel.district,
      WorkRecptDate: new Date().toISOString().split('T')[0],
      AgencyId: this.formModel.executingAgency,
      SubAgencyId: this.formModel.executingDepartment,
      IsConvergence: this.formModel.convergence,
      ProposedAmt: this.formModel.proposedAmountInLacs,
    };
    this.mlaService.saveRecommendation(payload, this.formModel.pdfFile || undefined).subscribe(res => {
      // Assuming backend returns the saved recommendation object
      const saved: RecommendationItem = res?.data || payload as any;
      // Push to local list for immediate UI feedback
      this.recommendations.unshift(saved);
      this.selectedRecommendation = saved;
      this.toastr.success('अनुशंसा सफलतापुर्वक सहेजी गई!');
      this.switchScreen('detail', saved);
    }, err => {
      this.toastr.error('सहेजने में त्रुटि: ' + err.message);
    });
    // Reset form fields locally
    this.formModel.nameOfTheWork = '';
    this.formModel.proposedAmountInLacs = '';
    this.formModel.pdfFile = null;
    this.formModel.pdfFileName = '';
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
    this.mlaService.deleteRecommendation(this.itemToDelete.id.toString()).subscribe(() => {
      this.itemToDelete!.workStatus = 'Deleted';
      this.itemToDelete!.deletedStatus = 'Yes';
      this.toastr.info(`अनुशंसा #${this.itemToDelete!.approvalNo} को निरस्त (Deleted) चिह्नित कर दिया गया है।`);
      // Remove from local array
      this.recommendations = this.recommendations.filter(r => r.id !== this.itemToDelete!.id);
      this.itemToDelete = null;
      this.showDeleteModal = false;
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
    this.formModel.nameOfTheWork = item.workName;
    this.formModel.proposedAmountInLacs = String(item.proposedAmount);
    this.formModel.recommendationArea = item.sector as any;
    this.formModel.financialYear = item.finYear;
    this.formModel.district = item.districtName;
    if (item.sector === 'Rural') {
      this.formModel.block = item.blockName || '';
      this.formModel.panchayat = item.panchayatName || '';
      this.formModel.village = item.villageName || '';
    } else {
      this.formModel.town = item.townName || '';
    }
    this.formModel.executingDepartment = item.executingDept;
    this.formModel.executingAgency = item.executingAgency;
    this.formModel.convergence = item.convergence as any;
    this.formModel.pdfFileName = item.pdfFileName || '';
    // Call backend to fetch latest data if needed (optional)
    this.mlaService.fetchMlaIndividualReport(item.userName, item.finYear, '0', '16').subscribe();
    this.toastr.info(`संपादन हेतु फॉर्म लोड किया गया: ${item.workName}`);
    this.switchScreen('create');
  }

  // PDF Preview Action
  openPdfModal(item: RecommendationItem): void {
    this.itemToViewPdf = item;
    this.showPdfModal = true;
  }

  closePdfModal(): void {
    this.showPdfModal = false;
    this.itemToViewPdf = null;
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
    this.formModel.nameOfTheWork = '';
    this.formModel.proposedAmountInLacs = '';
    this.formModel.recommendationArea = 'Rural';
    this.formModel.block = '';
    this.formModel.panchayat = '';
    this.formModel.village = '';
    this.formModel.town = '';
    this.formModel.executingDepartment = 'आयुर्वेद विभाग';
    this.formModel.executingAgency = '';
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
