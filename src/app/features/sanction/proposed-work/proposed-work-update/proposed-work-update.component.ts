import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface ProposedWorkRecord {
  proposalId: string;
  workId: string;
  approvalNo: string;
  approvalDate: string;
  workName: string;
  workNameHi: string;
  sector: 'Rural' | 'Urban';
  block: string;
  panchayat: string;
  amountLakhs: number;
  status: 'Approved' | 'Pending Update' | 'In Progress';
}

@Component({
  selector: 'app-proposed-work-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proposed-work-update.component.html',
  styleUrls: ['./proposed-work-update.component.css']
})
export class ProposedWorkUpdateComponent {
  // Search Filter form model
  proposalIdQuery = '';
  workIdQuery = '';
  approvalNoQuery = '';
  approvalDateQuery = '';

  district = 'JAIPUR (जयपुर)';
  isSearching = false;
  selectedRecord: ProposedWorkRecord | null = null;

  records: ProposedWorkRecord[] = [
    {
      proposalId: 'PRP-2026-0981',
      workId: 'WRK-2026-27-053',
      approvalNo: 'REC/2026-27/JAIP/1042',
      approvalDate: '2026-06-20',
      workName: 'CC Road and Interlocking Drainage Construction in Gram Panchayat Amer',
      workNameHi: 'ग्राम पंचायत आमेर में मुख्य सड़क से विद्यालय तक सीसी ब्लॉक एवं नाली निर्माण कार्य',
      sector: 'Rural',
      block: 'आमेर (Amer)',
      panchayat: 'आमेर पंचायत-1',
      amountLakhs: 20.00,
      status: 'Pending Update'
    },
    {
      proposalId: 'PRP-2026-0945',
      workId: 'WRK-2026-27-041',
      approvalNo: 'REC/2026-27/JAIP/0988',
      approvalDate: '2026-06-18',
      workName: 'Community Hall and Solar Light Installation near Primary Health Centre',
      workNameHi: 'प्राथमिक स्वास्थ्य केंद्र के पास सामुदायिक भवन एवं सोलर लाइट स्थापना कार्य',
      sector: 'Rural',
      block: 'बस्सी (Bassi)',
      panchayat: 'हीरावाला',
      amountLakhs: 15.50,
      status: 'Approved'
    },
    {
      proposalId: 'PRP-2026-0912',
      workId: 'WRK-2026-27-029',
      approvalNo: 'REC/2026-27/JAIP/0871',
      approvalDate: '2026-05-30',
      workName: 'Single Phase Tube-well Drilling and Pipeline Repair in Ward 16',
      workNameHi: 'वार्ड 16 में सिंगल फेस ट्यूबवेल बोरिंग एवं पाइपलाइन मरम्मत कार्य',
      sector: 'Urban',
      block: 'नगर निगम जयपुर',
      panchayat: 'आदर्श नगर',
      amountLakhs: 10.00,
      status: 'In Progress'
    }
  ];

  constructor(public languageService: LanguageService) {}

  onSearch(): void {
    this.isSearching = true;
    setTimeout(() => {
      this.isSearching = false;
    }, 400);
  }

  onResetFilters(): void {
    this.proposalIdQuery = '';
    this.workIdQuery = '';
    this.approvalNoQuery = '';
    this.approvalDateQuery = '';
  }

  selectRecordForEdit(rec: ProposedWorkRecord): void {
    this.selectedRecord = rec;
  }

  closeEditModal(): void {
    this.selectedRecord = null;
  }
}
