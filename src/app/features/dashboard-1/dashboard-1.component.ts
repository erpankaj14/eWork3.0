import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { TranslatePipe } from '@ngx-translate/core';

interface SchemeDetail {
  name: string;
  hindiName: string;
  allocated: number;
  spent: number;
  percent: number;
  colorClass: string;
}

interface AlertItem {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  scheme: string;
  time: string;
}

interface ActivityLog {
  time: string;
  district: string;
  action: string;
  details: string;
  badgeColor: string;
}

@Component({
  selector: 'app-dashboard-1',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, CountUpDirective, TranslatePipe],
  templateUrl: './dashboard-1.component.html',
  styleUrls: ['./dashboard-1.component.css']
})
export class Dashboard1Component implements OnInit {

  // Active filters
  selectedDistrict = '--All--';
  selectedTimeline = 'This Month';

  districts = ['--All--', 'Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner', 'Kota', 'Alwar', 'Sikar'];
  timelines = ['This Month', 'Last Quarter', 'Financial Year'];

  // KPIs raw numbers for CountUp animation
  kpis = [
    { label: 'Total Works Recommended', rawValue: 14290, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', colorClass: 'text-accent-500 dark:text-accent-400', bgClass: 'bg-accent-500/10' },
    { label: 'Sanctions Issued (AS/FS)', rawValue: 11650, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
    { label: 'Works Physically Completed', rawValue: 8420, icon: 'M5 13l4 4L19 7', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
    { label: 'Total Expenditure (₹ in Cr)', rawValue: 312.45, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10', isDecimal: true }
  ];

  // Scheme progress metrics
  schemes: SchemeDetail[] = [
    { name: 'MGNREGA', hindiName: 'महात्मा गांधी नरेगा', allocated: 120.5, spent: 105.2, percent: 87, colorClass: 'bg-emerald-500' },
    { name: 'PMAY-G', hindiName: 'पीएम आवास योजना', allocated: 95.8, spent: 81.4, percent: 85, colorClass: 'bg-accent-500' },
    { name: 'SBM-G', hindiName: 'स्वच्छ भारत मिशन', allocated: 45.2, spent: 39.8, percent: 88, colorClass: 'bg-blue-500' },
    { name: 'MLA-LAD', hindiName: 'विधायक स्थानीय विकास', allocated: 35.0, spent: 22.1, percent: 63, colorClass: 'bg-purple-500' },
    { name: 'BADP', hindiName: 'सीमा क्षेत्र विकास', allocated: 16.5, spent: 9.8, percent: 59, colorClass: 'bg-rose-500' }
  ];

  // Critical Alerts
  alerts: AlertItem[] = [
    { id: '#AL-901', type: 'danger', message: 'Administrative Sanction delayed over 45 days', scheme: 'MLA-LAD', time: '1 hour ago' },
    { id: '#AL-902', type: 'warning', message: 'Expenditure mismatch detected in Panchayat Fund', scheme: 'PMAY-G', time: '3 hours ago' },
    { id: '#AL-903', type: 'info', message: 'Physical target completed ahead of release schedule', scheme: 'SBM-G', time: 'Yesterday' }
  ];

  // Live Telemetry Feed
  activityFeed: ActivityLog[] = [
    { time: '10 mins ago', district: 'Jaipur', action: 'Work Sanctioned', details: '₹18.5 Lacs released for Graval Road in Bassi Block.', badgeColor: 'bg-accent-500' },
    { time: '25 mins ago', district: 'Jodhpur', action: 'Asset Photographed', details: 'Geo-tagged stage 2 photo uploaded for SBM community toilet block.', badgeColor: 'bg-blue-500' },
    { time: '1 hour ago', district: 'Udaipur', action: 'UC Submitted', details: 'Utilization Certificate of ₹12.0 Lacs submitted for model school building.', badgeColor: 'bg-emerald-500' },
    { time: '2 hours ago', district: 'Bikaner', action: 'Project Completed', details: 'Clean drinking water well successfully handed over to panchayat.', badgeColor: 'bg-purple-500' },
    { time: 'Yesterday', district: 'Sikar', action: 'Audit Initiated', details: 'Social audit scheduled for 14 NREGA works in Laxmangarh block.', badgeColor: 'bg-rose-500' }
  ];

  // Common Tooltip
  private commonTooltip: any = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    titleColor: '#ffffff',
    bodyColor: '#cbd5e1',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    padding: 14,
    bodyFont: { size: 13, family: "'Inter', sans-serif" },
    titleFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
    cornerRadius: 12,
    displayColors: true,
    usePointStyle: true,
  };

  // 1. Monthly Bar Chart
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif" }, usePointStyle: true } },
      tooltip: this.commonTooltip
    },
    scales: {
      x: { 
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }, 
        grid: { display: false } 
      },
      y: { 
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }, 
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        border: { display: false, dash: [5, 5] }
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [340, 480, 520, 610, 490, 550], label: 'Sanctions (AS/FS)', backgroundColor: '#f97316', borderRadius: 6, barThickness: 14 },
      { data: [210, 390, 400, 420, 510, 480], label: 'Completed Works', backgroundColor: '#0f4cba', borderRadius: 6, barThickness: 14 }
    ]
  };

  // 2. Regional Doughnut Chart
  public doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: this.commonTooltip
    }
  };

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Panchayat Infrastructures', 'Water & Agriculture Dev', 'Constituency Local Works', 'Social Welfare Services'],
    datasets: [
      { 
        data: [4200, 3800, 2400, 1250], 
        backgroundColor: ['#0f4cba', '#f97316', '#a855f7', '#ec4899'], 
        borderWidth: 0,
        hoverOffset: 10,
        // @ts-ignore
        spacing: 5,
        borderRadius: 8
      }
    ]
  };

  ngOnInit(): void {
  }

  // Filter Trigger (Mock update)
  applyFilters() {
    // Generate variations in numbers to simulate filter actions
    const seed = this.selectedDistrict.length + this.selectedTimeline.length;
    this.kpis = [
      { label: 'Total Works Recommended', rawValue: Math.round(14290 * (1 + (seed % 5) * 0.05)), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', colorClass: 'text-accent-500 dark:text-accent-400', bgClass: 'bg-accent-500/10' },
      { label: 'Sanctions Issued (AS/FS)', rawValue: Math.round(11650 * (1 + (seed % 3) * 0.03)), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
      { label: 'Works Physically Completed', rawValue: Math.round(8420 * (1 + (seed % 4) * 0.04)), icon: 'M5 13l4 4L19 7', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
      { label: 'Total Expenditure (₹ in Cr)', rawValue: parseFloat((312.45 * (1 + (seed % 6) * 0.02)).toFixed(2)), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10', isDecimal: true }
    ];
  }
}
