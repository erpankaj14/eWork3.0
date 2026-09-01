import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, TooltipItem } from 'chart.js';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-2',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, TranslatePipe],
  templateUrl: './dashboard-2.component.html'
})
export class Dashboard2Component implements OnInit {

  // Filters
  schemes = ['--All--', 'MPLAD', 'MLALAD', 'DANG', 'BADP'];
  selectedScheme = '--All--';
  
  years = ['--All--', '2026-27', '2025-26', '2024-25'];
  selectedYear = '--All--';

  districts = ['--All--', 'JALOR', 'CHITTAURGARH', 'DUNGARPUR', 'BHILWARA'];
  selectedDistrict = '--All--';

  // KPIs
  kpis = [
    { label: 'Proposed Work', value: '232593', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', colorClass: 'bg-gradient-to-br from-accent-400 to-accent-600', textClass: 'text-accent-650 dark:text-accent-400', cardClass: 'bg-white/70 dark:bg-dark-900/50 backdrop-blur-md border border-slate-200/80 dark:border-dark-800/60 shadow-sm' },
    { label: 'Administrative Sanction', value: '231690', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', colorClass: 'bg-gradient-to-br from-accent-400 to-accent-600', textClass: 'text-accent-600 dark:text-accent-400', cardClass: 'bg-white/70 dark:bg-dark-900/50 backdrop-blur-md border border-slate-200/80 dark:border-dark-800/60 shadow-sm' },
    { label: 'Technical Sanction', value: '228163', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', colorClass: 'bg-gradient-to-br from-emerald-400 to-emerald-600', textClass: 'text-emerald-600 dark:text-emerald-400', cardClass: 'bg-white/70 dark:bg-dark-900/50 backdrop-blur-md border border-slate-200/80 dark:border-dark-800/60 shadow-sm' },
    { label: 'Financial Sanction', value: '226894', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', colorClass: 'bg-white/20', textClass: 'text-white', cardClass: 'bg-gradient-to-br from-accent-600 via-accent-500 to-accent-600 shadow-glow-accent text-white border border-transparent' },
    { label: 'Utilization Certificate', value: '189156', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', colorClass: 'bg-gradient-to-br from-slate-500 to-slate-700', textClass: 'text-slate-600 dark:text-slate-400', cardClass: 'bg-white/70 dark:bg-dark-900/50 backdrop-blur-md border border-slate-200/80 dark:border-dark-800/60 shadow-sm' },
    { label: 'Completion Certificate', value: '105985', icon: 'M5 13l4 4L19 7', colorClass: 'bg-gradient-to-br from-accent-500 to-accent-700', textClass: 'text-accent-600 dark:text-accent-400', cardClass: 'bg-white/70 dark:bg-dark-900/50 backdrop-blur-md border border-slate-200/80 dark:border-dark-800/60 shadow-sm' }
  ];

  // Premium Vibrant Colors
  chartColors = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#38bdf8', '#f87171'];

  // Global Tooltip Configuration
  private commonTooltip: any = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    titleColor: '#ffffff',
    bodyColor: '#cbd5e1',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    padding: 14,
    bodyFont: { size: 13, family: "'Inter', sans-serif", weight: 'normal' },
    titleFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
    cornerRadius: 12,
    displayColors: true,
    boxPadding: 6,
    usePointStyle: true,
  };

  // 1. Schemewise Expenditure (Pie) -> Changed to advanced Pie
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 20 },
    plugins: {
      legend: { 
        position: 'right', 
        labels: { color: '#64748b', font: { family: "'Inter', sans-serif", size: 12 }, usePointStyle: true, padding: 20 }
      },
      tooltip: this.commonTooltip
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['MPLAD', 'MLALAD', 'DANG', 'BADP', 'MEWAT', 'CMTBADP'],
    datasets: [{
      data: [13.5, 61.2, 3.2, 9.2, 2.9, 0.2],
      backgroundColor: this.chartColors,
      borderWidth: 0,
      hoverOffset: 12,
      // @ts-ignore (spacing exists in chart.js 3+)
      spacing: 6,
      borderRadius: 5
    }]
  };

  // 2. Schemewise Incomplete Works (Donut)
  public donutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    layout: { padding: 20 },
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { color: '#64748b', font: { family: "'Inter', sans-serif", size: 10 }, usePointStyle: true, padding: 15 }
      },
      tooltip: this.commonTooltip
    }
  };
  public donutChartData: ChartData<'doughnut'> = {
    labels: ['MLALAD', 'MPLAD', 'MEWAT', 'BADP', 'CMTBADP', 'MAGRA'],
    datasets: [{
      data: [60.9, 11.6, 3.7, 0.1, 2.5, 3.8],
      backgroundColor: this.chartColors,
      borderWidth: 0,
      hoverOffset: 12,
      spacing: 6,
      borderRadius: 10
    }]
  };

