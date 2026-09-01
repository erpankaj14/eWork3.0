import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService, AppTheme } from '../../../core/services/accessibility.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-accessibility-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Accessibility Button -->
    <button 
      (click)="togglePanel()"
      (mouseenter)="speakHover('Accessibility Tools')"
      class="fixed top-1/2 right-0 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-l-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] z-[60] flex items-center justify-center transition-all duration-300 group"
      title="Accessibility Tools"
    >
      <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <circle cx="12" cy="7" r="3" fill="currentColor"/>
        <path d="M12 11v5m-4-3h8m-4 3l-3 4m3-4l3 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Slide-out Panel Overlay -->
    <div *ngIf="isOpen" (click)="togglePanel()" class="fixed inset-0 z-[65] bg-transparent"></div>

    <!-- Slide-out Panel -->
    <div id="access-panel"
      class="fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-dark-900/95 backdrop-blur-3xl shadow-2xl z-[70] transition-transform duration-300 border-l border-slate-200/80 dark:border-dark-800/80 flex flex-col"
      [ngClass]="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-dark-800/50 bg-emerald-600/10 dark:bg-emerald-500/10">
        <div class="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="7" r="3" fill="currentColor"/>
             <path d="M12 11v5m-4-3h8m-4 3l-3 4m3-4l3 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2 class="text-lg font-bold tracking-tight">Accessibility Tools</h2>
        </div>
        <button (click)="togglePanel()" class="p-2 -mr-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-dark-800 dark:hover:text-slate-200 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        <!-- Text Size -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18M12 3v18" /></svg>
            <h3 class="text-base font-bold">Text Size ({{ (zoomLevel$ | async) | number:'1.1-1' }}x)</h3>
          </div>
          <div class="flex gap-3">
            <button (click)="setTextSize('increase')" (mouseenter)="speakHover('Increase text size')" class="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-slate-700 dark:text-slate-200 font-bold text-lg border border-slate-200 dark:border-dark-700 transition-colors active:scale-95">A+</button>
            <button (click)="setTextSize('reset')" (mouseenter)="speakHover('Normal text size')" class="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-slate-700 dark:text-slate-200 font-bold text-base border border-slate-200 dark:border-dark-700 transition-colors active:scale-95">A</button>
            <button (click)="setTextSize('decrease')" (mouseenter)="speakHover('Decrease text size')" class="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-dark-700 transition-colors active:scale-95">A-</button>
          </div>
        </div>

        <!-- Color Themes -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            <h3 class="text-base font-bold">Color Themes</h3>
          </div>
          <div class="flex gap-3">
            <button (click)="setTheme('theme-blue')" (mouseenter)="speakHover('Blue theme')" [class.ring-2]="(currentTheme$ | async) === 'theme-blue'" class="w-12 h-12 rounded-xl bg-[#1e3a8a] border-2 border-slate-100 shadow-md ring-offset-2 dark:ring-offset-dark-900 transition-transform hover:scale-110 ring-indigo-500"></button>
            <button (click)="setTheme('theme-green')" (mouseenter)="speakHover('Green theme')" [class.ring-2]="(currentTheme$ | async) === 'theme-green'" class="w-12 h-12 rounded-xl bg-[#064e3b] border-2 border-slate-100 shadow-md ring-offset-2 dark:ring-offset-dark-900 transition-transform hover:scale-110 ring-emerald-500"></button>
            <button (click)="setTheme('theme-pink')" (mouseenter)="speakHover('Pink theme')" [class.ring-2]="(currentTheme$ | async) === 'theme-pink'" class="w-12 h-12 rounded-xl bg-[#831843] border-2 border-slate-100 shadow-md ring-offset-2 dark:ring-offset-dark-900 transition-transform hover:scale-110 ring-pink-500"></button>
            <button (click)="setTheme('theme-purple')" (mouseenter)="speakHover('Purple theme')" [class.ring-2]="(currentTheme$ | async) === 'theme-purple'" class="w-12 h-12 rounded-xl bg-[#3b0764] border-2 border-slate-100 shadow-md ring-offset-2 dark:ring-offset-dark-900 transition-transform hover:scale-110 ring-purple-500"></button>
            
            <div class="relative w-12 h-12 flex-shrink-0 group">
               <input type="color" 
                  [value]="(customColor$ | async) || '#4f46e5'" 
                  (input)="onCustomColorChange($event)"
                  (mouseenter)="speakHover('Custom theme color')" 
                  class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
               <div 
                  [style.background]="(customColor$ | async) || 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'"
                  [class.ring-2]="(currentTheme$ | async) === 'theme-custom'" 
                  class="w-full h-full rounded-xl border-2 border-slate-100 shadow-md ring-offset-2 dark:ring-offset-dark-900 transition-transform group-hover:scale-110 ring-primary-500 flex items-center justify-center">
                  <svg *ngIf="!(customColor$ | async)" class="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
               </div>
            </div>
          </div>
        </div>

        <!-- Tools -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            <h3 class="text-base font-bold">Tools</h3>
          </div>
          <div class="space-y-3">
            <button (click)="resetDefault()" (mouseenter)="speakHover('Default Settings')" class="w-full flex items-center gap-3 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-700 rounded-xl p-3 shadow-sm transition-colors font-semibold text-sm">
              <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Default Settings
            </button>
            <button (click)="toggleHighlight()" (mouseenter)="speakHover('Toggle Highlight Mode')" class="w-full flex items-center gap-3 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-700 rounded-xl p-3 shadow-sm transition-colors font-semibold text-sm" [ngClass]="{'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400': (highlightMode$ | async)}">
              <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              {{ (highlightMode$ | async) ? 'Remove Highlight' : 'Highlight Mode' }}
            </button>
            <button (click)="toggleVoiceMode()" (mouseenter)="speakHover('Toggle Voice Mode')" class="w-full flex items-center gap-3 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-700 rounded-xl p-3 shadow-sm transition-colors font-semibold text-sm" [ngClass]="{'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400': (voiceMode$ | async)}">
              <svg *ngIf="!(voiceMode$ | async)" class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /></svg>
              <svg *ngIf="(voiceMode$ | async)" class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              {{ (voiceMode$ | async) ? 'Disable Voice Mode' : 'Enable Voice Mode' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class AccessibilityPanelComponent {
  isOpen = false;
  
  currentTheme$: Observable<AppTheme>;
  zoomLevel$: Observable<number>;
  voiceMode$: Observable<boolean>;
  highlightMode$: Observable<boolean>;
  customColor$: Observable<string | null>;

  constructor(private accessService: AccessibilityService) {
    this.currentTheme$ = this.accessService.currentTheme$;
    this.zoomLevel$ = this.accessService.zoomLevel$;
    this.voiceMode$ = this.accessService.voiceMode$;
    this.highlightMode$ = this.accessService.highlightMode$;
    this.customColor$ = this.accessService.customColor$;
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.speakHover('Accessibility Tools Opened');
    }
  }

  setTheme(theme: AppTheme) {
    this.accessService.setTheme(theme);
    this.speakHover(theme.replace('-', ' '));
  }

  onCustomColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.accessService.setCustomThemeColor(input.value);
  }

  setTextSize(action: 'increase' | 'decrease' | 'reset') {
    this.accessService.setTextSize(action);
  }

  toggleVoiceMode() {
    let current = false;
    this.voiceMode$.subscribe(v => current = v).unsubscribe();
    this.accessService.setVoiceMode(!current);
  }

  toggleHighlight() {
    let current = false;
    this.highlightMode$.subscribe(v => current = v).unsubscribe();
    this.accessService.setHighlightMode(!current);
  }

  resetDefault() {
    this.accessService.resetToDefault();
  }

  speakHover(text: string) {
    this.accessService.speak(text);
  }
}
