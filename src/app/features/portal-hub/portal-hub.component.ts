import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { AuthService, UserSession } from '../../core/services/auth.service';

export interface CardAccent {
  topBar: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  hoverBorder: string;
  hoverShadow: string;
  titleHover: string;
  stepBg: string;
  btnHover: string;
}

export interface WorkStageItem {
  id: string;
  step: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  color: string;
  bgColor: string;
  badgeEn: string;
  badgeHi: string;
  path: string;
  iconType: string;
  accent?: CardAccent;
}

export interface CorePortalItem {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  badgeEn?: string;
  badgeHi?: string;
  path: string;
  iconType: string;
  colorClass: string;
  subItemsCount: number;
  tags?: { en: string; hi: string }[];
  accent?: CardAccent;
}

export interface CarouselSlide {
  badgeHi: string;
  badgeEn: string;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  actionHi: string;
  actionEn: string;
  filterTarget: 'all' | 'stages' | 'portals';
  bgGradient: string;
  accentColor: string;
  stat1: string;
  stat1Label: string;
  stat2: string;
  stat2Label: string;
  stat3: string;
  stat3Label: string;
}

@Component({
  selector: 'app-portal-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './portal-hub.component.html',
  styleUrls: ['./portal-hub.component.css']
})
export class PortalHubComponent implements OnInit, OnDestroy {
  user: UserSession | null = null;
  searchQuery: string = '';
  activeFilter: 'all' | 'stages' | 'portals' = 'all';

  // Interactive Carousel Slider State
  currentSlide = 0;
  isSliderPaused = false;
  private slideInterval: any;

  slides: CarouselSlide[] = [
    {
      badgeHi: 'राजस्थान सरकार · मुख्य कमांड सेंटर',
      badgeEn: 'Govt. of Rajasthan · Command Center',
      titleHi: 'ई-वर्क 2.0 : 16-चरणीय एकीकृत कार्य निष्पादन एवं वित्तीय निगरानी प्रणाली',
      titleEn: 'e-Work 2.0 : 16-Stage Integrated Work Execution & Financial Monitoring System',
      subtitleHi: 'योजना निर्माण (Planning) से लेकर प्रशासनिक व वित्तीय स्वीकृति (AS/FS), मापन (MB), ऑडिट एवं अंतिम बिलिंग (Billing) तक का 100% डिजिटल ट्रेल।',
      subtitleEn: '100% Digital Trail from Planning, Technical/Financial Sanction, MB Entry, Quality Audit to Final DBT Billing.',
      actionHi: '16 कार्य निष्पादन चरण देखें',
      actionEn: 'Explore 16 Work Stages',
      filterTarget: 'stages',
      bgGradient: 'from-[#3A180E] via-[#522417] to-[#2E120A]',
      accentColor: 'border-orange-400 text-orange-300',
      stat1: '16 चरण',
      stat1Label: 'Lifecycle Stages',
      stat2: '₹ 587 करोड़',
      stat2Label: 'Sanctioned Works',
      stat3: '100% डिजिटल',
      stat3Label: 'DBT Integration'
    },
    {
      badgeHi: 'विभागीय प्रशासनिक एवं वित्तीय नियंत्रण हब',
      badgeEn: 'Departmental Administrative & Control Hub',
      titleHi: '9 मुख्य विभागीय प्रशासनिक एवं वित्तीय नियंत्रण पोर्टल (Core Department Portals)',
      titleEn: '9 Core Department Administrative & Financial Control Modules',
      subtitleHi: 'स्वीकृति प्रबंधन (Sanctions), लाइव कार्य निगरानी (Work Monitoring), यूसी/सीसी प्रमाण पत्र एवं मास्टर निर्देशिका का एक ही एकीकृत स्क्रीन से संचालन।',
      subtitleEn: 'Manage Sanctions, Live Work Monitoring, UC/CC Certificates and Master Directories from one central command center.',
      actionHi: '9 विभागीय पोर्टल देखें',
      actionEn: 'Explore 9 Core Modules',
      filterTarget: 'portals',
      bgGradient: 'from-[#122E1B] via-[#1B4329] to-[#0F2918]',
      accentColor: 'border-emerald-400 text-emerald-300',
      stat1: '9 मॉड्यूल',
      stat1Label: 'Core Modules',
      stat2: '33 जिले',
      stat2Label: 'Districts Active',
      stat3: '24x7 सक्रिय',
      stat3Label: 'Helpdesk Available'
    },
    {
      badgeHi: 'जीआईएस एवं महात्मा गांधी पंचायत केंद्र',
      badgeEn: 'GIS & Mahatma Gandhi Panchayat Kendra',
      titleHi: 'महात्मा गांधी पंचायत केंद्र (MPK) एवं रीयल-टाइम जीआईएस जियो-टैगिंग',
      titleEn: 'Mahatma Gandhi Panchayat Kendra (MPK) & Real-time GIS Geo-Tagging',
      subtitleHi: 'ग्रामीण विकास निर्माण कार्यों का स्थल पर जीआईएस फोटो सत्यापन एवं महात्मा गांधी पंचायत केंद्रों का डिजिटल आधारभूत संरचना निरीक्षण पोर्टल।',
      subtitleEn: 'On-ground GIS photo verification and Mahatma Gandhi Panchayat Kendra digital infrastructure inspection across Gram Panchayats.',
      actionHi: 'सभी 25 मॉड्यूल व चरण देखें',
      actionEn: 'Explore All 25 Modules',
      filterTarget: 'all',
      bgGradient: 'from-[#0B2240] via-[#0F3460] to-[#162A45]',
      accentColor: 'border-amber-400 text-amber-300',
      stat1: '100% जियो-टैग्ड',
      stat1Label: 'GIS Verification',
      stat2: '11,341 GP',
      stat2Label: 'Gram Panchayats',
      stat3: 'पारदर्शी',
      stat3Label: 'Social Audit Ready'
    }
  ];

