import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { CountUpDirective } from '../../shared/directives/count-up.directive';


export interface SchemeProgressRow {
  sno: number;
  name: string;
  nameHi: string;
  sanctioned: number;
  completed: number;
  incomplete: number;
  percent: number;
}

export interface CategoryProgressRow {
  sno: number;
  name: string;
  nameHi: string;
  sanctioned: number;
  completed: number;
  incomplete: number;
  percent: number;
}

export interface DeptProgressRow {
  sno: number;
  name: string;
  nameHi: string;
  sanctioned: number;
  completed: number;
  incomplete: number;
  percent: number;
}

export interface SchemeExpenditureRow {
  sno: number;
  name: string;
  nameHi: string;
  sanctionedAmt: number;
  expenditureAmt: number;
  balanceAmt: number;
}

export interface BlockProgressRow {
  sno: number;
  block: string;
  blockHi: string;
  sanctioned: number;
  completed: number;
  incomplete: number;
  progressRate: number;
}

export interface MlaDetailRow {
  sno: number;
  mlaName: string;
  mlaNameHi: string;
  constituency: string;
  constituencyHi: string;
  proposed: number;
  sanctionedWorks: number;
  completedWorks: number;
  availableAmt: number;
  sanctionedAmt: number;
  balanceAmt: number;
}

@Component({
  selector: 'app-work-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, CountUpDirective],
  templateUrl: './work-monitoring.component.html',
  styleUrls: ['./work-monitoring.component.css']
})
export class WorkMonitoringComponent implements OnInit {
  // Filters matching image
  fromYear = '2026-27';
  toYear = '2026-27';
  selectedDistrict = 'JAIPUR';
  selectedBlock = '--All--';
  selectedSchemeFilter = 'MLA-LAD';
  selectedAssembly = '16';
  searchMla = '';

  yearsList = ['2024-25', '2025-26', '2026-27'];
  districtsList = ['JAIPUR', 'JODHPUR', 'UDAIPUR', 'AJMER', 'KOTA', 'BIKANER'];
  blocksList = ['--All--', 'AMER', 'GOVINDGARH', 'BASSI', 'PHAGI', 'DUDU', 'KOTPUTLI', 'PAOTA', 'SAMBHAR', 'CHAKSU', 'JHOTWARA', 'JAMWARAMGARH'];
  assemblyList = ['16', '15', '14'];

  // Active Scheme Tab in middle section
  activeSchemeTab = 'MLALAD';
  schemeTabs = [
    { id: 'SBM-JJM', label: 'SBM-JJM', count: '12' },
    { id: 'MLALAD', label: 'MLALAD', count: '50' },
    { id: 'MPLAD', label: 'MPLAD', count: '8' },
    { id: 'MMVY', label: 'MMVY', count: '22' },
    { id: 'MAGRA', label: 'MAGRA', count: '0' },
    { id: 'MGMV', label: 'MGMV', count: '14' }
  ];

  // View switchers for the 4 analytics boxes
  box1View: 'table' | 'chart' = 'table';
  box2View: 'table' | 'chart' = 'table';
  box3View: 'table' | 'chart' = 'table';
  box4View: 'table' | 'chart' = 'table';

