import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../../core/services/language.service';
import { AuthService, UserSession } from '../../core/services/auth.service';

export interface DropdownMenu {
  id: string;
  label: string;
  labelHi: string;
  items: {
    title: string;
    titleHi: string;
    badge?: string;
    expanded?: boolean;
    path?: string;
    children?: {
      title: string;
      titleHi: string;
      badge?: string;
      path?: string;
    }[];
  }[];
}

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './portal-layout.component.html',
  styleUrls: ['./portal-layout.component.css']
})
export class PortalLayoutComponent implements OnInit {
  isDarkMode = false;
  user: UserSession | null = null;
  currentYear = new Date().getFullYear();

  // Navigation state flags
  isHubPage = true;
  isSidebarOpen = true;
  isSwitcherOpen = false;
  activeSidebarMenu: DropdownMenu | null = null;
  activeSubmenuItem: any = null;

  // Complete menu definition for all Portals and Work Stages
  menus: DropdownMenu[] = [
    {
      id: 'monitoring',
      label: 'Work Monitoring & Evaluation',
      labelHi: 'कार्य निगरानी एवं मूल्यांकन पोर्टल',
      items: [
        {
          title: 'Work Progress Dashboard',
          titleHi: 'कार्य प्रगति एवं वित्तीय डैशबोर्ड',
          badge: 'Live',
          path: 'work-monitoring'
        },
        {
          title: 'Scheme-wise Incomplete Works',
          titleHi: 'योजनावार अपूर्ण कार्य रजिस्टर',
          badge: 'Alert',
          path: 'work-monitoring'
        },
        {
          title: 'Category-wise Works Register',
          titleHi: 'श्रेणीवार निर्माण कार्य सारांश',
          path: 'work-monitoring'
        },
        {
          title: 'Physical vs Financial Progress',
          titleHi: 'भौतिक एवं वित्तीय व्यय तुलना',
          path: 'work-monitoring'
        },
        {
          title: 'GIS Tagging & Inspection Photos',
          titleHi: 'जीआईएस एवं स्थल निरीक्षण फोटो गैलरी',
          path: 'work-monitoring'
        }
      ]
    },
    {
      id: 'sanction',
      label: 'Sanction Management Portal',
      labelHi: 'स्वीकृति प्रबंधन पोर्टल (Sanction)',
      items: [
        {
          title: 'Proposed Work',
          titleHi: 'प्रस्तावित कार्य (Proposed Work)',
          expanded: true,
          children: [
            { title: 'Entry', titleHi: 'प्रविष्टि (Entry)', path: 'sanction/proposed-work/entry' },
            { title: 'Update', titleHi: 'अद्यतन (Update)', path: 'sanction/proposed-work/update' },
            { title: 'MLA Recommendation', titleHi: 'विधायक अनुशंसा (MLA Recommendation)', path: 'sanction/proposed-work/mla-recommendation' },
            { title: 'Revert Request List', titleHi: 'विधायक अनुशंसा रिवर्ट अनुरोध सूची', path: 'sanction/proposed-work/revert-requests' }
          ]
        },
        {
          title: 'Admin Sanction (AS)',
          titleHi: 'प्रशासनिक स्वीकृति (Admin Sanction - AS)',
          expanded: true,
          children: [
            { title: 'Entry', titleHi: 'प्रविष्टि (Entry)', path: 'sanction/admin-sanction/entry' },
            { title: 'Update', titleHi: 'अद्यतन (Update)', path: 'sanction/admin-sanction/update' },
            { title: 'Finalize AS', titleHi: 'अंतिम स्वीकृति (Finalize AS)', path: 'sanction/admin-sanction/finalize' },
            { title: 'Dispatch', titleHi: 'प्रेषण (Dispatch)', path: 'sanction/admin-sanction/dispatch' },
            { title: 'Undispatch AS', titleHi: 'अन-डिस्पैच (Undispatch AS)', path: 'sanction/admin-sanction/undispatch' }
          ]
        },
        {
          title: 'Technical Sanction (TS)',
          titleHi: 'तकनीकी स्वीकृति (Technical Sanction - TS)',
          expanded: false,
          children: [
            { title: 'Entry', titleHi: 'प्रविष्टि (Entry)', path: 'sanction/admin-sanction/entry' },
            { title: 'Update', titleHi: 'अद्यतन (Update)', path: 'sanction/admin-sanction/update' }
          ]
        },
        {
          title: 'Financial Sanction (FS)',
          titleHi: 'वित्तीय स्वीकृति (Financial Sanction - FS)',
          expanded: false,
          children: [
            { title: 'Entry', titleHi: 'प्रविष्टि (Entry)', path: 'sanction/admin-sanction/entry' },
            { title: 'Update', titleHi: 'अद्यतन (Update)', path: 'sanction/admin-sanction/update' },
            { title: 'Finalize FS', titleHi: 'अंतिम वित्तीय स्वीकृति (Finalize FS)', path: 'sanction/admin-sanction/finalize' },
            { title: 'Dispatch', titleHi: 'प्रेषण (Dispatch)', path: 'sanction/admin-sanction/dispatch' },
            { title: 'Undispatch FS', titleHi: 'अन-डिस्पैच (Undispatch FS)', path: 'sanction/admin-sanction/undispatch' },
            { title: 'FS Pending for eSign', titleHi: 'ई-हस्ताक्षर हेतु लंबित FS', badge: 'Alert', path: 'sanction/admin-sanction/entry' },
            { title: 'View eSign File', titleHi: 'ई-हस्ताक्षर फाइल देखें', path: 'sanction/admin-sanction/entry' }
          ]
        },
        {
          title: 'Cancel Work',
          titleHi: 'कार्य निरस्त (Cancel Work)',
          expanded: false,
          children: [
            { title: 'Entry', titleHi: 'प्रविष्टि (Entry)', path: 'sanction/admin-sanction/entry' },
            { title: 'Dispatch', titleHi: 'प्रेषण (Dispatch)', path: 'sanction/admin-sanction/dispatch' }
          ]
        },
        {
          title: 'Plan Management',
          titleHi: 'कार्य योजना प्रबंधन (Plan)',
          expanded: false,
          children: [
            { title: 'Create Plan', titleHi: 'योजना निर्माण (Create Plan)', badge: 'New', path: 'sanction/admin-sanction/entry' },
            { title: 'Approved Plan List', titleHi: 'स्वीकृत योजना सूची (Approved Plan List)', path: 'sanction/admin-sanction/entry' }
          ]
        }
      ]
    },
    {
      id: 'master',
      label: 'Master Directory Portal',
      labelHi: 'मास्टर प्रबंधन पोर्टल',
      items: [
        { title: 'Scheme Master Configuration', titleHi: 'योजना मास्टर कॉन्फ़िगरेशन', path: 'master/scheme-configuration', badge: 'Active' },
        { title: 'District & Block Directory', titleHi: 'जिला एवं ब्लॉक निर्देशिका', path: 'master/district-directory' },
        { title: 'MLA Constituency Mapping', titleHi: 'विधायक क्षेत्र मैपिंग', path: 'master/mla-mapping' },
        { title: 'Gram Panchayat Register', titleHi: 'ग्राम पंचायत रजिस्टर', path: 'master/gp-register' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports & Analytics Portal',
      labelHi: 'रिपोर्ट्स एवं विश्लेषण पोर्टल',
      items: [
        { title: 'Physical Progress Summary', titleHi: 'भौतिक प्रगति सारांश', badge: 'Live', path: 'reports/physical-progress' },
        { title: 'Financial Sanction & Expense', titleHi: 'वित्तीय स्वीकृति एवं व्यय', path: 'reports/financial-expense' },
        { title: 'Incomplete Works Register', titleHi: 'अपूर्ण कार्य रजिस्टर', badge: 'Alert', path: 'reports/incomplete-works' },
        { title: 'MLA LAD Utilization Report', titleHi: 'विधायक निधि उपयोगिता रिपोर्ट', path: 'reports/mlalad-utilization' }
      ]
    },
    {
      id: 'transaction',
      label: 'Transaction & Entry Portal',
      labelHi: 'लेनदेन एवं प्रविष्टि पोर्टल',
      items: [
        { title: 'Work Proposal Entry', titleHi: 'कार्य प्रस्ताव प्रविष्टि', path: 'transaction/work-proposal' },
        { title: 'Physical Stage Measurement (MB)', titleHi: 'भौतिक चरण मापन (MB Entry)', badge: 'MB', path: 'transaction/mb-entry' },
        { title: 'Fund Release Transaction', titleHi: 'राशि हस्तांतरण प्रविष्टि', path: 'transaction/fund-release' }
      ]
    },
    {
      id: 'uccc',
      label: 'UC / CC Certification Portal',
      labelHi: 'यूसी / सीसी प्रमाण पत्र पोर्टल',
      items: [
        { title: 'Utilization Certificate (UC) Entry', titleHi: 'उपयोगिता प्रमाण पत्र (UC) प्रविष्टि', path: 'uccc/uc-entry' },
        { title: 'Completion Certificate (CC) Entry', titleHi: 'पूर्णता प्रमाण पत्र (CC) प्रविष्टि', path: 'uccc/cc-entry' },
        { title: 'Pending CC Verification', titleHi: 'लंबित सीसी सत्यापन', badge: '28', path: 'uccc/cc-verification' }
      ]
    },
    {
      id: 'admin',
      label: 'Administrator System Panel',
      labelHi: 'एडमिनिस्ट्रेटर नियंत्रण पोर्टल',
      items: [
        { title: 'Menu Creation', titleHi: 'मेनू निर्माण (Menu Creation)', path: 'admin/menu-creation' },
        { title: 'Create User', titleHi: 'उपयोगकर्ता बनाएं (Create User)', path: 'admin/create-user' },
        { title: 'Clear Session', titleHi: 'सत्र खाली करें (Clear Session)', path: 'admin/clear-session' },
        { title: 'Create Role', titleHi: 'भूमिका बनाएं (Create Role)', path: 'admin/create-role' },
        { title: 'Change Password', titleHi: 'पासवर्ड बदलें (Change Password)', path: 'admin/change-password' },
        { title: 'SSO ID Deactivate', titleHi: 'एसएसओ आईडी निष्क्रिय करें (SSO ID Deactivate)', path: 'admin/sso-deactivate' },
        { title: 'Reset Password', titleHi: 'पासवर्ड रीसेट करें (Reset Password)', path: 'admin/reset-password' },
        { title: 'User Deactivation', titleHi: 'उपयोगकर्ता निष्क्रियकरण (User Deactivation)', path: 'admin/user-deactivate' },
        { title: 'MLA User SSO Mapping', titleHi: 'विधायक एसएसओ मैपिंग (MLA User SSO Mapping)', path: 'admin/mla-mapping' },
        { title: 'Switch User', titleHi: 'उपयोगकर्ता बदलें (Switch User)', path: 'admin/switch-user' },
        { title: 'Approve FTO Cancel Request', titleHi: 'FTO रद्द अनुरोध स्वीकृति (Approve FTO Cancel)', path: 'admin/fto-cancel' }
      ]
    },
    {
      id: 'mpk',
      label: 'MPK Kendra Portal',
      labelHi: 'महात्मा गांधी पंचायत केंद्र (MPK)',
      items: [
        { title: 'Mahatma Gandhi Panchayat Kendra', titleHi: 'महात्मा गांधी पंचायत केंद्र निर्देशिका', path: 'mpk/kendra' },
        { title: 'MPK Infrastructure Inspection', titleHi: 'एमपीके भवन निरीक्षण', path: 'mpk/inspection' }
      ]
    },
    {
      id: 'help',
      label: 'Help & SOP Center',
      labelHi: 'सहायता एवं निर्देशिका केंद्र',
      items: [
        { title: 'e-Work 2.0 User Manual', titleHi: 'ई-वर्क 2.0 यूजर मैनुअल', path: 'help/user-manual' },
        { title: 'Standard Operating Procedures', titleHi: 'मानक संचालन प्रक्रिया (SOP)', path: 'help/sop-guidelines' },
        { title: 'Video Walkthroughs & Guidelines', titleHi: 'वीडियो ट्यूटोरियल एवं दिशा-निर्देश', path: 'help/video-tutorials' }
      ]
    },
    {
      id: 'problem',
      label: 'Problem Reporting & Helpdesk',
      labelHi: 'समस्या रिपोर्टिंग एवं हेल्पडेस्क',
      items: [
        { title: 'Raise Technical Support Ticket', titleHi: 'तकनीकी सहायता टिकट दर्ज करें', path: 'problem/ticket-support' },
        { title: 'Track Grievance / Ticket Status', titleHi: 'शिकायत / टिकट स्थिति देखें', path: 'problem/grievance-tracker' }
      ]
    },
    {
      id: 'stage',
      label: 'Work Lifecycle Stage Portal',
      labelHi: 'कार्य निष्पादन चरण पोर्टल',
      items: [
        { title: 'Current Stage Overview', titleHi: 'वर्तमान चरण प्रगति अवलोकन', badge: 'Active', path: 'stage/current' },
        { title: 'New Stage Entry', titleHi: 'नवीन चरण प्रविष्टि दर्ज करें', path: 'stage/new' },
        { title: 'Pending Engineering Verification', titleHi: 'लंबित कनिष्ठ अभियंता सत्यापन', path: 'stage/verification' },
        { title: 'Archived Stage Records', titleHi: 'पुराने चरण रिकॉर्ड अभिलेख', path: 'stage/archive' }
      ]
    }
  ];

  constructor(
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateLayoutState(event.urlAfterRedirects || event.url);
      setTimeout(() => {
        this.resetScroll();
      }, 50);
    });
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    this.authService.currentUser$.subscribe(session => {
      this.user = session || this.authService.getCurrentUser();
    });

    this.updateLayoutState(this.router.url);
  }