  // 16 Different Stages of Works (from Official Architecture / Image 1)
  workStages: WorkStageItem[] = [
    {
      id: 'planning',
      step: '01',
      titleEn: 'Planning',
      titleHi: 'योजना निर्माण (Planning)',
      descEn: 'Formulation of Gram Panchayat & District Work Action Plans',
      descHi: 'ग्राम पंचायत एवं जिला वार्षिक कार्य योजना निर्माण एवं प्रस्ताव',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30',
      badgeEn: 'Initial Phase',
      badgeHi: 'प्रथम चरण',
      path: '/portal/stage/planning',
      iconType: 'planning',
      accent: {
        topBar: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500',
        badgeBg: 'bg-orange-50 dark:bg-orange-500/10',
        badgeText: 'text-orange-600 dark:text-orange-300',
        badgeBorder: 'border-orange-200 dark:border-orange-500/30',
        hoverBorder: 'group-hover:border-orange-400 dark:group-hover:border-orange-500',
        hoverShadow: 'group-hover:shadow-orange-500/15',
        titleHover: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
        stepBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
        btnHover: 'group-hover:bg-orange-500 group-hover:text-white dark:group-hover:bg-orange-600'
      }
    },
    {
      id: 'admin-sanction',
      step: '03',
      titleEn: 'Admin. Sanction',
      titleHi: 'प्रशासनिक स्वीकृति (Admin. Sanction)',
      descEn: 'Administrative Sanction (AS) entry, recommendation & dispatch',
      descHi: 'प्रशासनिक स्वीकृति (AS) प्रविष्टि, विधायक अनुशंसा एवं प्रेषण',
      color: 'text-amber-600 dark:text-amber-300',
      bgColor: 'bg-amber-50/90 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40',
      badgeEn: 'Mandatory AS',
      badgeHi: 'अनिवार्य AS',
      path: '/portal/sanction/admin-sanction/entry',
      iconType: 'sanction',
      accent: {
        topBar: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500',
        badgeBg: 'bg-rose-50 dark:bg-rose-500/10',
        badgeText: 'text-rose-600 dark:text-rose-300',
        badgeBorder: 'border-rose-200 dark:border-rose-500/30',
        hoverBorder: 'group-hover:border-rose-400 dark:group-hover:border-rose-500',
        hoverShadow: 'group-hover:shadow-rose-500/15',
        titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
        stepBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
        btnHover: 'group-hover:bg-rose-500 group-hover:text-white dark:group-hover:bg-rose-600'
      }
    },
    {
      id: 'cost-estimation',
      step: '04',
      titleEn: 'Cost Estimation',
      titleHi: 'लागत अनुमान (Cost Estimation)',
      descEn: 'Detailed item-wise cost estimation & material ratio evaluation',
      descHi: 'विस्तृत मदवार लागत अनुमान एवं सामग्री-श्रम अनुपात निर्धारण',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
      badgeEn: 'Estimation',
      badgeHi: 'लागत गणना',
      path: '/portal/stage/cost-estimation',
      iconType: 'estimation',
      accent: {
        topBar: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-500/30',
        hoverBorder: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-500',
        hoverShadow: 'group-hover:shadow-emerald-500/15',
        titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
        stepBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        btnHover: 'group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-600'
      }
    },
    {
      id: 'gis-tagging',
      step: '05',
      titleEn: 'GIS Tagging & Photo Uploading',
      titleHi: 'जीआईएस टैगिंग एवं फोटो अपलोड',
      descEn: 'Geo-referenced site tagging & before-work photo documentation',
      descHi: 'जियो-टैगिंग एवं कार्य-पूर्व फोटोग्राफ अपलोड एवं सत्यापन',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
      badgeEn: 'Geo-Tagged',
      badgeHi: 'जीआईएस टैग्ड',
      path: '/portal/stage/gis-tagging',
      iconType: 'gis',
      accent: {
        topBar: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600',
        badgeBg: 'bg-green-50 dark:bg-green-500/10',
        badgeText: 'text-green-700 dark:text-green-300',
        badgeBorder: 'border-green-200 dark:border-green-500/30',
        hoverBorder: 'group-hover:border-green-500 dark:group-hover:border-green-500',
        hoverShadow: 'group-hover:shadow-green-500/15',
        titleHover: 'group-hover:text-green-700 dark:group-hover:text-green-400',
        stepBg: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
        btnHover: 'group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-600'
      }
    },
    {
      id: 'technical-sanction',
      step: '06',
      titleEn: 'Technical Sanction',
      titleHi: 'तकनीकी स्वीकृति (Technical Sanction)',
      descEn: 'Technical evaluation, engineering verification & TS order issuance',
      descHi: 'तकनीकी मूल्यांकन, इंजीनियरिंग सत्यापन एवं TS आदेश जारी करना',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30',
      badgeEn: 'Engineering TS',
      badgeHi: 'तकनीकी TS',
      path: '/portal/stage/technical-sanction',
      iconType: 'tech-sanction',
      accent: {
        topBar: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500',
        badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
        badgeText: 'text-amber-700 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-500/30',
        hoverBorder: 'group-hover:border-amber-400 dark:group-hover:border-amber-500',
        hoverShadow: 'group-hover:shadow-amber-500/15',
        titleHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-400',
        stepBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
        btnHover: 'group-hover:bg-amber-500 group-hover:text-white dark:group-hover:bg-amber-600'
      }
    },
    {
      id: 'financial-sanction',
      step: '07',
      titleEn: 'Financial Sanction',
      titleHi: 'वित्तीय स्वीकृति (Financial Sanction)',
      descEn: 'Fund allocation approval, eSign verification & FS dispatch',
      descHi: 'राशि आवंटन स्वीकृति, ई-हस्ताक्षर सत्यापन एवं FS प्रेषण',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
      badgeEn: 'Fund Allocated',
      badgeHi: 'वित्त स्वीकृत',
      path: '/portal/sanction/admin-sanction/entry',
      iconType: 'fin-sanction',
      accent: {
        topBar: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',
        badgeBg: 'bg-violet-50 dark:bg-violet-500/10',
        badgeText: 'text-violet-700 dark:text-violet-300',
        badgeBorder: 'border-violet-200 dark:border-violet-500/30',
        hoverBorder: 'group-hover:border-violet-400 dark:group-hover:border-violet-500',
        hoverShadow: 'group-hover:shadow-violet-500/15',
        titleHover: 'group-hover:text-violet-700 dark:group-hover:text-violet-400',
        stepBg: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white',
        btnHover: 'group-hover:bg-violet-600 group-hover:text-white dark:group-hover:bg-violet-600'
      }
    },
    {
      id: 'work-execution',
      step: '08',
      titleEn: 'Work Execution',
      titleHi: 'कार्य निष्पादन (Work Execution)',
      descEn: 'Executing agency mapping, muster roll & on-ground work tracking',
      descHi: 'कार्यकारी एजेंसी आवंटन एवं स्थल पर वास्तविक निर्माण कार्य प्रगति',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-100/70 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40',
      badgeEn: 'In Progress',
      badgeHi: 'प्रगति पर',
      path: '/portal/stage/work-execution',
      iconType: 'execution',
      accent: {
        topBar: 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500',
        badgeBg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10',
        badgeText: 'text-fuchsia-700 dark:text-fuchsia-300',
        badgeBorder: 'border-fuchsia-200 dark:border-fuchsia-500/30',
        hoverBorder: 'group-hover:border-fuchsia-400 dark:group-hover:border-fuchsia-500',
        hoverShadow: 'group-hover:shadow-fuchsia-500/15',
        titleHover: 'group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-400',
        stepBg: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white',
        btnHover: 'group-hover:bg-fuchsia-600 group-hover:text-white dark:group-hover:bg-fuchsia-600'
      }
    },
    {
      id: 'monitoring-evaluation',
      step: '09',
      titleEn: 'Monitoring & Evaluation',
      titleHi: 'निगरानी एवं मूल्यांकन (Monitoring)',
      descEn: 'Work Progress & Financial Monitoring Dashboard (District/Block)',
      descHi: 'जिला एवं ब्लॉक स्तर पर भौतिक एवं वित्तीय कार्य प्रगति निगरानी डैशबोर्ड',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-100/70 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/40',
      badgeEn: 'Live Dashboard',
      badgeHi: 'लाइव डैशबोर्ड',
      path: '/portal/work-monitoring',
      iconType: 'monitoring',
      accent: {
        topBar: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-500/10',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        badgeBorder: 'border-indigo-200 dark:border-indigo-500/30',
        hoverBorder: 'group-hover:border-indigo-400 dark:group-hover:border-indigo-500',
        hoverShadow: 'group-hover:shadow-indigo-500/15',
        titleHover: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-400',
        stepBg: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white',
        btnHover: 'group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600'
      }
    },
    {
      id: 'uccc',
      step: '10',
      titleEn: 'UC / CC',
      titleHi: 'यूसी / सीसी (UC / CC)',
      descEn: 'Utilization Certificate (UC) & Completion Certificate (CC) submission',
      descHi: 'उपयोगिता प्रमाण पत्र (UC) एवं कार्य पूर्णता प्रमाण पत्र (CC) प्रविष्टि',
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-100/70 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40',
      badgeEn: 'Certificates',
      badgeHi: 'प्रमाण पत्र',
      path: '/portal/uccc/uc-entry',
      iconType: 'uccc',
      accent: {
        topBar: 'bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500',
        badgeBg: 'bg-teal-50 dark:bg-teal-500/10',
        badgeText: 'text-teal-700 dark:text-teal-300',
        badgeBorder: 'border-teal-200 dark:border-teal-500/30',
        hoverBorder: 'group-hover:border-teal-400 dark:group-hover:border-teal-500',
        hoverShadow: 'group-hover:shadow-teal-500/15',
        titleHover: 'group-hover:text-teal-700 dark:group-hover:text-teal-400',
        stepBg: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
        btnHover: 'group-hover:bg-teal-500 group-hover:text-white dark:group-hover:bg-teal-600'
      }
    },
    {
      id: 'mb-entry',
      step: '11',
      titleEn: 'M.B. Entry',
      titleHi: 'मापन पुस्तिका प्रविष्टि (M.B. Entry)',
      descEn: 'Measurement Book (MB) digital recording & engineer sign-off',
      descHi: 'डिजिटल मापन पुस्तिका (MB) प्रविष्टि एवं कनिष्ठ अभियंता सत्यापन',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-100/70 dark:bg-orange-500/15 border-orange-300 dark:border-orange-500/40',
      badgeEn: 'MB Verified',
      badgeHi: 'एमबी सत्यापन',
      path: '/portal/transaction/mb-entry',
      iconType: 'mb',
      accent: {
        topBar: 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500',
        badgeBg: 'bg-red-50 dark:bg-red-500/10',
        badgeText: 'text-red-600 dark:text-red-300',
        badgeBorder: 'border-red-200 dark:border-red-500/30',
        hoverBorder: 'group-hover:border-red-400 dark:group-hover:border-red-500',
        hoverShadow: 'group-hover:shadow-red-500/15',
        titleHover: 'group-hover:text-red-600 dark:group-hover:text-red-400',
        stepBg: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
        btnHover: 'group-hover:bg-red-500 group-hover:text-white dark:group-hover:bg-red-600'
      }
    },
    {
      id: 'inspection-audit',
      step: '12',
      titleEn: 'Inspection & Audit',
      titleHi: 'निरीक्षण एवं ऑडिट (Inspection & Audit)',
      descEn: 'Quality control inspection reports, social audit & compliance',
      descHi: 'गुणवत्ता नियंत्रण निरीक्षण, सामाजिक अंकेक्षण एवं अनुपालन रिपोर्ट',
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
      badgeEn: 'Audit Trail',
      badgeHi: 'ऑडिट ट्रेल',
      path: '/portal/stage/inspection-audit',
      iconType: 'audit',
      accent: {
        topBar: 'bg-gradient-to-r from-slate-700 via-indigo-700 to-blue-700',
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-700 dark:text-slate-300',
        badgeBorder: 'border-slate-300 dark:border-slate-700',
        hoverBorder: 'group-hover:border-slate-500 dark:group-hover:border-slate-400',
        hoverShadow: 'group-hover:shadow-slate-500/15',
        titleHover: 'group-hover:text-slate-800 dark:group-hover:text-slate-200',
        stepBg: 'bg-gradient-to-r from-slate-700 to-indigo-700 text-white',
        btnHover: 'group-hover:bg-slate-700 group-hover:text-white dark:group-hover:bg-slate-600'
      }
    },
    {
      id: 'asset-registration',
      step: '13',
      titleEn: 'Asset Registration / Updation',
      titleHi: 'परिसंपत्ति पंजीकरण / अद्यतन',
      descEn: 'National asset registry entry, geo-coordinates & updation',
      descHi: 'सरकारी परिसंपत्ति रजिस्टर में पंजीकरण एवं जीआईएस निर्देश अद्यतन',
      color: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-100/60 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30',
      badgeEn: 'Asset Registered',
      badgeHi: 'पंजीकृत परिसंपत्ति',
      path: '/portal/stage/asset-registration',
      iconType: 'asset',
      accent: {
        topBar: 'bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500',
        badgeBg: 'bg-lime-50 dark:bg-lime-500/10',
        badgeText: 'text-lime-700 dark:text-lime-300',
        badgeBorder: 'border-lime-200 dark:border-lime-500/30',
        hoverBorder: 'group-hover:border-lime-400 dark:group-hover:border-lime-500',
        hoverShadow: 'group-hover:shadow-lime-500/15',
        titleHover: 'group-hover:text-lime-700 dark:group-hover:text-lime-400',
        stepBg: 'bg-gradient-to-r from-lime-600 to-emerald-600 text-white',
        btnHover: 'group-hover:bg-lime-600 group-hover:text-white dark:group-hover:bg-lime-600'
      }
    },
    {
      id: 'adjustment',
      step: '14',
      titleEn: 'Adjustment',
      titleHi: 'समायोजन (Adjustment)',
      descEn: 'Financial reconciliation, expenditure adjustments & ledger balancing',
      descHi: 'वित्तीय समायोजन, व्यय समाधान एवं खाता बही संतुलन प्रविष्टि',
      color: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-100/60 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30',
      badgeEn: 'Reconciled',
      badgeHi: 'समायोजित',
      path: '/portal/stage/adjustment',
      iconType: 'adjustment',
      accent: {
        topBar: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500',
        badgeBg: 'bg-purple-50 dark:bg-purple-500/10',
        badgeText: 'text-purple-700 dark:text-purple-300',
        badgeBorder: 'border-purple-200 dark:border-purple-500/30',
        hoverBorder: 'group-hover:border-purple-400 dark:group-hover:border-purple-500',
        hoverShadow: 'group-hover:shadow-purple-500/15',
        titleHover: 'group-hover:text-purple-700 dark:group-hover:text-purple-400',
        stepBg: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
        btnHover: 'group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600'
      }
    },
    {
      id: 'payment',
      step: '15',
      titleEn: 'Payment',
      titleHi: 'भुगतान (Payment)',
      descEn: 'Direct Benefit Transfer (DBT), contractor bills & Treasury release',
      descHi: 'सीधे बैंक खाते में भुगतान (DBT), संवेदक बिल एवं कोषालय भुगतान',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100/70 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/40',
      badgeEn: 'DBT Payment',
      badgeHi: 'डीबीटी भुगतान',
      path: '/portal/stage/payment',
      iconType: 'payment',
      accent: {
        topBar: 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500',
        badgeBg: 'bg-sky-50 dark:bg-sky-500/10',
        badgeText: 'text-sky-700 dark:text-sky-300',
        badgeBorder: 'border-sky-200 dark:border-sky-500/30',
        hoverBorder: 'group-hover:border-sky-400 group-hover:border-sky-500',
        hoverShadow: 'group-hover:shadow-sky-500/15',
        titleHover: 'group-hover:text-sky-700 dark:group-hover:text-sky-400',
        stepBg: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
        btnHover: 'group-hover:bg-sky-500 group-hover:text-white dark:group-hover:bg-sky-600'
      }
    },
    {
      id: 'billing',
      step: '16',
      titleEn: 'Billing',
      titleHi: 'बिलिंग (Billing)',
      descEn: 'Final voucher generation, scheme ledger closure & archive',
      descHi: 'अंतिम बिल वाउचर जनरेशन, योजना खाता बंद एवं आर्काइव',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30',
      badgeEn: 'Final Voucher',
      badgeHi: 'अंतिम वाउचर',
      path: '/portal/stage/billing',
      iconType: 'billing',
      accent: {
        topBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
        badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
        badgeText: 'text-amber-700 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-500/30',
        hoverBorder: 'group-hover:border-amber-400 group-hover:border-amber-500',
        hoverShadow: 'group-hover:shadow-amber-500/15',
        titleHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-400',
        stepBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        btnHover: 'group-hover:bg-amber-500 group-hover:text-white dark:group-hover:bg-amber-600'
      }
    }
  ];

