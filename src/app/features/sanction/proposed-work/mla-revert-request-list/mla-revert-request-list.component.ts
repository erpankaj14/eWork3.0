import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../../../core/services/language.service';
import { MlaRecommendationService } from '../../../../core/services/mla-recommendation.service';
import { AuthService } from '../../../../core/services/auth.service';

interface RevertRequestRecord {
  id: number;
  sno: number;
  mlaName: string;
  aNo: string;
  constituency: string;
  workName: string;
  workNameHi: string;
  sector: 'Rural' | 'Urban';
  district: string;
  block: string;
  panchayat: string;
  village: string;
  agency: string;
  subAgency: string;
  receiptDate: string;
  convergence: 'Yes' | 'No';
  proposedAmountLacs: number;
  approvalNo: string;
  workId: string;
  recommVia: 'Mobile' | 'Web';
  revertRequested: 'Yes';
  revertStatus: 'Completed' | 'Pending Review';
}

@Component({
  selector: 'app-mla-revert-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mla-revert-request-list.component.html',
  styleUrls: ['./mla-revert-request-list.component.css']
})
export class MlaRevertRequestListComponent implements OnInit {
  public languageService = inject(LanguageService);
  private readonly mlaService = inject(MlaRecommendationService);
  private readonly toastr = inject(ToastrService);
  private readonly authService = inject(AuthService);

  searchQuery = '';
  statusFilter: 'All' | 'Completed' | 'Pending Review' = 'All';
  records: RevertRequestRecord[] = [];
  isLoading = false;
  loadError = '';
  busyId: number | null = null;
  districtLabel = this.authService.getCurrentUser()?.district || this.authService.getCurrentUser()?.districtCode || 'Token district';

  ngOnInit(): void { this.loadRequests(); }

  loadRequests(): void {
    this.isLoading = true;
    this.loadError = '';
    this.mlaService.getRevertRequests().subscribe({
      next: response => {
        this.records = this.rows(response).map((row, index) => this.mapRecord(row, index));
        this.isLoading = false;
      },
      error: error => {
        this.records = [];
        this.loadError = error?.status === 401
          ? 'Backend rejected this login token for revert requests (HTTP 401). It requires TokenType=Internal, UserId, and a valid DistrictCode claim. The current session was kept active.'
          : error?.status === 403
            ? 'This login does not have permission to view district revert requests (HTTP 403).'
            : error?.error?.message || error?.error?.title || 'Revert requests could not be loaded.';
        this.isLoading = false;
      }
    });
  }

  private rows(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    for (const [key, nested] of Object.entries(value)) {
      if (/^(data|result|items|records|table)$/i.test(key)) {
        if (Array.isArray(nested)) return nested;
        const found = this.rows(nested);
        if (found.length) return found;
      }
    }
    return [];
  }

