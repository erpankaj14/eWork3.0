import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanApiService } from '../../../../core/services/plan-api.service';
import { BudgetType, PlanModel } from '../../../../core/services/plan-api.models';
import { LanguageService } from '../../../../core/services/language.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plan-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-create.component.html',
  styleUrls: ['./plan-create.component.css']
})
export class PlanCreateComponent implements OnInit {
  private readonly planApi = inject(PlanApiService);
  public readonly languageService = inject(LanguageService);
  private readonly toastr = inject(ToastrService);

  // Form Fields
  planId = 0;
  schemeCode = 5;
  finYr = '2026-27';
  districtCode = '101'; // Default or from session
  budgetTypeId: number | null = null;
  dlcApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  blockApprovalDate = this.getTodayFormatted(); // dd/MM/yyyy
  slcApprovalDate = ''; // dd/MM/yyyy for state user
  totalEstimatedCost = 0;
  remarks = '';

  // Dropdown master list
  budgetTypes: BudgetType[] = [];

  // Schemes list
  schemes = [
    { code: 1, name: 'MPLAD - Member of Parliament Local Area Development' },
    { code: 5, name: 'MLALAD - Member of Legislative Assembly Local Area Development' },
    { code: 12, name: 'DDUGMGY - Deen Dayal Upadhyaya Gram Jyoti Yojana' },
    { code: 18, name: 'State Innovation Fund' }
  ];

  // Financial Years list
  finYears = ['2026-27', '2025-26', '2024-25', '2023-24'];

  // File Upload State
  selectedPdfFile: File | null = null;
  selectedFileName = '';
  isUploading = false;
  isSaving = false;
  isLoadingMasters = false;

  // Alerts & Messages
  statusMessage = '';
  isSuccess = false;

  ngOnInit(): void {
    this.loadBudgetTypeList();
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
      error: (err) => {
        this.isLoadingMasters = false;
        console.error('Error fetching budget types:', err);
        // Fallback mock master data if API is offline
        this.budgetTypes = [
          { id: 1, budgetTypeCode: 'BT01', budgetTypeName: 'Regular Sanction Fund', budgetTypeNameHi: 'नियमित स्वीकृति कोष' },
          { id: 2, budgetTypeCode: 'BT02', budgetTypeName: 'Special Grant Fund', budgetTypeNameHi: 'विशेष अनुदान कोष' },
          { id: 3, budgetTypeCode: 'BT03', budgetTypeName: 'Emergency Contingency Fund', budgetTypeNameHi: 'आपातकालीन आकस्मिकता निधि' }
        ];
      }
    });
  }

  onSavePlan(): void {
    if (!this.schemeCode || !this.finYr) {
      this.showToast('Please select Scheme Code and Financial Year.', 'error');
      return;
    }

    const planPayload: PlanModel = {
      id: this.planId,
      Id: this.planId,
      schemeCode: Number(this.schemeCode),
      SchemeCode: Number(this.schemeCode),
      finYr: this.finYr,
      FinYr: this.finYr,
      districtCode: this.districtCode,
      DistrictCode: this.districtCode,
      dlcApprovalDate1: this.dlcApprovalDate,
      DLCApprovalDate1: this.dlcApprovalDate,
      blockApprovalDate1: this.blockApprovalDate,
      BlockApprovalDate1: this.blockApprovalDate,
      slcApprovalDate1: this.slcApprovalDate || undefined,
      SLCApprovalDate1: this.slcApprovalDate || undefined,
      budgetTypeId: this.budgetTypeId ? Number(this.budgetTypeId) : undefined,
      BudgetTypeId: this.budgetTypeId ? Number(this.budgetTypeId) : undefined,
      totalEstimatedCost: Number(this.totalEstimatedCost) || 0,
      TotalEstimatedCost: Number(this.totalEstimatedCost) || 0,
      remarks: this.remarks || '',
      Remarks: this.remarks || ''
    };

    this.isSaving = true;
    this.planApi.savePlanDetails(planPayload).subscribe({
      next: (res) => {
        this.isSaving = false;
        const msg = res?.message || 'Plan details saved successfully!';
        this.showToast(msg, 'success');
        if (res?.data && res.data.id) {
          this.planId = res.data.id;
        }
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error saving plan details:', err);
        const errMsg = err?.error?.message || 'Failed to save plan details. Please check connection/inputs.';
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
      SchemeCode: Number(this.schemeCode),
      FinYr: this.finYr,
      DistrictCode: this.districtCode,
      Remarks: this.remarks
    };

    this.planApi.savePlanFileAndForward(this.selectedPdfFile, fields).subscribe({
      next: (res) => {
        this.isUploading = false;
        const msg = res?.message || 'District Plan PDF saved and forwarded to State successfully!';
        this.showToast(msg, 'success');
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error uploading/forwarding plan PDF:', err);
        const errMsg = err?.error?.message || 'Failed to forward Plan PDF. Please try again.';
        this.showToast(errMsg, 'error');
      }
    });
  }

  onResetForm(): void {
    this.planId = 0;
    this.totalEstimatedCost = 0;
    this.remarks = '';
    this.selectedPdfFile = null;
    this.selectedFileName = '';
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
