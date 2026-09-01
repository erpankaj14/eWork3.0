import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountUpDirective } from '../../shared/directives/count-up.directive';

@Component({
  selector: 'app-dashboard-1',
  standalone: true,
  imports: [CommonModule, FormsModule, CountUpDirective],
  templateUrl: './dashboard-1.component.html',
  styleUrl: './dashboard-1.component.css'
})
export class Dashboard1Component {
  selectedYear = 'All';
  selectedDistrict = 'All';

  years = ['All', '2022-23', '2023-24', '2024-25', '2025-26'];
  districts = ['All', 'Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner', 'Kota', 'Alwar', 'Sikar'];

  // Circular Stats Data
  stats = [
    { label: 'स्वीकृत कार्य', count: 125430, color: 'text-white', bg: 'bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500 shadow-glow-primary', border: 'border-transparent', icon: 'M5 13l4 4L19 7' }, // Approved
    { label: 'पूर्ण कार्य', count: 98200, color: 'text-accent-500', bg: 'bg-accent-500/10', border: 'border-accent-500/20', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }, // Completed
    { label: 'प्रगतिरत कार्य', count: 15400, color: 'text-primary-400', bg: 'bg-primary-400/10', border: 'border-primary-400/20', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }, // Ongoing
    { label: 'अप्राप्त कार्य', count: 8500, color: 'text-accent-400', bg: 'bg-accent-400/10', border: 'border-accent-400/20', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' }, // Unreceived
    { label: 'निरस्त कार्य', count: 2100, color: 'text-primary-600', bg: 'bg-primary-600/10', border: 'border-primary-600/20', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' }, // Cancelled
    { label: 'अन्य', count: 1230, color: 'text-accent-600', bg: 'bg-accent-600/10', border: 'border-accent-600/20', icon: 'M4 6h16M4 12h16M4 18h16' } // Other
  ];

  // 4 Colored Box Tables (State Special Category works)
  // Purple Box: Incomplete
  incompleteStateWorks = [
    { scheme: 'विधायक कोष', sanction: 284, expenditure: 102, works: 12 },
    { scheme: 'मुख्यमंत्री जल', sanction: 450, expenditure: 210, works: 45 },
    { scheme: 'अन्य योजना', sanction: 120, expenditure: 50, works: 8 }
  ];

  // Red Box: Completed
  completedStateWorks = [
    { scheme: 'विधायक कोष', sanction: 400, expenditure: 400, works: 80 },
    { scheme: 'मुख्यमंत्री जल', sanction: 600, expenditure: 600, works: 120 },
    { scheme: 'अन्य योजना', sanction: 150, expenditure: 150, works: 30 }
  ];

  // Green Box: In Progress
  inProgressStateWorks = [
    { scheme: 'विधायक कोष', sanction: 150, expenditure: 80, works: 25 },
    { scheme: 'मुख्यमंत्री जल', sanction: 320, expenditure: 150, works: 60 },
    { scheme: 'अन्य योजना', sanction: 80, expenditure: 40, works: 15 }
  ];

  // Orange Box: Unreceived
  unreceivedStateWorks = [
    { scheme: 'विधायक कोष', sanction: 50, expenditure: 0, works: 50 },
    { scheme: 'मुख्यमंत्री जल', sanction: 100, expenditure: 0, works: 100 },
    { scheme: 'अन्य योजना', sanction: 20, expenditure: 0, works: 20 }
  ];

  // Scheme Buttons
  schemesTabs = [
    'MPLADS', 'MLALAD', 'DDUGJY', 'PMAY-G', 'SBM', 'NRDWP', 'PMGSY', 'BADP', 'MADA', 'TSC', 'SGSY', 'NRLM', 'OTHER'
  ];
  activeScheme = 'MPLADS';
  activeTabIndex = 0;

  setActiveScheme(scheme: string, index: number) {
    this.activeScheme = scheme;
    this.activeTabIndex = index;
  }

  // Detailed Report Table Data
  detailedReport = [
    { id: 1, district: 'अजमेर', target: 500, fs: 450, cc: 400, ongoing: 40, unstarted: 10, expenditure: 1250.50 },
    { id: 2, district: 'अलवर', target: 600, fs: 580, cc: 500, ongoing: 60, unstarted: 20, expenditure: 1500.20 },
    { id: 3, district: 'बांसवाड़ा', target: 400, fs: 350, cc: 300, ongoing: 40, unstarted: 10, expenditure: 850.75 },
    { id: 4, district: 'बारां', target: 300, fs: 280, cc: 250, ongoing: 20, unstarted: 10, expenditure: 650.00 },
    { id: 5, district: 'बाड़मेर', target: 700, fs: 650, cc: 500, ongoing: 100, unstarted: 50, expenditure: 1800.90 },
    { id: 6, district: 'भरतपुर', target: 450, fs: 400, cc: 350, ongoing: 40, unstarted: 10, expenditure: 950.40 },
    { id: 7, district: 'भीलवाड़ा', target: 550, fs: 500, cc: 450, ongoing: 40, unstarted: 10, expenditure: 1350.60 },
    { id: 8, district: 'बीकानेर', target: 650, fs: 600, cc: 550, ongoing: 40, unstarted: 10, expenditure: 1650.30 },
    { id: 9, district: 'बूंदी', target: 250, fs: 200, cc: 150, ongoing: 40, unstarted: 10, expenditure: 450.80 },
    { id: 10, district: 'चित्तौड़गढ़', target: 350, fs: 300, cc: 250, ongoing: 40, unstarted: 10, expenditure: 750.10 },
    { id: 11, district: 'चूरू', target: 450, fs: 400, cc: 350, ongoing: 40, unstarted: 10, expenditure: 1050.20 },
    { id: 12, district: 'दौसा', target: 350, fs: 300, cc: 250, ongoing: 40, unstarted: 10, expenditure: 850.50 }
  ];

  // Scheme wise work Table Data
  schemeWiseWork = [
    { id: 1, scheme: 'DDUGJY', count: 1250, percent: 12.5 },
    { id: 2, scheme: 'PMAY-G', count: 2500, percent: 25.0 },
    { id: 3, scheme: 'SBM', count: 1500, percent: 15.0 },
    { id: 4, scheme: 'PMGSY', count: 800, percent: 8.0 },
    { id: 5, scheme: 'BADP', count: 600, percent: 6.0 },
    { id: 6, scheme: 'MADA', count: 400, percent: 4.0 },
    { id: 7, scheme: 'OTHER', count: 2950, percent: 29.5 }
  ];

  // Quick Insights Data (AI/Logic generated mock data)
  insights = {
    topDistrict: { name: 'JALOR', metric: '94% Completion', color: 'text-emerald-500' },
    attentionRequired: { name: 'MLALAD', metric: '32% Delayed Works', color: 'text-rose-500' },
    budgetUtilized: { value: '88%', label: 'Of Total Allocation', color: 'text-primary-500' }
  };

  // Top Performing Districts Showcase
  topDistrictsShowcase = [
    { name: 'Jaipur', rank: 1, fs: 24500, cc: 24000, color: 'from-emerald-400 to-emerald-600', trend: '+12%' },
    { name: 'Jodhpur', rank: 2, fs: 18200, cc: 17500, color: 'from-blue-400 to-blue-600', trend: '+8%' },
    { name: 'Udaipur', rank: 3, fs: 15400, cc: 14200, color: 'from-purple-400 to-purple-600', trend: '+5%' },
    { name: 'Ajmer', rank: 4, fs: 12000, cc: 11000, color: 'from-pink-400 to-pink-600', trend: '+3%' }
  ];

  applyFilters() {
    // In a real app, this would fetch data
  }

}
