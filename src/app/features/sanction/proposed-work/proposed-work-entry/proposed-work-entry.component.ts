import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-proposed-work-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proposed-work-entry.component.html',
  styleUrls: ['./proposed-work-entry.component.css']
})
export class ProposedWorkEntryComponent {
  // Classification
  sector: 'Rural' | 'Urban' = 'Rural';
  financialYear = '2026-27';
  workType: 'New Work' | 'Maintenance Work' = 'New Work';
  workName = '';
  workApprovalNo = 'REC/2026-27/JAIP/1042';

  // Shree Yojana & Convergence
  shreeYojana = false;
  campaigningScheme = '--Select--';
  workPriority = '1';
  convergence: 'Yes' | 'No' = 'No';

  // Dates & Location
  approvalDate = '2026-07-28';
  receiptDate = '2026-07-28';
  district = 'JAIPUR (जयपुर)';
  workRelatedTo = 'Village';

  // Block, Panchayat, Village selectors
  selectedBlock = 'आमेर';
  selectedPanchayat = 'आमेर पंचायत-1';
  selectedVillage = 'आमेर गाँव';

  blocks = [
    'आंधी (Aandhi)',
    'आमेर (Amer)',
    'किशनगढ़ रेनवाल (Kishangarh Renwal)',
    'कोटखावदा (Kotkhawada)',
    'गोविन्दगढ़ (Govindgarh)',
    'चाकसू (Chaksu)',
    'जमवा रामगढ़ (Jamwa Ramgarh)',
    'लालसू (Lalsot/Lalsu)',
    'जोबनेर (Jobner)',
    'झोटवाड़ा (Jhotwara)'
  ];

  panchayats = [
    'आमेर पंचायत-1 (Amer-1)',
    'आमेर पंचायत-2 (Amer-2)',
    'कुकस (Kukas)',
    'लबाना (Labana)',
    'सिरोली (Siroli)'
  ];

  villages = [
    'आमेर गाँव (Amer Village)',
    'कुकस गाँव (Kukas Village)',
    'हाथी गाँव (Hathi Gaon)',
    'नागल सुसावतान (Nangal Susawatan)',
    'चम्पपुरा (Champapura)'
  ];

  // Category & Executing Agency
  workCategory = 'CC Road & Drainage';
  workSubCategory = 'Panchayat Interlocking Road';
  executingDepartment = 'Panchayati Raj Department';
  executingAgency = 'Zila Parishad Jaipur';
  blockwiseAgency = 'Panchayat Samiti Amer';
  expectedTimeMonths = 6;

  // Beneficiary
  beneficiary: 'Group' | 'Individual' | 'Community' = 'Community';
  beneficiaryType = 'General';
  bplCategory = 'APL';
  schemeDepartment = 'Rural Development';

  // MP / MLA Recommendation
  mpType: 'Lok sabha' | 'Rajya sabha' = 'Lok sabha';
  assembly = '16 - आदर्श नगर (Adarsh Nagar)';
  otherDistrictMla: 'Yes' | 'No' = 'No';
  mlaName = 'Sh. Rafeek Khan (माननीय श्री रफीक खान)';
  mlaPhone = '0141-2223344';
  mlaMobile = '9829001234';

  // Signatory & Outcome
  recommendBy = 'Honorable MLA Sh. Rafeek Khan';
  annualWorkPlan: 'Yes' | 'No' = 'Yes';
  nameSignatory = 'Sh. Rajesh Meena (BDO)';
  designationSignatory = 'Block Development Officer';
  workOutcome = 'ग्रामीण क्षेत्र में वर्षा जल निकासी एवं बारहमासी पक्की सीसी सड़क निर्माण जिससे 2,500 से अधिक नागरिकों को सुगम आवागमन प्राप्त होगा।';
  form5Received: 'Yes' | 'No' = 'Yes';

  // Upload state
  recommendationFile: string | null = 'MLA_Recommendation_Letter_2026.pdf';
  revenueFile: string | null = 'Jamabandi_Khasra_Map.pdf';

  showSuccessToast = false;

  constructor(public languageService: LanguageService) {}

  selectBlock(b: string): void {
    this.selectedBlock = b;
  }

  selectPanchayat(p: string): void {
    this.selectedPanchayat = p;
  }

  selectVillage(v: string): void {
    this.selectedVillage = v;
  }

  onSubmit(): void {
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 4000);
  }

  onReset(): void {
    this.workName = '';
    this.workOutcome = '';
  }
}