  // KPI Metrics matching the 6 circular cards
  kpiCards = [
    {
      id: 'sanctioned_works',
      label: 'Sanctioned Works',
      labelHi: 'स्वीकृत कार्य',
      value: 50,
      isCurrency: false,
      colorClass: 'emerald',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      trend: '+12% this month'
    },
    {
      id: 'completed_works',
      label: 'Completed Works',
      labelHi: 'पूर्ण कार्य',
      value: 0,
      isCurrency: false,
      colorClass: 'purple',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      trend: 'In Progress'
    },
    {
      id: 'incomplete_works',
      label: 'Incomplete Works',
      labelHi: 'अपूर्ण कार्य',
      value: 50,
      isCurrency: false,
      colorClass: 'orange',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      trend: 'Action Required'
    },
    {
      id: 'sanctioned_amt',
      label: 'Sanctioned Amt (Lakhs)',
      labelHi: 'स्वीकृत राशि (लाखों में)',
      value: 587.00,
      isCurrency: true,
      colorClass: 'cyan',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      trend: '₹5.87 Crore'
    },
    {
      id: 'expenditure_amt',
      label: 'Expenditure Amt (Lakhs)',
      labelHi: 'व्यय राशि (लाखों में)',
      value: 0.00,
      isCurrency: true,
      colorClass: 'rose',
      icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z',
      trend: '0.0% Utilized'
    },
    {
      id: 'balance_amt',
      label: 'Balance Amt (Lakhs)',
      labelHi: 'बचत राशि (लाखों में)',
      value: 587.00,
      isCurrency: true,
      colorClass: 'amber',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      trend: '100% Available'
    }
  ];

  // Box 1: Scheme-wise Incomplete Works FY 2026-27
  schemeIncompleteWorks: SchemeProgressRow[] = [
    { sno: 1, name: 'MLA-LAD', nameHi: 'एमएलएएलएडी', sanctioned: 28, completed: 0, incomplete: 28, percent: 56 },
    { sno: 2, name: 'MP-LAD', nameHi: 'एमपीएलएडी', sanctioned: 0, completed: 0, incomplete: 0, percent: 0 },
    { sno: 3, name: 'MMVY', nameHi: 'एमएमवीवाई', sanctioned: 22, completed: 0, incomplete: 22, percent: 44 },
    { sno: 4, name: 'SFC / TFC', nameHi: 'एसएफसी/टीएफसी', sanctioned: 0, completed: 0, incomplete: 0, percent: 0 },
    { sno: 5, name: 'BRGF / Others', nameHi: 'बीआरजीएफ/अन्य', sanctioned: 0, completed: 0, incomplete: 0, percent: 0 }
  ];

  // Box 2: Category-wise Incomplete Works FY 2026-27
  categoryIncompleteWorks: CategoryProgressRow[] = [
    { sno: 1, name: 'Other Public Facilities', nameHi: 'अन्य सार्वजनिक सुविधाएँ', sanctioned: 9, completed: 0, incomplete: 9, percent: 18 },
    { sno: 2, name: 'Anganwadi Building', nameHi: 'आंगनबाड़ी भवन', sanctioned: 33, completed: 0, incomplete: 33, percent: 66 },
    { sno: 3, name: 'Office Room / Building', nameHi: 'कार्यालय भवन/कक्ष', sanctioned: 6, completed: 0, incomplete: 6, percent: 12 },
    { sno: 4, name: 'CC Road / Street', nameHi: 'सीसी रोड / सड़क', sanctioned: 1, completed: 0, incomplete: 1, percent: 2 },
    { sno: 5, name: 'Non-Conventional Energy', nameHi: 'गैर-पारंपरिक ऊर्जा स्रोत', sanctioned: 1, completed: 0, incomplete: 1, percent: 2 }
  ];

  // Box 3: Department-wise Incomplete Works FY 2026-27
  deptIncompleteWorks: DeptProgressRow[] = [
    { sno: 1, name: 'Ayurveda Department', nameHi: 'आयुर्वेद विभाग', sanctioned: 0, completed: 0, incomplete: 0, percent: 0 },
    { sno: 2, name: 'Sports & Youth Affairs', nameHi: 'खेल कूद युवा मामले', sanctioned: 0, completed: 0, incomplete: 0, percent: 0 },
    { sno: 3, name: 'Medical Department', nameHi: 'चिकित्सा विभाग', sanctioned: 1, completed: 0, incomplete: 1, percent: 2 },
    { sno: 4, name: 'Public Health Eng. (PHED)', nameHi: 'जन स्वास्थ्य अभि. विभाग', sanctioned: 1, completed: 0, incomplete: 1, percent: 2 },
    { sno: 5, name: 'Forest Resources Dept', nameHi: 'वन संसाधन विभाग', sanctioned: 0, completed: 0, incomplete: 0, percent: 0 },
    { sno: 6, name: 'Samagra Shiksha (Education)', nameHi: 'समग्र शिक्षा', sanctioned: 48, completed: 0, incomplete: 48, percent: 96 }
  ];

