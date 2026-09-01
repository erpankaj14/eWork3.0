import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AccessibilityPanelComponent } from '../../shared/components/accessibility-panel/accessibility-panel.component';
import { routeTransitionAnimations } from '../../core/animations/route-animations';
import { ChildrenOutletContexts } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, AccessibilityPanelComponent, TranslatePipe],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  animations: [routeTransitionAnimations]
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  isDarkMode = false;
  isMobile = false;

  currentYear = new Date().getFullYear();

  // SSO Modal State
  showSsoModal = false;
  ssoUsername = '';
  ssoPassword = '';
  isPasswordVisible = false;
  rememberSso = true;
  isSsoLoading = false;
  ssoErrorMessage = '';

  // Redirection Modal State
  showRedirectModal = false;
  redirectCountdown = 4;
  redirectInterval: any = null;

  // Interactive Alphanumeric Captcha
  captchaText = '';
  captchaAnswer = '';
  captchaError = false;

  navItems = [
    { path: '/dashboard', labelKey: 'SIDEBAR.DASHBOARD_OVERVIEW', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/dashboard-1', labelKey: 'SIDEBAR.DASHBOARD_1_REPORTS', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/dashboard-2', labelKey: 'SIDEBAR.DASHBOARD_2_REPORTS', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
  ];
  activeIndex = 0;

  constructor(
    private router: Router,
    private contexts: ChildrenOutletContexts,
    public languageService: LanguageService,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveIndex(event.urlAfterRedirects);
      setTimeout(() => {
        this.resetScroll();
      }, 50);
    });
  }

  onSsoLogin(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.openSsoModal(event);
  }

  openSsoModal(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showSsoModal = true;
    this.ssoErrorMessage = '';
    this.isSsoLoading = false;
    this.refreshCaptcha();
  }

  closeSsoModal(): void {
    this.showSsoModal = false;
    this.ssoErrorMessage = '';
    this.isSsoLoading = false;
    this.captchaError = false;
  }

  refreshCaptcha(): void {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.captchaText = result;
    this.captchaAnswer = '';
    this.captchaError = false;
  }

  async submitSsoLogin(): Promise<void> {
    if (this.captchaAnswer.trim() !== this.captchaText) {
      this.captchaError = true;
      this.refreshCaptcha();
      return;
    }
    this.captchaError = false;
    this.ssoErrorMessage = '';
    this.isSsoLoading = true;

    try {
      const success = await this.authService.loginWithBackend(this.ssoUsername, this.ssoPassword);
      if (success) {
        this.showSsoModal = false;
        this.router.navigate(['/portal/hub']);
      } else {
        this.ssoErrorMessage = 'लॉगिन विफल: क्रेडेंशियल अमान्य हैं।';
        this.refreshCaptcha();
      }
    } catch (err: any) {
      console.error('Login submit error:', err);
      // Clean user-friendly message for network or CORS errors
      if (err?.status === 0 || err?.message?.includes('Http failure response')) {
        this.ssoErrorMessage = 'सर्वर कनेक्शन में त्रुटि: लॉगिन सेवा से संपर्क करने में असमर्थ। कृपया अपने इंटरनेट या वीपीएन (VPN) कनेक्शन की जाँच करें।';
      } else {
        this.ssoErrorMessage = err?.message || 'लॉगिन सेवा अनुपलब्ध है। कृपया थोड़ी देर बाद पुनः प्रयास करें।';
      }
      this.refreshCaptcha();
    } finally {
      this.isSsoLoading = false;
    }
  }

  triggerForgotPasswordRedirect(event: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Close the SSO modal first so we don't have overlapping dialogs
    this.closeSsoModal();
    this.showRedirectModal = true;
    this.redirectCountdown = 4;

    // Clear any existing timer
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
    }

    // Start 4 seconds countdown
    this.redirectInterval = setInterval(() => {
      this.redirectCountdown--;
      if (this.redirectCountdown <= 0) {
        this.proceedRedirect();
      }
    }, 1000);
  }

  cancelRedirect(): void {
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
      this.redirectInterval = null;
    }
    this.showRedirectModal = false;
  }

  proceedRedirect(): void {
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
      this.redirectInterval = null;
    }
    this.showRedirectModal = false;
    window.open('https://sso.rajasthan.gov.in', '_blank');
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.showRedirectModal) {
      this.cancelRedirect();
    } else if (this.showSsoModal) {
      this.closeSsoModal();
    }
  }


  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  updateActiveIndex(url: string) {
    const path = url.split('?')[0];
    const index = this.navItems.findIndex(item => path === item.path || path.startsWith(item.path + '/'));
    if (index !== -1) {
      this.activeIndex = index;
    } else {
      this.activeIndex = 0;
    }

    // Auto-close sidebar on mobile after navigation
    if (this.isMobile && this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
    // Initial check
    this.updateActiveIndex(this.router.url);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;

    // Only auto-toggle sidebar state if we crossed the mobile/desktop breakpoint
    if (wasMobile !== this.isMobile) {
      if (this.isMobile) {
        this.isSidebarOpen = false; // Auto close on mobile
      } else {
        this.isSidebarOpen = true; // Auto open on desktop
      }
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
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
