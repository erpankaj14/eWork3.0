import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface AdminSanctionFinalizeRecord {
  workId: string;
  asOrderNo: string;
  asDate: string;
  workName: string;
  workNameHi: string;
  panchayat: string;
  amountLakhs: number;
  issuingAuthority: string;
  copyToCount: number;
  status: 'Draft AS' | 'Finalized & Issued' | 'Pending Copy-To';
}

@Component({
  selector: 'app-admin-sanction-finalize',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sanction-finalize.component.html'
})
export class AdminSanctionFinalizeComponent {
  district = 'JAIPUR';
  workIdQuery = '';

  records: AdminSanctionFinalizeRecord[] = [
    {
      workId: 'WRK-2026-27-089',
      asOrderNo: 'AS/2026-27/JAIP/0942',
      asDate: '14-07-2026',
      workName: 'Construction of CC Interlocking Road from Main Market to Panchayat Bhawan, Amer',
      workNameHi: 'ग्राम पंचायत आमेर में मुख्य बाजार से पंचायत भवन तक सीसी इंटरलाकिंग सड़क निर्माण',
      panchayat: 'Amer (आमेर)',
      amountLakhs: 14.50,
      issuingAuthority: 'Chief Executive Officer (CEO), Zila Parishad Jaipur',
      copyToCount: 5,
      status: 'Finalized & Issued'
    },
    {
      workId: 'WRK-2026-27-094',
      asOrderNo: 'AS/2026-27/JAIP/0911',
      asDate: '08-07-2026',
      workName: 'Solar Powered High-Mast Street Light Installation in Kishanpole Ward 12',
      workNameHi: 'किशनपोल वार्ड 12 में सौर ऊर्जा चलित हाई-मास्ट लाइट की स्थापना',
      panchayat: 'Nagar Nigam Heritage',
      amountLakhs: 8.75,
      issuingAuthority: 'CEO Zila Parishad Jaipur',
      copyToCount: 3,
      status: 'Pending Copy-To'
    },
    {
      workId: 'WRK-2026-27-112',
      asOrderNo: 'AS/2026-27/JAIP/0875',
      asDate: '01-07-2026',
      workName: 'Drinking Water Tube-Well and Pipeline Extension at Village Andhi',
      workNameHi: 'ग्राम आंधी में पेयजल हेतु नलकूप खनन एवं पाइपलाइन विस्तार कार्य',
      panchayat: 'Andhi (आंधी)',
      amountLakhs: 18.20,
      issuingAuthority: 'Block Development Officer (BDO)',
      copyToCount: 0,
      status: 'Draft AS'
    }
  ];

  selectedRecord: AdminSanctionFinalizeRecord | null = null;
  showSuccessToast = false;

  endorsementRecipients = [
    { name: 'Sarpanch / Secretary, Gram Panchayat', nameHi: 'सरपंच / ग्राम विकास अधिकारी', checked: true },
    { name: 'Assistant Engineer (AEN), Panchayat Samiti', nameHi: 'सहायक अभियंता (AEN), पंचायत समिति', checked: true },
    { name: 'Junior Engineer (JEN), Panchayat Samiti', nameHi: 'कनिष्ठ अभियंता (JEN), पंचायत समिति', checked: true },
    { name: 'Accounts Officer, Zila Parishad Jaipur', nameHi: 'लेखाधिकारी, जिला परिषद जयपुर', checked: true },
    { name: 'District Treasury Officer, Jaipur', nameHi: 'जिला कोषाधिकारी, जयपुर', checked: false },
    { name: 'Honorable MLA / Recommending Authority', nameHi: 'माननीय विधायक / अनुशंसाकर्ता प्राधिकारी', checked: true }
  ];

  constructor(public languageService: LanguageService) {}

  get filteredRecords(): AdminSanctionFinalizeRecord[] {
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

  openFinalizeModal(rec: AdminSanctionFinalizeRecord) {
    this.selectedRecord = rec;
  }

  closeModal() {
    this.selectedRecord = null;
  }

  toggleRecipient(index: number) {
    this.endorsementRecipients[index].checked = !this.endorsementRecipients[index].checked;
  }

  confirmFinalizeAndIssue() {
    if (this.selectedRecord) {
      this.selectedRecord.status = 'Finalized & Issued';
      this.selectedRecord.copyToCount = this.endorsementRecipients.filter(r => r.checked).length;
      this.selectedRecord = null;
      this.showSuccessToast = true;
      setTimeout(() => {
        this.showSuccessToast = false;
      }, 4000);
    }
  }
}