  // 3. No of CC against FS (Line) -> Smooth glowing lines
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    elements: {
      line: { tension: 0.5, borderWidth: 4, borderCapStyle: 'round' }, // Smooth curves
      point: { radius: 0, hoverRadius: 8, borderWidth: 3, backgroundColor: '#ffffff' }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" }, padding: 10 } 
      },
      y: { 
        border: { display: false, dash: [5, 5] }, 
        grid: { color: 'rgba(148, 163, 184, 0.15)', tickLength: 0 }, 
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" }, padding: 15 } 
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: this.commonTooltip
    }
  };
  public lineChartData: ChartData<'line'> = {
    labels: ['JALOR', 'CHITTAURGARH', 'DUNGARPUR', 'BHILWARA', 'JHALAWAR', 'BARAN', 'KARAULI', 'DHAULPUR'],
    datasets: [
      { 
        data: [4500, 6000, 8500, 10000, 5500, 5000, 4000, 6800], 
        label: 'CC', 
        borderColor: '#f43f5e', // rose-500
        backgroundColor: 'rgba(244, 63, 94, 0.1)', 
        fill: true, 
      },
      { 
        data: [4000, 5200, 7800, 9000, 5000, 4800, 3900, 5800], 
        label: 'FS', 
        borderColor: '#f97316', // Saffron
        backgroundColor: 'rgba(249, 115, 22, 0.1)', 
        fill: true,
      }
    ]
  };

  // 4. Financial Year Wise Comparison (Bar) -> Rounded Pill Bars
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" }, padding: 10 } 
      },
      y: { 
        border: { display: false, dash: [5, 5] }, 
        grid: { color: 'rgba(148, 163, 184, 0.15)', tickLength: 0 }, 
        ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" }, padding: 15 } 
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: this.commonTooltip
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: ['2026-27', '2025-26', '2024-25', '2023-24', '2022-23', '2021-22'],
    datasets: [
      { 
        data: [2500, 21000, 15000, 29000, 25000, 14000], 
        label: 'FS', 
        backgroundColor: '#f472b6', 
        borderRadius: 50, 
        borderSkipped: false,
        barThickness: 16
      },
      { 
        data: [2000, 22000, 5000, 5500, 2000, 1000], 
        label: 'CC', 
        backgroundColor: '#818cf8', 
        borderRadius: 50, 
        borderSkipped: false,
        barThickness: 16
      }
    ]
  };

  // Table Data
  mlaData: any[] = [
    { sno: 31, name: 'श्री उदयलाल डांगी', assembly: 'वल्लभनगर', asno: 44, param1: 20, param2: '-', param3: 500.0, param4: 87.32529, param5: 412.67471 },
    { sno: 32, name: 'श्री उदयलाल भडाणा', assembly: 'मांडल', asno: 18, param1: 14, param2: '-', param3: 500.0, param4: 53.01208, param5: 446.98792 },
    { sno: 33, name: 'श्री उमेश मीणा', assembly: 'आसपुर', asno: 6, param1: 4, param2: '-', param3: 500.0, param4: 44.53509, param5: 455.46491 },
    { sno: 34, name: 'श्री ओटा राम देवासी', assembly: 'सिरोही', asno: 4, param1: 1, param2: '-', param3: 500.0, param4: 5.0, param5: 495.0 },
    { sno: 35, name: 'श्री कन्हैया लाल', assembly: 'मालपुरा', asno: 60, param1: 11, param2: '-', param3: 500.0, param4: 14.0, param5: 486.0 },
    { sno: 36, name: 'श्री कुलदीप', assembly: 'विराटनगर', asno: '-', param1: '-', param2: '-', param3: 500.0, param4: '-', param5: 500.0 }
  ];

  constructor() { }

  // Predictive Trends (NEW SECTION)
  public predictiveChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4, borderWidth: 4, borderDash: [5, 5] },
      point: { radius: 0, hoverRadius: 6 }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    plugins: {
      legend: { display: false },
      tooltip: this.commonTooltip
    }
  };

  public predictiveChartData: ChartData<'line'> = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4 (Projected)'],
    datasets: [
      {
        data: [12000, 15000, 14000, 22000],
        label: 'Projected Sanctions',
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true
      }
    ]
  };

  ngOnInit(): void {
    // Initialization logic if any
  }

}