  private val(row: any, keys: string[], fallback: any = ''): any {
    const normalized = keys.map(key => key.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const found = Object.entries(row || {}).find(([key]) => normalized.includes(key.toLowerCase().replace(/[^a-z0-9]/g, '')));
    return found?.[1] ?? fallback;
  }

  private mapRecord(row: any, index: number): RevertRequestRecord {
    const get = (keys: string[], fallback: any = '') => this.val(row, keys, fallback);
    const bool = (v: any) => v === true || v === 1 || /^(true|1|yes)$/i.test(String(v));
    const id = Number(get(['Id', 'RecommendationId', 'MlaRecommendationId', 'RecId']));
    const sector = String(get(['Sector', 'Area'], 'R')).toUpperCase();
    return {
      id, sno: index + 1,
      mlaName: String(get(['MlaName', 'MLAName'], '-')),
      aNo: String(get(['ANo', 'AssemblyNo', 'ConstituencyNo'], '-')),
      constituency: String(get(['ConstituencyName', 'ConstName'], '-')),
      workName: String(get(['WorkName', 'NameOfWork'], '-')),
      workNameHi: String(get(['WorkNameHi', 'WorkNameHindi'], '')),
      sector: sector === 'U' || sector === 'URBAN' ? 'Urban' : 'Rural',
      district: String(get(['DistrictName', 'District'], '-')),
      block: String(get(['BlockName'], '-')),
      panchayat: String(get(['PanchayatName', 'GramPanchayatName'], '-')),
      village: String(get(['VillageName'], '-')),
      agency: String(get(['AgencyName', 'DepartmentName'], '-')),
      subAgency: String(get(['SubAgencyName'], '-')),
      receiptDate: String(get(['WorkRecptDate', 'ReceiptDate', 'CreatedDate'], '-')),
      convergence: bool(get(['IsConvergence', 'Convergence'])) ? 'Yes' : 'No',
      proposedAmountLacs: Number(get(['ProposedAmt', 'ProposedAmount', 'Amount'], 0)) || 0,
      approvalNo: String(get(['ApprovalNo', 'RecommendationNo', 'LetterNo'], id || '-')),
      workId: String(get(['WorkId'], '-')),
      recommVia: bool(get(['IsWeb'])) ? 'Web' : 'Mobile',
      revertRequested: 'Yes', revertStatus: bool(get(['RevertCompleted', 'IsRevertCompleted'])) ? 'Completed' : 'Pending Review'
    };
  }

  finishRevert(rec: RevertRequestRecord): void {
    if (!rec.id || this.busyId !== null) return;
    if (!window.confirm(`Complete the revert request for "${rec.workName}"?`)) return;
    this.busyId = rec.id;
    this.mlaService.finishRevert(rec.id).subscribe({
      next: response => {
        if (response?.success === false) {
          this.toastr.error(response?.message || 'Revert request could not be completed.');
        } else {
          this.toastr.success(response?.message || 'Revert request completed.');
          this.loadRequests();
        }
        this.busyId = null;
      },
      error: error => {
        const message = error?.status === 409
          ? (error?.error?.message || 'Request is stale or the workflow state has changed. The list was refreshed.')
          : error?.status === 401
            ? 'Backend rejected this login token for the revert workflow (HTTP 401). Verify TokenType=Internal, UserId, and DistrictCode claims.'
            : (error?.error?.message || error?.error?.title || 'Revert request could not be completed.');
        this.toastr.error(message);
        if (error?.status === 409) this.loadRequests();
        this.busyId = null;
      }
    });
  }

  openPdf(rec: RevertRequestRecord, revertFile: boolean): void {
    // Open the tab synchronously from the click so browser popup blockers do not
    // discard it while the authenticated PDF request is in flight.
    const pdfTab = window.open('about:blank', '_blank');
    if (!pdfTab) {
      this.toastr.error('The browser blocked the PDF tab. Allow pop-ups for this site and try again.');
      return;
    }
    pdfTab.document.title = 'Loading PDF…';
    pdfTab.document.body.textContent = 'Loading PDF…';

    const request = revertFile ? this.mlaService.getRevertPdf(rec.id) : this.mlaService.getRecommendationPdf(rec.id);
    request.subscribe({
      next: blob => {
        if (!blob.size || (blob.type && !this.isPdfContentType(blob.type))) {
          pdfTab.close();
          this.toastr.error('The server response was not a PDF file.');
          return;
        }
        const url = URL.createObjectURL(blob);
        pdfTab.location.replace(url);
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: error => {
        pdfTab.close();
        this.toastr.error(error?.status === 401
          ? 'Backend rejected the current JWT claims for this PDF (HTTP 401). Verify TokenType=Internal, UserId, and DistrictCode.'
          : error?.status === 404
            ? `PDF is unavailable or district access was denied for recommendation #${rec.id} (HTTP 404).`
            : error?.error?.message || 'PDF is unavailable for this request.');
      }
    });
  }

  private isPdfContentType(contentType: string): boolean {
    const type = contentType.split(';', 1)[0].trim().toLowerCase();
    return type === 'application/pdf' || type === 'application/octet-stream';
  }

  get filteredRecords(): RevertRequestRecord[] {
    let result = this.records;
    if (this.statusFilter !== 'All') result = result.filter(r => r.revertStatus === this.statusFilter);
    const q = this.searchQuery.trim().toLowerCase();
    if (q) result = result.filter(r => [r.workName, r.workNameHi, r.panchayat, r.approvalNo].some(value => value.toLowerCase().includes(q)));
    return result;
  }
}
