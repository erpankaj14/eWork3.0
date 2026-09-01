import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface ReleasedVsExpenditure {
  year: string;
  release: number;
  expenditure: number;
}

interface FsVsCc {
  year: string;
  fs: number;
  cc: number;
}

interface CategoryWiseData {
  category: string;
  fs: number;
  cc: number;
  count: number;
}

interface ActivityUpdate {
  time: string;
  title: string;
  amount?: number;
  location: string;
  type: 'sanction' | 'completion' | 'progress';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CountUpDirective, BaseChartDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // Filter bindings
  selectedScheme = '--All--';
  selectedYear = '--All--';
  selectedDistrict = '--All--';

  // Filter option lists
  schemes = ['--All--', 'MPLAD (Member of Parliament Local Area Dev.)', 'MLA LAD (Member of Legislative Assembly Dev.)', 'BADP (Border Area Dev. Programme)', 'CM BPL Awas Yojana', 'CM District Special Road Scheme', 'Jan Bhagidari'];
  years = ['--All--', '2022-23', '2023-24', '2024-25', '2025-26'];
  districts = ['--All--', 'Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner', 'Kota', 'Alwar', 'Sikar'];

  // KPI Metrics (Calculated dynamically)
  totalAllocated = 1942901.42;
  totalReleased = 1196649.55;
  totalExpenditure = 996322.25;
  worksRecommended = 232498;
  worksCompleted = 200104;

  // Base Data arrays
  private baseReleasedVsExpenditure: ReleasedVsExpenditure[] = [
    { year: '2022-23', release: 113012.27, expenditure: 120116.18 },
    { year: '2023-24', release: 126465.03, expenditure: 147820.50 },
    { year: '2024-25', release: 95400.00, expenditure: 89650.00 },
    { year: '2025-26', release: 47150.00, expenditure: 41271.72 }
  ];

  private baseFsVsCc: FsVsCc[] = [
    { year: '2022-23', fs: 23992, cc: 23064 },
    { year: '2023-24', fs: 28450, cc: 25559 },
    { year: '2024-25', fs: 19800, cc: 17200 },
    { year: '2025-26', fs: 23865, cc: 7561 }
  ];

  private baseCategoryData: CategoryWiseData[] = [
    { category: 'PMAY-G (Housing)', fs: 62400, cc: 55800, count: 1850 },
    { category: 'MGNREGA Works', fs: 51200, cc: 48500, count: 1480 },
    { category: 'Swachh Bharat Mission', fs: 45000, cc: 42400, count: 1150 },
    { category: 'MPLADS / MLALAD', fs: 38200, cc: 34800, count: 920 },
    { category: 'Water Conservation (Jal Swavalamban)', fs: 31500, cc: 28200, count: 740 },
    { category: 'Panchayat Bhawan Nirman', fs: 25500, cc: 22200, count: 610 },
    { category: 'Rural Roads & Pathways', fs: 19400, cc: 17900, count: 520 },
    { category: 'Aanganwadi / Education', fs: 15500, cc: 13200, count: 380 },
    { category: 'Health Infrastructure', fs: 11900, cc: 9500, count: 290 },
    { category: 'Public Facilities (Smashan/Kabristan)', fs: 8500, cc: 7100, count: 240 },
    { category: 'Animal Shelter (Gaushala)', fs: 6400, cc: 5900, count: 180 },
    { category: 'Sports Infrastructure', fs: 4500, cc: 3800, count: 95 }
  ];

  recentActivities: ActivityUpdate[] = [
    { time: '10 mins ago', title: 'Road Construction Sanctioned', amount: 15.50, location: 'Jaipur Rural', type: 'sanction' },
    { time: '1 hour ago', title: 'Panchayat Bhawan Completed', location: 'Jodhpur', type: 'completion' },
    { time: '2 hours ago', title: 'Water Conservation Project', amount: 8.20, location: 'Udaipur', type: 'progress' },
    { time: '4 hours ago', title: 'School Building Upgrade', amount: 22.00, location: 'Bikaner', type: 'sanction' },
    { time: '5 hours ago', title: 'Health Center Renovation', location: 'Ajmer', type: 'completion' },
    { time: 'Yesterday', title: 'Solar Lights Installation', amount: 4.50, location: 'Kota', type: 'sanction' }
  ];

  // Active view arrays
  currentReleasedVsExpenditure: ReleasedVsExpenditure[] = [];
  currentFsVsCc: FsVsCc[] = [];
  currentCategoryData: CategoryWiseData[] = [];

