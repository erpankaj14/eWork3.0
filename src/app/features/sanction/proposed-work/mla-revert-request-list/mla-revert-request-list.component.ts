import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface RevertRequestRecord {
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
export class MlaRevertRequestListComponent {
  searchQuery = '';
  statusFilter: 'All' | 'Completed' | 'Pending Review' = 'All';

  records: RevertRequestRecord[] = [
    {
      sno: 1,
      mlaName: 'Sh. Laxman Meena (माननीय श्री लक्ष्मण मीणा)',
      aNo: '58',
      constituency: 'बस्सी (Bassi)',
      workName: 'Single phase tube-well drilling construction work near Narsi Meena house',
      workNameHi: 'सिंगल फेस ट्यूबवेल बोरिंग निर्माण कार्य नरसी मीणा के मकान के पास',
      sector: 'Rural',
      district: 'जयपुर',
      block: 'बस्सी',
      panchayat: 'हीरावाला',
      village: 'हीरावाला',
      agency: 'पंचायती राज',
      subAgency: 'पंचायत समिति बस्सी',
      receiptDate: '10/04/2026',
      convergence: 'Yes',
      proposedAmountLacs: 4.00,
      approvalNo: '2026-27/205',
      workId: 'WRK-2026-0311',
      recommVia: 'Mobile',
      revertRequested: 'Yes',
      revertStatus: 'Completed'
    },
    {
      sno: 2,
      mlaName: 'Sh. Laxman Meena (माननीय श्री लक्ष्मण मीणा)',
      aNo: '58',
      constituency: 'बस्सी (Bassi)',
      workName: 'Rest house construction work near Tejaji temple Mali Mohalla',
      workNameHi: 'विश्राम गृह निर्माण कार्य तेजाजी मंदिर माली मोहल्ला के पास बाँसखोह',
      sector: 'Rural',
      district: 'जयपुर',
      block: 'बस्सी',
      panchayat: 'बाँसखोह',
      village: 'बाँसखोह',
      agency: 'पंचायती राज',
      subAgency: 'ग्राम पंचायत बाँसखोह प.स. बस्सी',
      receiptDate: '02/02/2026',
      convergence: 'No',
      proposedAmountLacs: 10.00,
      approvalNo: '2025-26/25117',
      workId: 'WRK-2025-9812',
      recommVia: 'Web',
      revertRequested: 'Yes',
      revertStatus: 'Completed'
    },
    {
      sno: 3,
      mlaName: 'Sh. Laxman Meena (माननीय श्री लक्ष्मण मीणा)',
      aNo: '58',
      constituency: 'बस्सी (Bassi)',
      workName: 'Bairwa Colony Gram Chinapura CC Road interlocking tiles construction',
      workNameHi: 'बैरवा कॉलोनी ग्राम चीनापुरा में सीसी इंटरलाकिंग मार्ग निर्माण',
      sector: 'Rural',
      district: 'जयपुर',
      block: 'बस्सी',
      panchayat: 'चीनापुरा',
      village: 'चीनापुरा',
      agency: 'पंचायती राज',
      subAgency: 'ग्राम पंचायत चीनापुरा',
      receiptDate: '15/03/2026',
      convergence: 'No',
      proposedAmountLacs: 5.00,
      approvalNo: '2025-26/28911',
      workId: 'WRK-2026-0045',
      recommVia: 'Web',
      revertRequested: 'Yes',
      revertStatus: 'Pending Review'
    }
  ];

  constructor(public languageService: LanguageService) {}

  get filteredRecords(): RevertRequestRecord[] {
    let result = this.records;
    if (this.statusFilter !== 'All') {
      result = result.filter(r => r.revertStatus === this.statusFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(r =>
        r.workName.toLowerCase().includes(q) ||
        r.workNameHi.toLowerCase().includes(q) ||
        r.panchayat.toLowerCase().includes(q) ||
        r.approvalNo.toLowerCase().includes(q)
      );
    }
    return result;
  }
}
