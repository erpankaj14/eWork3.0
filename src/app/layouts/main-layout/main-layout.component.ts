import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AccessibilityPanelComponent } from '../../shared/components/accessibility-panel/accessibility-panel.component';
import { routeTransitionAnimations } from '../../core/animations/route-animations';
import { ChildrenOutletContexts } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, AccessibilityPanelComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  animations: [routeTransitionAnimations]
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true; 
  isDarkMode = false;
  isMobile = false;

  currentYear = new Date().getFullYear();

  navItems = [
    { path: '/dashboard', label: 'होम (Overview)', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/dashboard-1', label: 'डैशबोर्ड 1 (Reports)', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/dashboard-2', label: 'डैशबोर्ड 2 (Reports)', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
  ];
  activeIndex = 0;

  constructor(private router: Router, private contexts: ChildrenOutletContexts) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveIndex(event.urlAfterRedirects);
    });
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
}
