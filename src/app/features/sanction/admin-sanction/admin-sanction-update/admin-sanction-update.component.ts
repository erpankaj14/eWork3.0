import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface AdminSanctionRecord {
  workId: string;
  asOrderNo: string;
  asDate: string;
  workName: string;
  workNameHi: string;
  panchayat: string;
  amountLakhs: number;
  scheme: string;
  agency: string;
  status: 'Approved' | 'Pending Revision' | 'Revised';
}

@Component({
  selector: 'app-admin-sanction-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sanction-update.component.html'
})
export class AdminSanctionUpdateComponent {
  district = 'JAIPUR';
  workIdQuery = '';

  records: AdminSanctionRecord[] = [
    {
      workId: 'WRK-2026-27-089',
      asOrderNo: 'AS/2026-27/JAIP/0942',
      asDate: '14-07-2026',
      workName: 'Construction of CC Interlocking Road from Main Market to Panchayat Bhawan, Amer',
      workNameHi: 'ग्राम पंचायत आमेर में मुख्य बाजार से पंचायत भवन तक सीसी इंटरलाकिंग सड़क निर्माण',
      panchayat: 'Amer (आमेर)',
      amountLakhs: 14.50,
      scheme: 'MLALAD',
      agency: 'Gram Panchayat Amer',
      status: 'Approved'
    },
    {
      workId: 'WRK-2026-27-094',
      asOrderNo: 'AS/2026-27/JAIP/0911',
      asDate: '08-07-2026',
      workName: 'Solar Powered High-Mast Street Light Installation in Kishanpole Ward 12',
      workNameHi: 'किशनपोल वार्ड 12 में सौर ऊर्जा चलित हाई-मास्ट लाइट की स्थापना',
      panchayat: 'Nagar Nigam Heritage',
      amountLakhs: 8.75,
      scheme: 'Viksit Rajasthan Abhiyan',
      agency: 'Nagar Nigam Heritage',
      status: 'Pending Revision'
    },
    {
      workId: 'WRK-2026-27-112',
      asOrderNo: 'AS/2026-27/JAIP/0875',
      asDate: '01-07-2026',
      workName: 'Drinking Water Tube-Well and Pipeline Extension at Village Andhi',
      workNameHi: 'ग्राम आंधी में पेयजल हेतु नलकूप खनन एवं पाइपलाइन विस्तार कार्य',
      panchayat: 'Andhi (आंधी)',
      amountLakhs: 18.20,
      scheme: 'JJM Convergence',
      agency: 'PHED Division Jaipur',
      status: 'Revised'
    }
  ];

  selectedRecord: AdminSanctionRecord | null = null;
  showSuccessToast = false;

  constructor(public languageService: LanguageService) {}

  get filteredRecords(): AdminSanctionRecord[] {
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

  onReset() {
    this.workIdQuery = '';
  }

  openEditModal(rec: AdminSanctionRecord) {
    this.selectedRecord = { ...rec };
  }

  closeModal() {
    this.selectedRecord = null;
  }

  saveRevision() {
    if (this.selectedRecord) {
      const idx = this.records.findIndex(r => r.workId === this.selectedRecord?.workId);
      if (idx !== -1) {
        this.records[idx] = { ...this.selectedRecord };
      }
      this.selectedRecord = null;
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
      }, 4000);
    }
  }
}