  // Box 4: Scheme-wise Financial Expenditure FY 2026-27 (₹ in Lakhs)
  schemeExpenditures: SchemeExpenditureRow[] = [
    { sno: 1, name: 'MLA-LAD', nameHi: 'एमएलएएलएडी', sanctionedAmt: 0.00000, expenditureAmt: 0.00, balanceAmt: 0.00000 },
    { sno: 2, name: 'MP-LAD', nameHi: 'एमपीएलएडी', sanctionedAmt: 234.97800, expenditureAmt: 0.00, balanceAmt: 234.97800 },
    { sno: 3, name: 'MMVY', nameHi: 'एमएमवीवाई', sanctionedAmt: 0.00000, expenditureAmt: 0.00, balanceAmt: 0.00000 },
    { sno: 4, name: 'SFC / TFC', nameHi: 'एसएफसी/टीएफसी', sanctionedAmt: 352.02200, expenditureAmt: 0.00, balanceAmt: 352.02200 }
  ];

  // Scheme Block-wise Physical Progress (Jaipur 12 Blocks)
  blockProgressData: BlockProgressRow[] = [
    { sno: 1, block: 'Amer', blockHi: 'आमेर', sanctioned: 6, completed: 0, incomplete: 6, progressRate: 0 },
    { sno: 2, block: 'Govindgarh', blockHi: 'गोविंदगढ़', sanctioned: 5, completed: 0, incomplete: 5, progressRate: 0 },
    { sno: 3, block: 'Bassi', blockHi: 'बस्सी', sanctioned: 8, completed: 0, incomplete: 8, progressRate: 0 },
    { sno: 4, block: 'Phagi', blockHi: 'फागी', sanctioned: 4, completed: 0, incomplete: 4, progressRate: 0 },
    { sno: 5, block: 'Dudu', blockHi: 'दूदू', sanctioned: 1, completed: 0, incomplete: 1, progressRate: 0 },
    { sno: 6, block: 'Kotputli', blockHi: 'कोटपूतली', sanctioned: 7, completed: 0, incomplete: 7, progressRate: 0 },
    { sno: 7, block: 'Paota', blockHi: 'पावटा', sanctioned: 6, completed: 0, incomplete: 6, progressRate: 0 },
    { sno: 8, block: 'Sambhar', blockHi: 'सांभर', sanctioned: 1, completed: 0, incomplete: 1, progressRate: 0 },
    { sno: 9, block: 'Chaksu', blockHi: 'चाकसू', sanctioned: 5, completed: 0, incomplete: 5, progressRate: 0 },
    { sno: 10, block: 'Jhotwara', blockHi: 'झोटवाड़ा', sanctioned: 1, completed: 0, incomplete: 1, progressRate: 0 },
    { sno: 11, block: 'Jamwaramgarh', blockHi: 'जमवारामगढ़', sanctioned: 2, completed: 0, incomplete: 2, progressRate: 0 },
    { sno: 12, block: 'Sambhar Lake', blockHi: 'सांभर लेक', sanctioned: 4, completed: 0, incomplete: 4, progressRate: 0 }
  ];