  updateLayoutState(url: string): void {
    const cleanUrl = url.split('?')[0].toLowerCase();
    this.isSwitcherOpen = false;

    // Check if we are on the Central Hub page
    if (cleanUrl === '/portal/hub' || cleanUrl === '/portal' || cleanUrl === '/portal/') {
      this.isHubPage = true;
      this.activeSidebarMenu = null;
    } else {
      this.isHubPage = false;
      this.determineActiveModuleMenu(cleanUrl);
    }
  }

  private determineActiveModuleMenu(url: string): void {
    if (url.includes('/work-monitoring')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'monitoring') || null;
    } else if (url.includes('/sanction')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'sanction') || null;
    } else if (url.includes('/master')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'master') || null;
    } else if (url.includes('/reports')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'reports') || null;
    } else if (url.includes('/transaction')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'transaction') || null;
    } else if (url.includes('/uccc')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'uccc') || null;
    } else if (url.includes('/admin')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'admin') || null;
    } else if (url.includes('/mpk')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'mpk') || null;
    } else if (url.includes('/help')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'help') || null;
    } else if (url.includes('/problem')) {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'problem') || null;
    } else if (url.includes('/stage')) {
      // For any 16-stage route, display stage menu
      this.activeSidebarMenu = this.menus.find(m => m.id === 'stage') || null;
    } else {
      this.activeSidebarMenu = this.menus.find(m => m.id === 'monitoring') || null;
    }

    if (this.activeSidebarMenu && this.activeSidebarMenu.items) {
      let foundActiveChild = false;
      this.activeSidebarMenu.items.forEach(item => {
        if (!item.children || item.children.length === 0) {
          if (!foundActiveChild && item.path && this.urlMatchesPath(item.path)) {
            this.activeSubmenuItem = item;
            foundActiveChild = true;
          }
        } else {
          item.children.forEach((child: any) => {
            if (!foundActiveChild && child.path && this.urlMatchesPath(child.path)) {
              this.activeSubmenuItem = child;
              item.expanded = true;
              foundActiveChild = true;
            }
          });
        }
      });
    }
  }

  urlMatchesPath(path?: string): boolean {
    if (!path) return false;
    const currentUrl = this.router.url.split('?')[0].toLowerCase();
    const cleanPath = path.toLowerCase();
    return currentUrl.endsWith(cleanPath) || currentUrl.includes('/' + cleanPath);
  }

  isChildActive(itemOrPath: any): boolean {
    if (!itemOrPath) return false;
    if (typeof itemOrPath === 'string') {
      return this.activeSubmenuItem ? this.activeSubmenuItem.path === itemOrPath : this.urlMatchesPath(itemOrPath);
    }
    // Object reference match guarantees only EXACTLY 1 item is ever active!
    if (this.activeSubmenuItem) {
      return this.activeSubmenuItem === itemOrPath;
    }
    return itemOrPath.path ? this.urlMatchesPath(itemOrPath.path) : false;
  }

  isItemActive(item: any): boolean {
    if (!item) return false;
    if (item === this.activeSubmenuItem) return true;
    if (item.children && item.children.some((c: any) => c === this.activeSubmenuItem)) {
      return true;
    }
    return false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSwitcher(): void {
    this.isSwitcherOpen = !this.isSwitcherOpen;
  }

  switchPortal(menu: DropdownMenu): void {
    this.isSwitcherOpen = false;
    if (menu.items && menu.items.length > 0) {
      const firstItem = menu.items[0];
      if (firstItem.path) {
        this.router.navigate(['/portal/' + firstItem.path]);
      } else if (firstItem.children && firstItem.children.length > 0 && firstItem.children[0].path) {
        this.router.navigate(['/portal/' + firstItem.children[0].path]);
      }
    }
  }

  onSubmenuClick(item: any): void {
    this.activeSubmenuItem = item;
    if (item.path) {
      this.router.navigate(['/portal/' + item.path]);
    }
  }

  toggleSubmenuExpand(item: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    } else {
      this.onSubmenuClick(item);
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  showProfileDropdown = false;

  toggleProfileDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.showProfileDropdown = false;
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  backToHub(): void {
    this.router.navigate(['/portal/hub']);
  }

  backToPublicPortal(): void {
    this.router.navigate(['/dashboard']);
  }

  resetScroll(): void {
    const doScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
      const scrollContainers = document.querySelectorAll('.overflow-y-auto');
      scrollContainers.forEach(el => {
        el.scrollTop = 0;
      });
    };

    doScroll();
    let count = 0;
    const intervalId = setInterval(() => {
      doScroll();
      count++;
      if (count >= 10) {
        clearInterval(intervalId);
      }
    }, 50);
  }
}
