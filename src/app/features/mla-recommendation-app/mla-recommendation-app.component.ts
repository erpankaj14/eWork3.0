import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../core/services/language.service';
import { AuthService, UserSession } from '../../core/services/auth.service';

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

  // Dropdown Master Data
  districts = ['जयपुर', 'दौसा', 'अजमेर', 'जोधपुर', 'अलवर', 'कोटा', 'बीकानेर', 'उदयपुर'];
  blocks = ['जोड़ी', 'बस्सी', 'चाकसू', 'आमेर', 'सांगानेर', 'जमवारामगढ़', 'कोटपूतली', 'दूदू'];
  panchayats = ['जोड़ी', 'कुकस', 'चंदवाजी', 'बस्सी ग्रामीण', 'तुंगा', 'फागी'];
  villages = ['जोड़ी', 'कुकस कलां', 'कुकस खुर्द', 'मोहनपुरा', 'रामपुरा'];
  towns = ['Jaipur (M Corp.) (Part)', 'Sanganer Town', 'Chaksu (M)', 'Bagru Town', 'Kotputli (M)'];
  departments = [
    'आयुर्वेद विभाग',
    'सार्वजनिक निर्माण विभाग (PWD)',
    'पंचायती राज विभाग',
    'जन स्वास्थ्य अभियांत्रिकी विभाग (PHED)',
    'चिकित्सा एवं स्वास्थ्य विभाग',
    'शिक्षा विभाग (माध्यमिक/प्रारंभिक)',
    'जल संसाधन विभाग'
  ];
  agencies = [
    'अधिशाषी अभियंता आयुर्वेद',
    'अधिशाषी अभियंता PWD',
    'विकास अधिकारी (BDO)',
    'सहायक अभियंता PHED',
    'अधिशाषी अधिकारी (नगर पालिका)',
    'कनिष्ठ अभियंता पंचायती राज'
  ];

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

    // Check route parameter :view (e.g., /portal/mla-recommendation-app/create or /portal/mla-recommendation-app/list)
    this.route.params.subscribe(params => {
      if (params['view']) {
        const v = params['view'].toLowerCase();
        if (['create', 'list', 'detail', 'dashboard'].includes(v)) {
          this.activeScreen = v as any;
        }
      }
    });

    // Check query params: ?tab=create, ?tab=list, ?id=1
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

    // Default detailed recommendation
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
    if (this.selectedFinYear === '2026-27') {
      this.dashboardStats.totalAllocated = '600.00000';
      this.dashboardStats.availableAmount = '520.10000';
      this.dashboardStats.noOfProposedWork = '18';
      this.dashboardStats.noOfFsWork = '9';
      this.dashboardStats.fsAmount = '79.90000';
    } else if (this.selectedFinYear === '2024-25') {
      this.dashboardStats.totalAllocated = '500.00000';
      this.dashboardStats.availableAmount = '45.12000';
      this.dashboardStats.noOfProposedWork = '32';
      this.dashboardStats.noOfFsWork = '28';
      this.dashboardStats.fsAmount = '454.88000';
    } else {
      this.dashboardStats.totalAllocated = '500.00000';
      this.dashboardStats.availableAmount = '400.43631';
      this.dashboardStats.noOfProposedWork = '25';
      this.dashboardStats.noOfFsWork = '12';
      this.dashboardStats.fsAmount = '99.56369';
    }
    this.formModel.financialYear = this.selectedFinYear;
  }

  onAreaChange(area: 'Rural' | 'Urban'): void {
    this.formModel.recommendationArea = area;
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.toastr.warning('फ़ाइल का आकार 2MB से अधिक नहीं होना चाहिए (File size must not exceed 2MB).');
        return;
      }
      this.formModel.pdfFile = file;
      this.formModel.pdfFileName = file.name;
      this.toastr.info(`फ़ाइल संलग्न की गई: ${file.name}`);
    }
  }

  removeSelectedFile(): void {
    this.formModel.pdfFile = null;
    this.formModel.pdfFileName = '';
  }

  resetForm(): void {
    this.formModel.nameOfTheWork = '';
    this.formModel.proposedAmountInLacs = '';
    this.formModel.block = '';
    this.formModel.panchayat = '';
    this.formModel.village = '';
    this.formModel.town = '';
    this.formModel.executingAgency = '';
    this.formModel.convergence = 'No';
    this.formModel.pdfFile = null;
    this.formModel.pdfFileName = '';
    this.toastr.info('फॉर्म रीसेट कर दिया गया है।');
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

    if (this.formModel.recommendationArea === 'Rural') {
      if (!this.formModel.block) {
        this.toastr.warning('कृपया ब्लॉक का चयन करें (Please select Block).');
        return;
      }
    } else {
      if (!this.formModel.town) {
        this.toastr.warning('कृपया शहर/कस्बे का चयन करें (Please select Town).');
        return;
      }
    }

    const newId = this.recommendations.length + 1;
    const approvalNumber = `${this.formModel.financialYear}/16-050/${newId}`;
    const today = new Date().toISOString().split('T')[0];

    const newItem: RecommendationItem = {
      id: newId,
      workName: this.formModel.nameOfTheWork.trim(),
      workNameHi: this.formModel.nameOfTheWork.trim(),
      finYear: this.formModel.financialYear,
      date: today,
      mlaName: this.dashboardStats.mlaName,
      userName: this.formModel.userName,
      workStatus: 'Pending',
      workId: `WRK-2025-0${Math.floor(100 + Math.random() * 900)}`,
      isConversion: 'No',
      proposedAmount: parseFloat(this.formModel.proposedAmountInLacs),
      schemeName: this.formModel.scheme,
      approvalNo: approvalNumber,
      sector: this.formModel.recommendationArea,
      districtName: this.formModel.district,
      blockName: this.formModel.recommendationArea === 'Rural' ? (this.formModel.block || 'जोड़ी') : undefined,
      panchayatName: this.formModel.recommendationArea === 'Rural' ? (this.formModel.panchayat || 'जोड़ी') : undefined,
      villageName: this.formModel.recommendationArea === 'Rural' ? (this.formModel.village || 'जोड़ी') : undefined,
      townName: this.formModel.recommendationArea === 'Urban' ? (this.formModel.town || 'Jaipur (M Corp.)') : undefined,
      executingDept: this.formModel.executingDepartment,
      executingAgency: this.formModel.executingAgency || 'अधिशाषी अभियंता आयुर्वेद',
      convergence: this.formModel.convergence,
      pdfFileName: this.formModel.pdfFileName || 'Recommendation_Document.pdf',
      pdfFileSize: '1.2 MB',
      revertRequested: '-',
      deletedStatus: '-',
      revertCompleted: '-',
      platformThrough: 'Web Portal'
    };

    this.recommendations.unshift(newItem);
    this.selectedRecommendation = newItem;

    // Increment proposed count
    const count = parseInt(this.dashboardStats.noOfProposedWork) || 25;
    this.dashboardStats.noOfProposedWork = String(count + 1);

    this.toastr.success(`अनुशंसा क्रमांक #${approvalNumber} सफलतापूर्वक दर्ज की गई!`);

    // Reset form
    this.formModel.nameOfTheWork = '';
    this.formModel.proposedAmountInLacs = '';
    this.formModel.pdfFile = null;
    this.formModel.pdfFileName = '';

    // Switch to detail
    this.switchScreen('detail', newItem);
  }

  // Delete Action & Modal Handling
  promptDelete(item: RecommendationItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;

    this.itemToDelete.workStatus = 'Deleted';
    this.itemToDelete.deletedStatus = 'Yes';
    this.showDeleteModal = false;

    this.toastr.info(`अनुशंसा #${this.itemToDelete.approvalNo} को निरस्त (Deleted) चिह्नित कर दिया गया है।`);
    this.itemToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  // Edit Action: pre-populate create form
  editRecommendation(item: RecommendationItem): void {
    this.formModel.nameOfTheWork = item.workName;
    this.formModel.proposedAmountInLacs = String(item.proposedAmount);
    this.formModel.recommendationArea = item.sector;
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
    this.formModel.convergence = item.convergence;
    this.formModel.pdfFileName = item.pdfFileName || '';

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

  // Filtered recommendations list
  get filteredRecommendations(): RecommendationItem[] {
    let result = this.recommendations;

    if (this.selectedFilter === 'pending') {
      result = result.filter(r => r.workStatus === 'Pending');
    } else if (this.selectedFilter === 'approved') {
      result = result.filter(r => r.workStatus === 'Approved');
    } else if (this.selectedFilter === 'deleted') {
      result = result.filter(r => r.workStatus === 'Deleted');
    }

    if (this.listSearchQuery.trim()) {
      const q = this.listSearchQuery.toLowerCase().trim();
      result = result.filter(r =>
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