  // Scheme & MLA Work Details Section Table Data (Matching image 100%)
  mlaWorkDetails: MlaDetailRow[] = [
    {
      sno: 1,
      mlaName: 'Shri Amin Khan',
      mlaNameHi: 'श्री अमीन खान',
      constituency: 'Sheopur',
      constituencyHi: 'श्योपुर',
      proposed: 51,
      sanctionedWorks: 14,
      completedWorks: 0,
      availableAmt: 1500.00000,
      sanctionedAmt: 136.41886,
      balanceAmt: 1363.58114
    },
    {
      sno: 2,
      mlaName: 'Shri Dev Ram',
      mlaNameHi: 'श्री देव राम',
      constituency: 'Dudu',
      constituencyHi: 'दूदू',
      proposed: 133,
      sanctionedWorks: 112,
      completedWorks: 4,
      availableAmt: 1500.00000,
      sanctionedAmt: 655.21839,
      balanceAmt: 844.78161
    },
    {
      sno: 3,
      mlaName: 'Smt. Diya Kumari',
      mlaNameHi: 'श्री दिया कुमारी',
      constituency: 'Chomu',
      constituencyHi: 'चौमू',
      proposed: 174,
      sanctionedWorks: 114,
      completedWorks: 57,
      availableAmt: 1500.00000,
      sanctionedAmt: 633.21839,
      balanceAmt: 866.78161
    },
    {
      sno: 4,
      mlaName: 'Shri Amin Khanmi',
      mlaNameHi: 'श्री अमीन खानमी',
      constituency: 'Sikrai',
      constituencyHi: 'सिकराय',
      proposed: 28,
      sanctionedWorks: 17,
      completedWorks: 0,
      availableAmt: 1500.00000,
      sanctionedAmt: 373.61859,
      balanceAmt: 1126.38141
    },
    {
      sno: 5,
      mlaName: 'Shri Kuldeep',
      mlaNameHi: 'श्री कुलदीप',
      constituency: 'Viratnagar',
      constituencyHi: 'विराटनगर',
      proposed: 117,
      sanctionedWorks: 115,
      completedWorks: 24,
      availableAmt: 1500.00000,
      sanctionedAmt: 889.79905,
      balanceAmt: 610.20095
    },
    {
      sno: 6,
      mlaName: 'Shri Babulal Nagar',
      mlaNameHi: 'श्री बाबूलाल नागर',
      constituency: 'Dudu',
      constituencyHi: 'दूदू',
      proposed: 135,
      sanctionedWorks: 135,
      completedWorks: 4,
      availableAmt: 1500.00000,
      sanctionedAmt: 935.34665,
      balanceAmt: 564.65335
    },
    {
      sno: 7,
      mlaName: 'Shri Kalicharan Saraf',
      mlaNameHi: 'श्री कालीचरण सराफ',
      constituency: 'Malviya Nagar',
      constituencyHi: 'मालवीय नगर',
      proposed: 85,
      sanctionedWorks: 71,
      completedWorks: 6,
      availableAmt: 1500.00000,
      sanctionedAmt: 1159.26385,
      balanceAmt: 340.73615
    },
    {
      sno: 8,
      mlaName: 'Shri Gopal Sharma',
      mlaNameHi: 'श्री गोपाल शर्मा',
      constituency: 'Civil Lines',
      constituencyHi: 'सिविल लाइंस',
      proposed: 90,
      sanctionedWorks: 52,
      completedWorks: 1,
      availableAmt: 1500.00000,
      sanctionedAmt: 928.43702,
      balanceAmt: 571.56298
    },
    {
      sno: 9,
      mlaName: 'Shri Prashant Sharma',
      mlaNameHi: 'श्री प्रशांत शर्मा',
      constituency: 'Amer',
      constituencyHi: 'आमेर',
      proposed: 144,
      sanctionedWorks: 141,
      completedWorks: 62,
      availableAmt: 1500.00000,
      sanctionedAmt: 922.89843,
      balanceAmt: 577.10157
    },
    {
      sno: 10,
      mlaName: 'Shri Balmukund Acharya',
      mlaNameHi: 'श्री बालमुकुंद आचार्य',
      constituency: 'Hawa Mahal',
      constituencyHi: 'हवामहल',
      proposed: 56,
      sanctionedWorks: 28,
      completedWorks: 2,
      availableAmt: 1500.00000,
      sanctionedAmt: 517.42495,
      balanceAmt: 982.57505
    },
    {
      sno: 11,
      mlaName: 'Shri Rafeek Khan',
      mlaNameHi: 'श्री रफीक खान',
      constituency: 'Adarsh Nagar',
      constituencyHi: 'आदर्श नगर',
      proposed: 92,
      sanctionedWorks: 78,
      completedWorks: 15,
      availableAmt: 1500.00000,
      sanctionedAmt: 680.12450,
      balanceAmt: 819.87550
    },
    {
      sno: 12,
      mlaName: 'Shri Rajyavardhan Singh Rathore',
      mlaNameHi: 'श्री राज्यवर्धन सिंह राठौड़',
      constituency: 'Jhotwara',
      constituencyHi: 'झोटवाड़ा',
      proposed: 160,
      sanctionedWorks: 145,
      completedWorks: 42,
      availableAmt: 1500.00000,
      sanctionedAmt: 995.56012,
      balanceAmt: 504.43988
    }
  ];

