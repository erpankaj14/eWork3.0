import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface ApprovedWorkProposal {
  id: string;
  workId: string;
  workName: string;
  workNameHi: string;
  sector: 'Rural' | 'Urban';
  panchayat: string;
  estimatedCostLakhs: number;
  mlaName: string;
}

@Component({
  selector: 'app-admin-sanction-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sanction-entry.component.html'
})
export class AdminSanctionEntryComponent {
  district = 'JAIPUR';

  // Section 1: Work Proposal Selection
  selectedProposalId = 'PRP-2026-1042';
  proposals: ApprovedWorkProposal[] = [
    {
      id: 'PRP-2026-1042',
      workId: 'WRK-2026-27-089',
      workName: 'Construction of CC Interlocking Road from Main Market to Panchayat Bhawan, Amer',
      workNameHi: 'ग्राम पंचायत आमेर में मुख्य बाजार से पंचायत भवन तक सीसी इंटरलाकिंग सड़क निर्माण',
      sector: 'Rural',
      panchayat: 'Amer (आमेर)',
      estimatedCostLakhs: 14.50,
      mlaName: 'Sh. Rafeek Khan (आदर्श नगर)'
    },
    {
      id: 'PRP-2026-1088',
      workId: 'WRK-2026-27-094',
      workName: 'Solar Powered High-Mast Street Light Installation in Kishanpole Ward 12',
      workNameHi: 'किशनपोल वार्ड 12 में सौर ऊर्जा चलित हाई-मास्ट लाइट की स्थापना',
      sector: 'Urban',
      panchayat: 'Nagar Nigam Heritage',
      estimatedCostLakhs: 8.75,
      mlaName: 'Sh. Amin Kagzi'
    },
    {
      id: 'PRP-2026-1104',
      workId: 'WRK-2026-27-112',
      workName: 'Drinking Water Tube-Well and Pipeline Extension at Village Andhi',
      workNameHi: 'ग्राम आंधी में पेयजल हेतु नलकूप खनन एवं पाइपलाइन विस्तार कार्य',
      sector: 'Rural',
      panchayat: 'Andhi (आंधी)',
      estimatedCostLakhs: 18.20,
      mlaName: 'Sh. Gopal Sharma'
    }
  ];

  selectedProposal: ApprovedWorkProposal = this.proposals[0];

  // Section 2: Administrative Sanction Details
  asOrderNo = 'AS/2026-27/JAIP/0942';
  asOrderDate = new Date().toISOString().split('T')[0];
  financialYear = '2026-27';
  schemeHead = 'MLALAD / Viksit Rajasthan Abhiyan';
  accountHeadCode = '4515-00-102-01-00-53';
  sanctionedAmountLakhs = 14.50;
  convergenceAmountLakhs = 2.00;
  issuingAuthority = 'Chief Executive Officer (CEO), Zila Parishad Jaipur';
  administrativeNotes = '';

  // Section 3: Agency & Technical Mapping
  executingAgency = 'Gram Panchayat Amer';
  technicalSupervisor = 'Assistant Engineer (AEN) - Panchayati Raj';
  expectedCompletionMonths = 6;
  isTenderRequired = 'Yes';

  // Section 4: Endorsement & AS Copy To List
  endorsementRecipients = [
    { name: 'Sarpanch / Secretary, Gram Panchayat Amer', checked: true },
    { name: 'Assistant Engineer (AEN), Panchayat Samiti Amer', checked: true },
    { name: 'Junior Engineer (JEN), Panchayat Samiti Amer', checked: true },
    { name: 'Accounts Officer, Zila Parishad Jaipur', checked: true },
    { name: 'District Treasury Officer, Jaipur', checked: false },
    { name: 'Honorable MLA / Recommending Authority', checked: true }
  ];

  // Section 5: Documents & Draft
  asOrderFile = 'AS_Order_Draft_1042_Signed.pdf';
  isDraftGenerated = true;
  showSuccessToast = false;

  constructor(public languageService: LanguageService) {}

  onSelectProposal(prop: ApprovedWorkProposal) {
    this.selectedProposal = prop;
    this.sanctionedAmountLakhs = prop.estimatedCostLakhs;
  }

  toggleRecipient(index: number) {
    this.endorsementRecipients[index].checked = !this.endorsementRecipients[index].checked;
  }

  generateDraftOrder() {
    this.isDraftGenerated = true;
  }

  onSubmitAS() {
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 5000);
  }
}
