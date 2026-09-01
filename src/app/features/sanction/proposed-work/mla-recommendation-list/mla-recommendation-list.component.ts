import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';

interface MlaRecommendationRecord {
  sno: number;
  mlaName: string;
  aNo: string;
  constituency: string;
  workName: string;
  workNameHi: string;
  sector: 'Urban' | 'Rural';
  district: string;
  block: string;
  panchayat: string;
  village: string;
  town: string;
  agency: string;
  subAgency: string;
  receiptDate: string;
  createdDate: string;
  updatedDate: string;
  convergence: 'Yes' | 'No';
  proposedAmountLacs: number;
  approvalNo: string;
  workId: string;
}

@Component({
  selector: 'app-mla-recommendation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mla-recommendation-list.component.html',
  styleUrls: ['./mla-recommendation-list.component.css']
})
export class MlaRecommendationListComponent {
  financialYear = '--All--';
  selectedMla = '--All MLA--';
  searchQuery = '';

  totalCount = 782;

  records: MlaRecommendationRecord[] = [
    {
      sno: 1,
      mlaName: 'Sh रफीक खान (Sh. Rafeek Khan)',
      aNo: '16',
      constituency: 'आदर्श नगर (Adarsh Nagar)',
      workName: 'Ramp construction and maintenance work with barricading gate near ward 14',
      workNameHi: 'रेम्प निर्माण/मरम्मत कार्य बैरिक एवं गेट व अन्य मरम्मत कार्य',
      sector: 'Urban',
      district: 'जयपुर',
      block: 'जयपुर (नगर निगम)',
      panchayat: '-',
      village: '-',
      town: 'Jaipur (M Corp.) (Part)',
      agency: 'नगर निगम',
      subAgency: 'आयुक्त नगर निगम जयपुर',
      receiptDate: '20/06/2026',
      createdDate: '20/06/2026',
      updatedDate: '21/06/2026',
      convergence: 'No',
      proposedAmountLacs: 20.00,
      approvalNo: '2026-27/16-053/3',
      workId: 'WRK-2026-0091'
    },
    {
      sno: 2,
      mlaName: 'Sh रफीक खान (Sh. Rafeek Khan)',
      aNo: '16',
      constituency: 'आदर्श नगर (Adarsh Nagar)',
      workName: 'Hall construction and toilet complex work in primary school premises',
      workNameHi: 'हॉल निर्माण एवं शौचालय निर्माण कार्य',
      sector: 'Urban',
      district: 'जयपुर',
      block: 'जयपुर (नगर निगम)',
      panchayat: '-',
      village: '-',
      town: 'Jaipur (M Corp.) (Part)',
      agency: 'नगर निगम',
      subAgency: 'आयुक्त नगर निगम जयपुर',
      receiptDate: '20/06/2026',
      createdDate: '20/06/2026',
      updatedDate: '20/06/2026',
      convergence: 'No',
      proposedAmountLacs: 10.00,
      approvalNo: '2026-27/16-053/2',
      workId: 'WRK-2026-0092'
    },
    {
      sno: 3,
      mlaName: 'Sh गोपाल शर्मा (Sh. Gopal Sharma)',
      aNo: '17',
      constituency: 'सिविल लाइन्स (Civil Lines)',
      workName: 'Ward 37 Banipark Dharmik Sanstha Seva Dwar operating Maharshi Raman CC road',
      workNameHi: 'वार्ड नं 37 स्थित बनीपार्क धार्मिक संस्था सेवा द्वारा संचालित महर्षि रमण सीसी सड़क',
      sector: 'Urban',
      district: 'जयपुर',
      block: 'जयपुर (सार्वजनिक निर्माण)',
      panchayat: '-',
      village: '-',
      town: 'Jaipur (M Corp.) (Part)',
      agency: 'सार्वजनिक निर्माण',
      subAgency: 'अधिशाषी अभियंता सार्वजनिक निर्माण',
      receiptDate: '19/06/2026',
      createdDate: '19/06/2026',
      updatedDate: '19/06/2026',
      convergence: 'No',
      proposedAmountLacs: 18.00,
      approvalNo: '2026-27/17-081/1',
      workId: 'WRK-2026-0078'
    },
    {
      sno: 4,
      mlaName: 'Sh अमीन कागजी (Sh. Amin Kagzi)',
      aNo: '18',
      constituency: 'किशनपोल (Kishanpole)',
      workName: 'Tube-well boring and high mast solar light installation at community square',
      workNameHi: 'सामुदायिक चौक पर ट्यूबवेल बोरिंग एवं हाई मास्ट सोलर लाइट स्थापना कार्य',
      sector: 'Rural',
      district: 'जयपुर',
      block: 'आमेर',
      panchayat: 'कुकस',
      village: 'कुकस गाँव',
      town: '-',
      agency: 'पंचायती राज',
      subAgency: 'विकास अधिकारी आमेर',
      receiptDate: '15/06/2026',
      createdDate: '15/06/2026',
      updatedDate: '16/06/2026',
      convergence: 'Yes',
      proposedAmountLacs: 12.50,
      approvalNo: '2026-27/18-022/4',
      workId: 'WRK-2026-0064'
    }
  ];

  constructor(public languageService: LanguageService) {}

  get filteredRecords(): MlaRecommendationRecord[] {
    if (!this.searchQuery.trim()) {
      return this.records;
    }
    const q = this.searchQuery.toLowerCase();
    return this.records.filter(r =>
      r.workName.toLowerCase().includes(q) ||
      r.workNameHi.toLowerCase().includes(q) ||
      r.mlaName.toLowerCase().includes(q) ||
      r.constituency.toLowerCase().includes(q) ||
      r.approvalNo.toLowerCase().includes(q)
    );
  }
}