  constructor(public languageService: LanguageService) {}

  ngOnInit(): void {}

  get filteredMlaRows(): MlaDetailRow[] {
    if (!this.searchMla.trim()) {
      return this.mlaWorkDetails;
    }
    const query = this.searchMla.toLowerCase();
    return this.mlaWorkDetails.filter(r =>
      r.mlaName.toLowerCase().includes(query) ||
      r.mlaNameHi.includes(query) ||
      r.constituency.toLowerCase().includes(query) ||
      r.constituencyHi.includes(query)
    );
  }

  // Calculate Summary Totals for Block Table
  get totalBlockSanctioned(): number {
    return this.blockProgressData.reduce((acc, b) => acc + b.sanctioned, 0);
  }

  get totalBlockCompleted(): number {
    return this.blockProgressData.reduce((acc, b) => acc + b.completed, 0);
  }

  get totalBlockIncomplete(): number {
    return this.blockProgressData.reduce((acc, b) => acc + b.incomplete, 0);
  }

  // Calculate Summary Totals for MLA Details Table
  get totalMlaProposed(): number {
    return this.filteredMlaRows.reduce((acc, r) => acc + r.proposed, 0);
  }

  get totalMlaSanctionedWorks(): number {
    return this.filteredMlaRows.reduce((acc, r) => acc + r.sanctionedWorks, 0);
  }

  get totalMlaCompletedWorks(): number {
    return this.filteredMlaRows.reduce((acc, r) => acc + r.completedWorks, 0);
  }

  get totalMlaAvailableAmt(): number {
    return this.filteredMlaRows.reduce((acc, r) => acc + r.availableAmt, 0);
  }

  get totalMlaSanctionedAmt(): number {
    return this.filteredMlaRows.reduce((acc, r) => acc + r.sanctionedAmt, 0);
  }

  get totalMlaBalanceAmt(): number {
    return this.filteredMlaRows.reduce((acc, r) => acc + r.balanceAmt, 0);
  }

  onViewRecords(): void {
    // Simulated refresh feedback
    const active = this.kpiCards;
    this.kpiCards = [...active];
  }

  setActiveScheme(schemeId: string): void {
    this.activeSchemeTab = schemeId;
  }

  toggleView(box: 1 | 2 | 3 | 4): void {
    if (box === 1) this.box1View = this.box1View === 'table' ? 'chart' : 'table';
    if (box === 2) this.box2View = this.box2View === 'table' ? 'chart' : 'table';
    if (box === 3) this.box3View = this.box3View === 'table' ? 'chart' : 'table';
    if (box === 4) this.box4View = this.box4View === 'table' ? 'chart' : 'table';
  }
}