  // Core System Administrative Portals & Modules
  corePortals: CorePortalItem[] = [];

  getThemeClass(id: string): string {
    const cleanId = id.toLowerCase().trim();
    switch (cleanId) {
      case 'master':
        return 'theme-blue';
      case 'sanction':
      case 'sanction-portal':
        return 'theme-orange';
      case 'transaction':
        return 'theme-rose';
      case 'reports':
        return 'theme-emerald';
      case 'uccc':
      case 'uccc-portal':
        return 'theme-violet';
      case 'admin':
      case 'administrator':
        return 'theme-slate';
      case 'mpk':
        return 'theme-emerald';
      case 'help':
      case 'help-problem':
        return 'theme-rose';
      default:
        // Hash the ID to assign a different colorful theme for dynamic/new menu cards
        const themes = ['theme-orange', 'theme-rose', 'theme-emerald', 'theme-violet', 'theme-blue', 'theme-slate'];
        let hash = 0;
        for (let i = 0; i < cleanId.length; i++) {
          hash = cleanId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % themes.length;
        return themes[index];
    }
  }

  constructor(
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(session => {
      this.user = session || this.authService.getCurrentUser();
      if (this.user && this.user.token) {
        this.loadDynamicMenus(this.user.token);
      }
    });

    this.startSlideTimer();
  }

  ngOnDestroy(): void {
    this.stopSlideTimer();
  }

  startSlideTimer(): void {
    this.stopSlideTimer();
    this.slideInterval = setInterval(() => {
      if (!this.isSliderPaused) {
        this.nextSlide();
      }
    }, 5000);
  }

  stopSlideTimer(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.startSlideTimer(); // Reset timer on manual navigation
  }

  onSlideAction(slide: CarouselSlide): void {
    this.activeFilter = slide.filterTarget;
  }

  setFilter(filter: 'all' | 'stages' | 'portals'): void {
    this.activeFilter = filter;
  }

  get filteredStages(): WorkStageItem[] {
    if (this.activeFilter === 'portals') {
      return [];
    }
    if (!this.searchQuery.trim()) {
      return this.workStages;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.workStages.filter(s =>
      s.titleEn.toLowerCase().includes(q) ||
      s.titleHi.toLowerCase().includes(q) ||
      s.descEn.toLowerCase().includes(q) ||
      s.descHi.toLowerCase().includes(q) ||
      s.step.includes(q)
    );
  }

  get filteredPortals(): CorePortalItem[] {
    if (this.activeFilter === 'stages') {
      return [];
    }
    if (!this.searchQuery.trim()) {
      return this.corePortals;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.corePortals.filter(p =>
      p.titleEn.toLowerCase().includes(q) ||
      p.titleHi.toLowerCase().includes(q) ||
      p.descEn.toLowerCase().includes(q) ||
      p.descHi.toLowerCase().includes(q)
    );
  }

  navigateToPortal(path: string): void {
    if (path) {
      this.router.navigate([path]);
    }
  }

  generateAndOpenPdfReport(): void {
    const dateStr = new Date().toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = new Date().toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const hindiReportHtml = `
      <div class="pdf-container" style="max-width: 800px; margin: 0 auto; background: #ffffff; padding: 25px; font-family: 'Nirmala UI', 'Mangal', 'Segoe UI', 'Noto Sans Devanagari', sans-serif; color: #0f172a; line-height: 1.5;">
        <div style="background: #0f172a; border-radius: 10px 10px 0 0; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border: 1px solid #334155; margin-bottom: 12px;">
          <!-- 1. केशरिया शीर्ष बॉर्डर (Saffron Top Strip) -->
          <div style="background: #FF671F; height: 10px; width: 100%;"></div>

          <div style="padding: 22px 26px 18px 26px;">
            <!-- Top Row: Tricolor Bar Emblem & Government Title -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <!-- भारतीय तिरंगा बार (Tricolor Vertical Ribbon Bars) -->
                <div style="display: flex; gap: 5px;">
                  <div style="width: 7px; height: 38px; background: #FF671F; border-radius: 2px;"></div>
                  <div style="width: 7px; height: 38px; background: #FFFFFF; border-radius: 2px;"></div>
                  <div style="width: 7px; height: 38px; background: #046A38; border-radius: 2px;"></div>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; line-height: 1.2;">राजस्थान सरकार</div>
                  <div style="font-size: 11px; font-weight: 700; color: #FDE68A; letter-spacing: 0.5px;">GOVERNMENT OF RAJASTHAN • e-GOVERNANCE INITIATIVE</div>
                </div>
              </div>
              <!-- Right Executive Seal Tag -->
              <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 6px; text-align: right;">
                <div style="font-size: 13px; color: #F1F5F9; font-weight: 800;">सत्यमेव जयते</div>
                <div style="font-size: 11px; color: #94A3B8; font-weight: 600;">राष्ट्रीय ई-गवर्नेंस पहल</div>
              </div>
            </div>

            <!-- Main Center Title -->
            <div style="text-align: center; padding: 4px 0 10px 0;">
              <div style="font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 6px;">ई-वर्क 2.0 : एकीकृत कार्य एवं वित्तीय निगरानी पोर्टल हब</div>
              <div style="font-size: 13px; font-weight: 600; color: #CBD5E1;">राज्य स्तरीय कार्यकारी समीक्षा एवं प्रगति रिपोर्ट (FY 2026-27)</div>
            </div>
          </div>

          <!-- 3. हरित तल बॉर्डर (Green Bottom Strip) -->
          <div style="background: #046A38; height: 8px; width: 100%;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin: 14px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; font-weight: 600;">
          <div>रिपोर्ट क्रमांक: <strong>EWORK-RAJ-2026-00941</strong></div>
          <div>जारीकर्ता: <strong>प्रशासनिक निगरानी प्रकोष्ठ (NIC राजस्थान)</strong></div>
          <div>दिनांक एवं समय: <strong>${dateStr} (${timeStr})</strong></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px;">
          <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 17px; font-weight: 900; color: #c2410c;">₹ 4,520.80 Cr</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">कुल स्वीकृत वित्तीय बजट</div>
          </div>
          <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 17px; font-weight: 900; color: #c2410c;">24,842</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">सक्रिय इंजीनियरिंग कार्य</div>
          </div>
          <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 17px; font-weight: 900; color: #c2410c;">16 चरण</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">एकीकृत कार्य चक्र चरण</div>
          </div>
          <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 17px; font-weight: 900; color: #c2410c;">9 पोर्टल</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px;">जुड़े हुए विभागीय पोर्टल</div>
          </div>
        </div>

        <div style="font-size: 14px; font-weight: 800; color: #0b2240; border-left: 4px solid #E15B25; padding-left: 10px; margin: 20px 0 10px 0; background: #f1f5f9; padding: 8px 10px; border-radius: 0 6px 6px 0;">1. कार्य निष्पादन एवं वित्तीय प्रबंधन के 16 एकीकृत चरण (Work Lifecycle Stages)</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px;">
          <thead>
            <tr>
              <th style="width: 8%; background: #E15B25; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #c2410c;">क्र.</th>
              <th style="width: 32%; background: #E15B25; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #c2410c;">कार्य चक्र चरण का नाम (हिन्दी)</th>
              <th style="width: 25%; background: #E15B25; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #c2410c;">प्रशासनिक उत्तरदायी स्तर</th>
              <th style="width: 20%; background: #E15B25; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #c2410c;">SLA अनुपालन दर</th>
              <th style="width: 15%; background: #E15B25; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #c2410c;">स्थिति</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">01</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>योजना निर्माण एवं प्रस्ताव</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">ग्राम पंचायत / ब्लॉक समिति</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">100% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">02</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>विधायक अनुशंसा एवं रिवर्ट वर्कफ़्लो</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">विधानसभा क्षेत्र कार्यालय</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">98.5% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">03</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>प्रशासनिक स्वीकृति (AS) प्रक्रिया</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">विभागीय सचिव / मुख्य अभियंता</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">99.2% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">04</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>तकनीकी स्वीकृति (TS) प्राक्कलन</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">अधिशासी अभियंता (XEN)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">97.8% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">05</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>निविदा सूचना एवं NIT प्रकाशन</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">ई-प्रोक्योरमेंट निविदा नोड</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">100% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">06</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>कार्यादेश (Work Order) एवं अनुबंध</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">संभाग / उप-संभाग कार्यालय</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">99.0% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">07</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>माप पुस्तिका (MB) अंकन</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">कनिष्ठ अभियंता (JEN / AEN)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">96.5% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">08</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>भौतिक प्रगति निरीक्षण (Physical)</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">सहायक अभियंता (AEN)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">98.1% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">09</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>चालू विपत्र (RA Bill) भुगतान</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">संभागीय लेखा इकाई</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">99.4% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">10</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>गुणवत्ता नियंत्रण एवं राज्य जांच</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">राज्य गुणवत्ता मॉनिटर (SQM)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">100% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">11</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>जियो-टैगिंग एवं GIS स्थल सत्यापन</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">भुवन / राज्य जियो-पोर्टल</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">99.8% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">12</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>सीधे लाभार्थी वित्तीय हस्तांतरण</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">IFMS 3.0 / ट्रेजरी एकीकरण</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">100% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">13</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>कार्य पूर्णता प्रमाण पत्र (CC)</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">अधिशासी अभियंता (XEN)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">98.9% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">14</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>सार्वजनिक संपत्ति पंजीकरण</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">राज्य संपत्ति इन्वेंटरी डेटाबेस</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">100% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr style="background-color: #fffaf5;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">15</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>रखरखाव एवं दायित्व अवधि निगरानी</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">दोष दायित्व अवधि (DLP) प्रकोष्ठ</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">97.4% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">16</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>अंतिम समायोजन एवं उपयोगिता (UC)</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">महालेखाकार (AG) एवं कोषागार</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">100% अनुपालन</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">सक्रिय</span></td></tr>
          </tbody>
        </table>

        <div style="font-size: 14px; font-weight: 800; color: #0b2240; border-left: 4px solid #0F7A3E; padding-left: 10px; margin: 24px 0 10px 0; background: #f1f5f9; padding: 8px 10px; border-radius: 0 6px 6px 0;">2. जुड़े हुए 9 मुख्य प्रशासनिक एवं विभागीय पोर्टल (Core Department Portals)</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11.5px;">
          <thead>
            <tr>
              <th style="width: 12%; background: #0F7A3E; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #065f46;">पोर्टल कोड</th>
              <th style="width: 38%; background: #0F7A3E; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #065f46;">विभागीय पोर्टल का नाम (हिन्दी)</th>
              <th style="width: 25%; background: #0F7A3E; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #065f46;">नोडल विभाग</th>
              <th style="width: 15%; background: #0F7A3E; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #065f46;">सक्रिय उपयोगकर्ता</th>
              <th style="width: 10%; background: #0F7A3E; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #065f46;">स्थिति</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #f0fdf4;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-01</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>ई-पंचायत एवं ग्रामीण विकास पोर्टल</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">पंचायती राज विभाग</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">12,450 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-02</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>PWD निर्माण एवं संवेदक डैशबोर्ड</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">सार्वजनिक निर्माण विभाग (PWD)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">8,920 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr style="background-color: #f0fdf4;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-03</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>IFMS 3.0 राज्य कोष एवं वित्तीय नोड</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">वित्त विभाग, राजस्थान सरकार</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">18,340 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-04</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>जन सूचना पारदर्शिता पोर्टल</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">सूचना एवं प्रौद्योगिकी (DoIT&C)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">45,210 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr style="background-color: #f0fdf4;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-05</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>पे-मैनेजर वेतन एवं विपत्र पोर्टल</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">राज्य कोषागार एवं लेखा विभाग</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">21,150 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-06</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>मनरेगा ग्रामीण कार्य एकीकरण नोड</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">ग्रामीण विकास एवं पंचायती राज</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">14,800 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr style="background-color: #f0fdf4;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-07</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>नगरीय विकास (LSG) कार्य पोर्टल</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">स्वायत्त शासन विभाग (LSG)</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">6,730 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-08</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>जल संसाधन एवं सिंचाई कार्य नोड</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">जल संसाधन विभाग, राजस्थान</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">5,420 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
            <tr style="background-color: #f0fdf4;"><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">PRT-09</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><strong>राज्य सतर्कता एवं विशेष अंकेक्षण</strong></td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">लोकायुक्त एवं सतर्कता प्रकोष्ठ</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;">2,110 यूज़र</td><td style="padding: 7px 10px; border: 1px solid #cbd5e1;"><span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ऑनलाइन</span></td></tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
          <div>
            <strong>राजस्थान सरकार - राष्ट्रीय सूचना विज्ञान केंद्र (NIC)</strong><br>
            यह एक डिजिटल रूप से सत्यापित एवं रीयल-टाइम जेनरेटेड आधिकारिक रिपोर्ट है।
          </div>
          <div style="border: 2px dashed #E15B25; padding: 8px 14px; border-radius: 6px; color: #c2410c; font-weight: 700; font-size: 11px; text-align: center;">
            ✓ डिजिटल सत्यापित<br>
            e-Work 2.0 Command Center
          </div>
        </div>
      </div>
    `;

    const completeDocHtml = `
      <!DOCTYPE html>
      <html lang="hi">
      <head>
        <meta charset="UTF-8">
        <title>eWork-2.0_एकीकृत_निगरानी_रिपोर्ट_2026.pdf</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Nirmala UI', 'Mangal', 'Segoe UI', 'Noto Sans Devanagari', sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: #334155;
            color: #0f172a;
            padding: 0;
            margin: 0;
            line-height: 1.5;
          }
          /* PDF Reader Top Toolbar (Adobe Acrobat / Chrome style) */
          .pdf-viewer-toolbar {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: #0f172a;
            color: #ffffff;
            padding: 12px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #E15B25;
            box-shadow: 0 4px 15px rgba(0,0,0,0.35);
          }
          .pdf-title-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .pdf-doc-badge {
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.25);
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            color: #FDE68A;
          }
          .pdf-action-buttons {
            display: flex;
            gap: 12px;
          }
          .btn-download {
            background: linear-gradient(135deg, #FF671F 0%, #E15B25 100%);
            color: #ffffff;
            border: none;
            padding: 9px 20px;
            border-radius: 6px;
            font-weight: 800;
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(225,91,37,0.45);
            transition: transform 0.2s;
          }
          .btn-download:hover {
            transform: translateY(-1px);
          }
          /* A4 Document Sheet wrapper */
          .document-sheet-wrapper {
            padding: 30px 15px 50px 15px;
            display: flex;
            justify-content: center;
          }
          .a4-page-sheet {
            width: 100%;
            max-width: 800px;
            background: #ffffff;
            padding: 30px;
            border-radius: 4px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45);
          }
          @media print {
            .pdf-viewer-toolbar {
              display: none !important;
            }
            body {
              background: #ffffff !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .document-sheet-wrapper {
              padding: 0 !important;
            }
            .a4-page-sheet {
              box-shadow: none !important;
              border-radius: 0 !important;
              padding: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- 1. PDF Viewer Top Toolbar -->
        <div class="pdf-viewer-toolbar">
          <div class="pdf-title-group">
            <span style="font-size: 20px;">📄</span>
            <div>
              <div style="font-weight: 800; font-size: 14px; letter-spacing: 0.3px;">eWork-2.0_एकीकृत_निगरानी_रिपोर्ट_2026.pdf</div>
              <div style="font-size: 11px; color: #94A3B8;">आधिकारिक राज्य स्तरीय कार्यकारी गज़ेट रिपोर्ट • राजस्थान सरकार</div>
            </div>
            <div class="pdf-doc-badge">A4 Official Gazette</div>
          </div>
          <div class="pdf-action-buttons">
            <button class="btn-download" onclick="window.print()">
              <span>📥</span>
              <span>PDF फ़ाइल सेव करें (Save as .PDF)</span>
            </button>
          </div>
        </div>

        <!-- 2. A4 Document Sheet -->
        <div class="document-sheet-wrapper">
          <div class="a4-page-sheet">
            ${hindiReportHtml}
          </div>
        </div>

        <!-- 3. Auto Print / Save trigger after font ready -->
        <script>
          window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              window.print();
            }, 750);
          });
        </script>
      </body>
      </html>
    `;

    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.open();
      newTab.document.write(completeDocHtml);
      newTab.document.close();
    }
  }

  loadDynamicMenus(token: string): void {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocalhost ? '/iwmsapi' : 'http://10.130.3.10/iwmsapi';
    const url = `${baseUrl}/api/IwmsWeb/GetParentMenus`;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.mapApiMenusToPortals(response.data);
        }
      },
      error: (err) => {
        console.error('Failed to load parent menus from API:', err);
      }
    });
  }

  mapApiMenusToPortals(apiItems: any[]): void {
    const pathMap: Record<string, string> = {
      'home': '/portal/hub',
      'master': '/portal/master/scheme-configuration',
      'sanction': '/portal/sanction/admin-sanction/entry',
      'transaction': '/portal/transaction/work-proposal',
      'reports': '/portal/reports/physical-progress',
      'uccc': '/portal/uccc/uc-entry',
      'admin': '/portal/admin/menu-creation',
      'administrator': '/portal/admin/menu-creation',
      'mpk': '/portal/mpk/kendra',
      'help': '/portal/help/user-manual'
    };

    const mappedPortals: CorePortalItem[] = [];

    // Order items according to their orderNo from API
    const sortedItems = [...apiItems].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));

    sortedItems.forEach(item => {
      const key = item.menuNameE.toLowerCase().trim();

      // Construct description using ONLY real API values
      const descEn = `Navigate URL: ${item.navigateUrl || '#'} | MVC Path: ${item.mvcPath || 'None'} | Target: ${item.target || 'Self'}`;
      const descHi = `नेविगेट यूआरएल: ${item.navigateUrl || '#'} | एमवीसी पाथ: ${item.mvcPath || 'कोई नहीं'} | लक्ष्य: ${item.target || 'स्वयं'}`;

      const path = pathMap[key] || '/portal/hub';
      const accent = this.getCardAccent(key);

      mappedPortals.push({
        id: key,
        titleEn: item.menuNameE,
        titleHi: item.menuNameH || item.menuNameE,
        descEn: descEn,
        descHi: descHi,
        badgeEn: item.menuType || undefined,
        badgeHi: item.menuType ? (item.menuType === 'admin' ? 'प्रशासनिक' : item.menuType) : undefined,
        path: path,
        iconType: 'default',
        colorClass: this.getDynamicColorClass(item.menuId),
        subItemsCount: item.orderNo || 0,
        tags: undefined,
        accent: accent
      });
    });

    // Exclude 'home' to avoid a redundant hub link inside the hub
    this.corePortals = mappedPortals.filter(p => p.id !== 'home');
  }

  getDynamicColorClass(menuId: number): string {
    const colors = [
      'from-blue-600 to-indigo-700',
      'from-[#E15B25] to-amber-600',
      'from-emerald-600 to-teal-700',
      'from-purple-600 to-indigo-800',
      'from-amber-600 to-orange-700',
      'from-cyan-600 to-blue-700',
      'from-slate-700 to-slate-900',
      'from-[#0F7A3E] to-emerald-800',
      'from-rose-600 to-red-700'
    ];
    return colors[menuId % colors.length];
  }

  getCardAccent(id: string): CardAccent {
    switch (id) {
      case 'planning':
      case 'technical-sanction':
      case 'mb-entry':
      case 'billing':
      case 'sanction-portal':
      case 'sanction':
      case 'transaction':
        return {
          topBar: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500',
          badgeBg: 'bg-orange-50 dark:bg-orange-500/10',
          badgeText: 'text-orange-700 dark:text-orange-300',
          badgeBorder: 'border-orange-200 dark:border-orange-500/30',
          hoverBorder: 'group-hover:border-orange-500 dark:group-hover:border-orange-400',
          hoverShadow: 'group-hover:shadow-orange-500/15',
          titleHover: 'group-hover:text-orange-700 dark:group-hover:text-orange-400',
          stepBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
          btnHover: 'group-hover:bg-orange-500 group-hover:text-white dark:group-hover:bg-orange-600'
        };
      case 'reports':
        return {
          topBar: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
          badgeText: 'text-emerald-700 dark:text-emerald-300',
          badgeBorder: 'border-emerald-200 dark:border-emerald-500/30',
          hoverBorder: 'group-hover:border-emerald-500 dark:group-hover:border-emerald-400',
          hoverShadow: 'group-hover:shadow-emerald-500/15',
          titleHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400',
          stepBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
          btnHover: 'group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-600'
        };
      case 'master':
      case 'uccc-portal':
      case 'uccc':
        return {
          topBar: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
          badgeBg: 'bg-blue-50 dark:bg-blue-500/10',
          badgeText: 'text-blue-700 dark:text-blue-300',
          badgeBorder: 'border-blue-200 dark:border-blue-500/30',
          hoverBorder: 'group-hover:border-blue-500 dark:group-hover:border-blue-400',
          hoverShadow: 'group-hover:shadow-blue-500/15',
          titleHover: 'group-hover:text-blue-700 dark:group-hover:text-blue-400',
          stepBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
          btnHover: 'group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600'
        };
      case 'admin':
      case 'administrator':
        return {
          topBar: 'bg-gradient-to-r from-slate-700 via-indigo-700 to-blue-800',
          badgeBg: 'bg-slate-100 dark:bg-slate-800',
          badgeText: 'text-slate-700 dark:text-slate-300',
          badgeBorder: 'border-slate-300 dark:border-slate-700',
          hoverBorder: 'group-hover:border-slate-500 dark:group-hover:border-slate-400',
          hoverShadow: 'group-hover:shadow-slate-500/15',
          titleHover: 'group-hover:text-slate-800 dark:group-hover:text-slate-200',
          stepBg: 'bg-gradient-to-r from-slate-700 to-indigo-700 text-white',
          btnHover: 'group-hover:bg-slate-700 group-hover:text-white dark:group-hover:bg-slate-600'
        };
      case 'mpk':
        return {
          topBar: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600',
          badgeBg: 'bg-green-50 dark:bg-green-500/10',
          badgeText: 'text-green-700 dark:text-green-300',
          badgeBorder: 'border-green-200 dark:border-green-500/30',
          hoverBorder: 'group-hover:border-green-500 dark:group-hover:border-green-400',
          hoverShadow: 'group-hover:shadow-green-500/15',
          titleHover: 'group-hover:text-green-700 dark:group-hover:text-green-400',
          stepBg: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
          btnHover: 'group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-600'
        };
      case 'help':
      case 'help-problem':
        return {
          topBar: 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-500',
          badgeBg: 'bg-rose-50 dark:bg-rose-500/10',
          badgeText: 'text-rose-600 dark:text-rose-300',
          badgeBorder: 'border-rose-200 dark:border-rose-500/30',
          hoverBorder: 'group-hover:border-rose-500 dark:group-hover:border-rose-400',
          hoverShadow: 'group-hover:shadow-rose-500/15',
          titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
          stepBg: 'bg-gradient-to-r from-rose-500 to-red-500 text-white',
          btnHover: 'group-hover:bg-rose-500 group-hover:text-white dark:group-hover:bg-rose-600'
        };
      default:
        return {
          topBar: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500',
          badgeBg: 'bg-blue-50 dark:bg-blue-500/10',
          badgeText: 'text-blue-700 dark:text-blue-300',
          badgeBorder: 'border-blue-200 dark:border-blue-500/30',
          hoverBorder: 'group-hover:border-blue-500 dark:group-hover:border-blue-400',
          hoverShadow: 'group-hover:shadow-blue-500/15',
          titleHover: 'group-hover:text-blue-700 dark:group-hover:text-blue-400',
          stepBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
          btnHover: 'group-hover:bg-blue-500 group-hover:text-white dark:group-hover:bg-blue-600'
        };
    }
  }
}