  // Home Page Advanced Chart Configuration
  public homeLineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    elements: {
      line: { tension: 0.5, borderWidth: 4, borderCapStyle: 'round' },
      point: { radius: 0, hoverRadius: 8, borderWidth: 3, backgroundColor: '#ffffff' }
    },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        padding: 14,
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        cornerRadius: 12,
        usePointStyle: true,
      }
    }
  };

  public homeLineChartData: ChartData<'line'> = {
    labels: ['2022-23', '2023-24', '2024-25', '2025-26'],
    datasets: [
      { 
        data: [120116.18, 147820.50, 89650.00, 41271.72], 
        label: 'Expenditure', 
        borderColor: '#34d399', 
        backgroundColor: 'rgba(52, 211, 153, 0.2)', 
        fill: true, 
      },
      { 
        data: [113012.27, 126465.03, 95400.00, 47150.00], 
        label: 'Release', 
        borderColor: '#60a5fa', 
        backgroundColor: 'rgba(96, 165, 250, 0.1)', 
        fill: true,
      }
    ]
  };

  ngOnInit() {
    this.resetData();
  }

  resetData() {
    this.totalAllocated = 1942901.42;
    this.totalReleased = 1196649.55;
    this.totalExpenditure = 996322.25;
    this.worksRecommended = 232498;
    this.worksCompleted = 200104;

    this.currentReleasedVsExpenditure = [...this.baseReleasedVsExpenditure];
    this.currentFsVsCc = [...this.baseFsVsCc];
    this.currentCategoryData = [...this.baseCategoryData];
  }

  // Calculate dynamic scales based on dropdown selection
  applyFilters() {
    if (this.selectedScheme === '--All--' && this.selectedYear === '--All--' && this.selectedDistrict === '--All--') {
      this.resetData();
      return;
    }

    const hash = this.getSelectionHash();
    
    // Scale factor
    let scale = 1.0;
    if (this.selectedScheme !== '--All--') scale *= 0.15;
    if (this.selectedYear !== '--All--') scale *= 0.25;
    if (this.selectedDistrict !== '--All--') scale *= 0.08;

    const valVariation = (h: number, min: number, max: number) => {
      return min + (Math.abs(Math.sin(h)) * (max - min));
    };

    const h = hash;
    this.totalAllocated = parseFloat((1942901.42 * scale * valVariation(h, 0.8, 1.2)).toFixed(2));
    this.totalReleased = parseFloat((1196649.55 * scale * valVariation(h + 1, 0.75, 1.15)).toFixed(2));
    this.totalExpenditure = parseFloat((996322.25 * scale * valVariation(h + 2, 0.7, 1.1)).toFixed(2));
    this.worksRecommended = Math.round(232498 * scale * valVariation(h + 3, 0.8, 1.2));
    this.worksCompleted = Math.round(200104 * scale * valVariation(h + 4, 0.75, 1.15));

    // Handle Released vs Expenditure year filtering
    this.currentReleasedVsExpenditure = this.baseReleasedVsExpenditure.map(item => {
      let activeScale = scale;
      if (this.selectedYear !== '--All--' && item.year !== this.selectedYear) {
        activeScale = 0.0; // Hide other years
      } else if (this.selectedYear !== '--All--') {
        activeScale = 1.0 * (this.selectedScheme !== '--All--' ? 0.3 : 1.0) * (this.selectedDistrict !== '--All--' ? 0.15 : 1.0);
      }
      return {
        ...item,
        release: parseFloat((item.release * activeScale * valVariation(h + 5, 0.85, 1.15)).toFixed(2)),
        expenditure: parseFloat((item.expenditure * activeScale * valVariation(h + 6, 0.8, 1.1)).toFixed(2))
      };
    }).filter(item => item.release > 0);

    // Update Home Line Chart
    this.homeLineChartData = {
      labels: this.currentReleasedVsExpenditure.map(d => d.year),
      datasets: [
        { ...this.homeLineChartData.datasets[0], data: this.currentReleasedVsExpenditure.map(d => d.expenditure) },
        { ...this.homeLineChartData.datasets[1], data: this.currentReleasedVsExpenditure.map(d => d.release) }
      ]
    };

    // Handle FS vs CC year filtering
    this.currentFsVsCc = this.baseFsVsCc.map(item => {
      let activeScale = scale;
      if (this.selectedYear !== '--All--' && item.year !== this.selectedYear) {
        activeScale = 0.0; // Hide other years
      } else if (this.selectedYear !== '--All--') {
        activeScale = 1.0 * (this.selectedScheme !== '--All--' ? 0.3 : 1.0) * (this.selectedDistrict !== '--All--' ? 0.15 : 1.0);
      }
      return {
        ...item,
        fs: Math.round(item.fs * activeScale * valVariation(h + 7, 0.85, 1.15)),
        cc: Math.round(item.cc * activeScale * valVariation(h + 8, 0.8, 1.1))
      };
    }).filter(item => item.fs > 0);

    // Categories
    this.currentCategoryData = this.baseCategoryData.map(item => {
      const activeScale = scale * 6.0; // amplify for visual display
      return {
        ...item,
        fs: Math.round(item.fs * activeScale * valVariation(h + 9, 0.9, 1.1)),
        cc: Math.round(item.cc * activeScale * valVariation(h + 10, 0.85, 1.05)),
        count: Math.round(item.count * activeScale * valVariation(h + 11, 0.9, 1.1))
      };
    });
  }

  // Get max values for percentage width calculations
  getMaxReleaseExpenditure(): number {
    if (this.currentReleasedVsExpenditure.length === 0) return 1;
    return Math.max(...this.currentReleasedVsExpenditure.map(d => Math.max(d.release, d.expenditure)));
  }

  getMaxFsCc(): number {
    if (this.currentFsVsCc.length === 0) return 1;
    return Math.max(...this.currentFsVsCc.map(d => Math.max(d.fs, d.cc)));
  }

  getMaxCategoryFsCc(): number {
    if (this.currentCategoryData.length === 0) return 1;
    return Math.max(...this.currentCategoryData.map(d => Math.max(d.fs, d.cc)));
  }

  private getSelectionHash(): number {
    const str = this.selectedScheme + this.selectedYear + this.selectedDistrict;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }
}
