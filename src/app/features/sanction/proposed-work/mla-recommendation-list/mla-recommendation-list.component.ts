import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MlaRecommendationService } from '../../../../core/services/mla-recommendation.service';

interface MlaRecommendationRecord {
  sno: number;
  mlaName: string;
  aNo: string;
  constituency: string;
  workName: string;
  workNameHi: string;
  sector: string;
  district: string;
  block: string;
  panchayat: string;
  village: string;
  town: string;
  agency: string;
  subAgency: string;
  receiptDate: string;
  createdDate: string;
  updatedDate: string;
  convergence: string;
  proposedAmountLacs: number | null;
  approvalNo: string;
  workId: string;
}

@Component({
  selector: 'app-mla-recommendation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mla-recommendation-list.component.html',
  styleUrls: ['./mla-recommendation-list.component.css']
})
export class MlaRecommendationListComponent implements OnInit {
  public languageService = inject(LanguageService);
  private readonly mlaService = inject(MlaRecommendationService);
  private readonly authService = inject(AuthService);

  financialYear = '--All--';
  financialYears: string[] = [];
  selectedMla = '--All MLA--';
  searchQuery = '';
  districtLabel = this.authService.getCurrentUser()?.district || this.authService.getCurrentUser()?.districtCode || '-';
  records: MlaRecommendationRecord[] = [];
  isLoading = false;
  loadError = '';
  currentPage = 1;
  readonly pageSize = 15;

  ngOnInit(): void {
    this.loadFinancialYears();
  }

  private loadFinancialYears(): void {
    this.mlaService.getFinancialYears().subscribe({
      next: response => {
        this.financialYears = this.apiRows(response).map(row => {
          const value = typeof row === 'string' || typeof row === 'number'
            ? row
            : this.value(row, ['FinYr', 'FinYear', 'FinancialYear', 'Year'], '');
          return String(value ?? '').trim();
        }).filter((year, index, years) => !!year && years.indexOf(year) === index);
        const now = new Date();
        const yearStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        const currentYear = `${yearStart}-${String(yearStart + 1).slice(-2)}`;
        this.financialYear = this.financialYears.includes(currentYear) ? currentYear : this.financialYears[0] || '--All--';
        this.loadRecommendations();
      },
      error: () => {
        this.financialYears = [];
        this.financialYear = '--All--';
        this.loadRecommendations();
      }
    });
  }

  onFinancialYearChange(): void {
    this.currentPage = 1;
    this.selectedMla = '--All MLA--';
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.loadError = '';
    this.mlaService.getRecommendations(this.financialYear === '--All--' ? undefined : this.financialYear).subscribe({
      next: response => {
        if (response?.status === false || response?.success === false) {
          this.records = [];
          this.loadError = response?.message || 'Recommendations could not be loaded.';
        } else {
          this.records = this.apiRows(response).map((row, index) => this.mapRecord(row, index));
        }
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: error => {
        this.records = [];
        this.loadError = error?.error?.message || error?.error?.title || `Recommendation API failed${error?.status ? ` (HTTP ${error.status})` : ''}.`;
        this.isLoading = false;
      }
    });
  }

  private apiRows(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    for (const [key, nested] of Object.entries(value)) {
      if (/^(data|result|items|records|table)$/i.test(key)) {
        if (Array.isArray(nested)) return nested;
        const rows = this.apiRows(nested);
        if (rows.length) return rows;
      }
    }
    for (const nested of Object.values(value)) {
      if (nested && typeof nested === 'object') {
        const rows = this.apiRows(nested);
        if (rows.length) return rows;
      }
    }
    return [];
  }

  private value(row: any, keys: string[], fallback: any = '-'): any {
    const wanted = new Set(keys.map(key => key.toLowerCase().replace(/[^a-z0-9]/g, '')));
    const match = Object.entries(row || {}).find(([key]) => wanted.has(key.toLowerCase().replace(/[^a-z0-9]/g, '')));
    return match?.[1] ?? fallback;
  }

  private mapRecord(row: any, index: number): MlaRecommendationRecord {
    const get = (keys: string[], fallback: any = '-') => this.value(row, keys, fallback);
    const sectorValue = String(get(['Sector'], '')).trim().toUpperCase();
    const convergenceValue = get(['IsConvergence', 'Convergence'], null);
    const amountValue = get(['ProposedAmt', 'ProposedAmount', 'Amount'], null);
    const amount = amountValue === null || amountValue === '' ? null : Number(amountValue);
    return {
      sno: index + 1,
      mlaName: String(get(['MlaName', 'H_MLAName', 'MLAName'])),
      aNo: String(get(['ANo', 'A_No', 'AssemblyNo', 'a_no'])),
      constituency: String(get(['ConstituencyName', 'ConstName', 'Const_Name', 'AssemblyName'])),
      workName: String(get(['WorkName', 'NameOfWork'])),
      workNameHi: String(get(['WorkNameHi', 'WorkNameHindi'], '')),
      sector: sectorValue === 'U' || sectorValue === 'URBAN' ? 'Urban' : sectorValue === 'R' || sectorValue === 'RURAL' ? 'Rural' : '-',
      district: String(get(['DistrictName', 'District'])),
      block: String(get(['BlockName', 'Block'])),
      panchayat: String(get(['PanchayatName', 'GramPanchayatName'])),
      village: String(get(['VillageName'])),
      town: String(get(['TownName'])),
      agency: String(get(['AgencyName', 'DepartmentName'])),
      subAgency: String(get(['SubAgencyName'])),
      receiptDate: this.displayDate(get(['WorkRecptDate', 'ReceiptDate', 'Date'], '')),
      createdDate: this.displayDate(get(['CreatedDate', 'EntryDate'], '')),
      updatedDate: this.displayDate(get(['UpdatedDate', 'ModifiedDate'], '')),
      convergence: convergenceValue === null ? '-' : this.toBoolean(convergenceValue) ? 'Yes' : 'No',
      proposedAmountLacs: amount !== null && Number.isFinite(amount) ? amount : null,
      approvalNo: String(get(['ApprovalNo', 'RecommendationNo', 'LetterNo'])),
      workId: String(get(['WorkId']))
    };
  }

  private toBoolean(value: any): boolean {
    return value === true || value === 1 || /^(true|1|yes)$/i.test(String(value));
  }

  private displayDate(value: any): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  get mlaOptions(): string[] {
    return [...new Set(this.records.map(record => record.mlaName).filter(name => name && name !== '-'))].sort((a, b) => a.localeCompare(b));
  }

  get filteredRecords(): MlaRecommendationRecord[] {
    let rows = this.records;
    if (this.selectedMla !== '--All MLA--') rows = rows.filter(record => record.mlaName === this.selectedMla);
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      rows = rows.filter(record => [record.workName, record.workNameHi, record.mlaName, record.constituency, record.approvalNo, record.district, record.block, record.town]
        .some(value => value.toLowerCase().includes(query)));
    }
    return rows;
  }

  get totalCount(): number { return this.filteredRecords.length; }
  get pageCount(): number { return Math.max(1, Math.ceil(this.totalCount / this.pageSize)); }
  get showingFrom(): number { return this.totalCount ? (this.currentPage - 1) * this.pageSize + 1 : 0; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.totalCount); }
  get pageNumbers(): number[] {
    const start = Math.max(1, Math.min(this.currentPage - 2, this.pageCount - 4));
    return Array.from({ length: Math.min(5, this.pageCount) }, (_, index) => start + index);
  }
  get pageRecords(): MlaRecommendationRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  setPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.pageCount));
  }
}
