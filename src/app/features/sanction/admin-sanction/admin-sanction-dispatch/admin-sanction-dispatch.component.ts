import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface AdminSanctionDispatchRecord {
  workId: string;
  asOrderNo: string;
  dispatchNo: string;
  dispatchDate: string;
  workName: string;
  workNameHi: string;
  panchayat: string;
  deliveryMode: 'e-Portal Digital' | 'Speed Post' | 'Special Messenger';
  status: 'Dispatched' | 'Pending Dispatch';
}

@Component({
  selector: 'app-admin-sanction-dispatch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sanction-dispatch.component.html'
})
export class AdminSanctionDispatchComponent {
  district = 'JAIPUR';
  workIdQuery = '';

  records: AdminSanctionDispatchRecord[] = [
    {
      workId: 'WRK-2026-27-089',
      asOrderNo: 'AS/2026-27/JAIP/0942',
      dispatchNo: 'DSP/2026-27/0418',
      dispatchDate: '15-07-2026',
      workName: 'Construction of CC Interlocking Road from Main Market to Panchayat Bhawan, Amer',
      workNameHi: 'ग्राम पंचायत आमेर में मुख्य बाजार से पंचायत भवन तक सीसी इंटरलाकिंग सड़क निर्माण',
      panchayat: 'Amer (आमेर)',
      deliveryMode: 'e-Portal Digital',
      status: 'Dispatched'
    },
    {
      workId: 'WRK-2026-27-094',
      asOrderNo: 'AS/2026-27/JAIP/0911',
      dispatchNo: 'DSP/2026-27/0388',
      dispatchDate: '10-07-2026',
      workName: 'Solar Powered High-Mast Street Light Installation in Kishanpole Ward 12',
      workNameHi: 'किशनपोल वार्ड 12 में सौर ऊर्जा चलित हाई-मास्ट लाइट की स्थापना',
      panchayat: 'Nagar Nigam Heritage',
      deliveryMode: 'Speed Post',
      status: 'Dispatched'
    },
    {
      workId: 'WRK-2026-27-112',
      asOrderNo: 'AS/2026-27/JAIP/0875',
      dispatchNo: '---',
      dispatchDate: '---',
      workName: 'Drinking Water Tube-Well and Pipeline Extension at Village Andhi',
      workNameHi: 'ग्राम आंधी में पेयजल हेतु नलकूप खनन एवं पाइपलाइन विस्तार कार्य',
      panchayat: 'Andhi (आंधी)',
      deliveryMode: 'e-Portal Digital',
      status: 'Pending Dispatch'
    }
  ];

  selectedRecord: AdminSanctionDispatchRecord | null = null;
  newDispatchNo = '';
  newDispatchDate = new Date().toISOString().split('T')[0];
  newDeliveryMode: 'e-Portal Digital' | 'Speed Post' | 'Special Messenger' = 'e-Portal Digital';
  showSuccessToast = false;

  constructor(public languageService: LanguageService) {}

  get filteredRecords(): AdminSanctionDispatchRecord[] {
    if (!this.workIdQuery.trim()) {
      return this.records;
    }
    const q = this.workIdQuery.trim().toLowerCase();
    return this.records.filter(r =>
      r.workId.toLowerCase().includes(q) ||
      r.asOrderNo.toLowerCase().includes(q) ||
      r.dispatchNo.toLowerCase().includes(q) ||
      r.workName.toLowerCase().includes(q)
    );
  }

  openDispatchModal(rec: AdminSanctionDispatchRecord) {
    this.selectedRecord = rec;
    this.newDispatchNo = rec.dispatchNo === '---' ? 'DSP/2026-27/0450' : rec.dispatchNo;
    this.newDispatchDate = rec.dispatchDate === '---' ? new Date().toISOString().split('T')[0] : rec.dispatchDate;
    this.newDeliveryMode = rec.deliveryMode;
  }

  closeModal() {
    this.selectedRecord = null;
  }

  saveDispatchDetails() {
    if (this.selectedRecord) {
      this.selectedRecord.dispatchNo = this.newDispatchNo;
      this.selectedRecord.dispatchDate = this.newDispatchDate;
      this.selectedRecord.deliveryMode = this.newDeliveryMode;
      this.selectedRecord.status = 'Dispatched';
      this.selectedRecord = null;
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
      }, 4000);
    }
  }
}
