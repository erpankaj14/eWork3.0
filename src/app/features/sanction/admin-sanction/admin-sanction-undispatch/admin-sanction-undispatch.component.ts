import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface AdminSanctionUndispatchRecord {
  workId: string;
  asOrderNo: string;
  dispatchNo: string;
  workName: string;
  workNameHi: string;
  panchayat: string;
  amountLakhs: number;
  fsIssued: boolean;
  status: 'Dispatched (Active)' | 'Undispatched (Reverted)';
}

@Component({
  selector: 'app-admin-sanction-undispatch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sanction-undispatch.component.html'
})
export class AdminSanctionUndispatchComponent {
  district = 'JAIPUR';
  workIdQuery = '';

  records: AdminSanctionUndispatchRecord[] = [
    {
      workId: 'WRK-2026-27-089',
      asOrderNo: 'AS/2026-27/JAIP/0942',
      dispatchNo: 'DSP/2026-27/0418',
      workName: 'Construction of CC Interlocking Road from Main Market to Panchayat Bhawan, Amer',
      workNameHi: 'ग्राम पंचायत आमेर में मुख्य बाजार से पंचायत भवन तक सीसी इंटरलाकिंग सड़क निर्माण',
      panchayat: 'Amer (आमेर)',
      amountLakhs: 14.50,
      fsIssued: false,
      status: 'Dispatched (Active)'
    },
    {
      workId: 'WRK-2026-27-094',
      asOrderNo: 'AS/2026-27/JAIP/0911',
      dispatchNo: 'DSP/2026-27/0388',
      workName: 'Solar Powered High-Mast Street Light Installation in Kishanpole Ward 12',
      workNameHi: 'किशनपोल वार्ड 12 में सौर ऊर्जा चलित हाई-मास्ट लाइट की स्थापना',
      panchayat: 'Nagar Nigam Heritage',
      amountLakhs: 8.75,
      fsIssued: false,
      status: 'Dispatched (Active)'
    },
    {
      workId: 'WRK-2026-27-112',
      asOrderNo: 'AS/2026-27/JAIP/0875',
      dispatchNo: 'DSP/2026-27/0352',
      workName: 'Drinking Water Tube-Well and Pipeline Extension at Village Andhi',
      workNameHi: 'ग्राम आंधी में पेयजल हेतु नलकूप खनन एवं पाइपलाइन विस्तार कार्य',
      panchayat: 'Andhi (आंधी)',
      amountLakhs: 18.20,
      fsIssued: true,
      status: 'Dispatched (Active)'
    }
  ];

  selectedRecord: AdminSanctionUndispatchRecord | null = null;
  undispatchReason = 'Typographical error in AS amount';
  remarks = '';
  showSuccessToast = false;
  showErrorToast = false;

  constructor(public languageService: LanguageService) {}

  get filteredRecords(): AdminSanctionUndispatchRecord[] {
    if (!this.workIdQuery.trim()) {
      return this.records;
    }
    const q = this.workIdQuery.trim().toLowerCase();
    return this.records.filter(r =>
      r.workId.toLowerCase().includes(q) ||
      r.asOrderNo.toLowerCase().includes(q) ||
      r.workName.toLowerCase().includes(q) ||
      r.workNameHi.includes(q)
    );
  }

  openUndispatchModal(rec: AdminSanctionUndispatchRecord) {
    if (rec.fsIssued) {
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 4000);
      return;
    }
    this.selectedRecord = rec;
    this.undispatchReason = 'Typographical error in AS amount';
    this.remarks = '';
  }

  closeModal() {
    this.selectedRecord = null;
  }

  confirmUndispatch() {
    if (this.selectedRecord) {
      this.selectedRecord.status = 'Undispatched (Reverted)';
      this.selectedRecord = null;
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
      }, 4000);
    }
  }
}
