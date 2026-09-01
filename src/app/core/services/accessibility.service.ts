import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'theme-default' | 'theme-blue' | 'theme-green' | 'theme-pink' | 'theme-purple' | 'theme-custom';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  
  private currentThemeSub = new BehaviorSubject<AppTheme>('theme-default');
  currentTheme$ = this.currentThemeSub.asObservable();

  private customColorSub = new BehaviorSubject<string | null>(null);
  customColor$ = this.customColorSub.asObservable();

  private zoomLevelSub = new BehaviorSubject<number>(1.0);
  zoomLevel$ = this.zoomLevelSub.asObservable();

  private voiceModeSub = new BehaviorSubject<boolean>(false);
  voiceMode$ = this.voiceModeSub.asObservable();

  private highlightModeSub = new BehaviorSubject<boolean>(false);
  highlightMode$ = this.highlightModeSub.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadPreferences();
  }

  private loadPreferences() {
    if (!this.isBrowser) return;

    const savedTheme = localStorage.getItem('access_theme') as AppTheme;
    const savedCustomColor = localStorage.getItem('access_custom_color');
    
    if (savedCustomColor) {
      this.customColorSub.next(savedCustomColor);
      this.applyCustomThemeStyles(savedCustomColor);
    }

    if (savedTheme) this.setTheme(savedTheme, false);
    else this.setTheme('theme-default', false);

    const savedZoom = localStorage.getItem('access_zoom');
    if (savedZoom) this.applyZoom(parseFloat(savedZoom), false);
    else this.applyZoom(1.0, false);
    
    const savedVoiceMode = localStorage.getItem('access_voice') === 'true';
    this.setVoiceMode(savedVoiceMode, false);

    const savedHighlight = localStorage.getItem('access_highlight') === 'true';
    this.setHighlightMode(savedHighlight, false);
  }

  setTheme(theme: AppTheme, save = true) {
    this.currentThemeSub.next(theme);
    if (this.isBrowser) {
      document.body.classList.remove('theme-blue', 'theme-green', 'theme-pink', 'theme-purple', 'theme-custom');
      document.body.classList.add(theme);
      if (save) localStorage.setItem('access_theme', theme);
    }
  }

  setCustomThemeColor(hex: string) {
    this.customColorSub.next(hex);
    if (this.isBrowser) {
      localStorage.setItem('access_custom_color', hex);
      this.applyCustomThemeStyles(hex);
      if (this.currentThemeSub.value !== 'theme-custom') {
        this.setTheme('theme-custom');
      }
    }
  }

  private applyCustomThemeStyles(hex: string) {
    if (!this.isBrowser) return;

    const hexToRgb = (h: string): [number, number, number] => {
      h = h.replace(/^#/, '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const num = parseInt(h, 16);
      return [num >> 16, (num >> 8) & 255, num & 255];
    };

    const mixRgb = (c1: [number, number, number], c2: [number, number, number], w: number): string => {
      const w1 = 1 - w;
      return [
        Math.round(c1[0] * w + c2[0] * w1),
        Math.round(c1[1] * w + c2[1] * w1),
        Math.round(c1[2] * w + c2[2] * w1)
      ].join(', ');
    };

    const base = hexToRgb(hex);
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [0, 0, 0];

    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const luminance = getLuminance(base[0], base[1], base[2]);
    const isLight = luminance > 0.179;

    const p50 = mixRgb(white, base, 0.95);
    const p100 = mixRgb(white, base, 0.90);
    const p200 = mixRgb(white, base, 0.75);
    const p300 = mixRgb(white, base, 0.60);
    const p400 = mixRgb(white, base, 0.30);
    const p500 = base.join(', ');
    const p600 = mixRgb(black, base, 0.10);
    const p700 = mixRgb(black, base, 0.25);
    const p800 = mixRgb(black, base, 0.40);
    const p900 = mixRgb(black, base, 0.55);
    const p950 = mixRgb(black, base, 0.70);

    const css = `
      .theme-custom {
        --primary-50: ${p50};
        --primary-100: ${p100};
        --primary-200: ${p200};
        --primary-300: ${p300};
        --primary-400: ${p400};
        --primary-500: ${p500};
        --primary-600: ${p600};
        --primary-700: ${p700};
        --primary-800: ${p800};
        --primary-900: ${p900};
        --primary-950: ${p950};
        
        --accent-50: ${p50};
        --accent-100: ${p100};
        --accent-200: ${p200};
        --accent-300: ${p300};
        --accent-400: ${p400};
        --accent-500: ${p500};
        --accent-600: ${p600};
        --accent-700: ${p700};
        --accent-800: ${p800};
        --accent-900: ${p900};
        --accent-950: ${p950};
        
        --bg-main: rgba(${p100}, 0.5);
        --bg-sidebar: rgba(${p900}, 1);
        --bg-header: rgba(${p600}, 1);
        --text-sidebar: ${isLight ? '#0f172a' : '#ffffff'};
        --text-header: ${isLight ? '#0f172a' : '#ffffff'};
        
        --primary-contrast-text: ${isLight ? '#0f172a' : '#ffffff'};
      }
      
      .dark.theme-custom {
        --bg-main: rgba(${p950}, 1);
        --bg-sidebar: rgba(${p950}, 0.5);
        --bg-header: rgba(${p900}, 1);
      }
    `;

    let styleEl = document.getElementById('custom-theme-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-theme-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }

  setTextSize(action: 'increase' | 'decrease' | 'reset') {
    let current = this.zoomLevelSub.value;
    if (action === 'increase') {
      current = Math.min(current + 0.1, 2.0); // Max zoom 200%
    } else if (action === 'decrease') {
      current = Math.max(current - 0.1, 0.7); // Min zoom 70%
    } else {
      current = 1.0;
    }
    this.applyZoom(current, true);
  }

  private applyZoom(level: number, save: boolean) {
    this.zoomLevelSub.next(level);
    if (this.isBrowser) {
      document.documentElement.style.setProperty('font-size', `${16 * level}px`, 'important');
      if (save) localStorage.setItem('access_zoom', level.toString());
    }
  }

  setHighlightMode(enabled: boolean, save = true) {
    this.highlightModeSub.next(enabled);
    if (this.isBrowser) {
      if (enabled) document.body.classList.add('highlight-mode');
      else document.body.classList.remove('highlight-mode');
      if (save) localStorage.setItem('access_highlight', enabled ? 'true' : 'false');
    }
  }

  setVoiceMode(enabled: boolean, save = true) {
    this.voiceModeSub.next(enabled);
    if (this.isBrowser) {
      if (save) localStorage.setItem('access_voice', enabled ? 'true' : 'false');
      
      if (enabled) {
        document.addEventListener('mouseover', this.handleMouseOver);
        this.speak("Voice mode enabled. Hover over text to read.");
      } else {
        document.removeEventListener('mouseover', this.handleMouseOver);
        window.speechSynthesis.cancel();
      }
    }
  }

  private handleMouseOver = (e: MouseEvent) => {
    if (!this.voiceModeSub.value) return;
    const target = e.target as HTMLElement;
    
    // Only read actual textual elements to avoid spam
    if (target.matches('h1, h2, h3, h4, h5, h6, p, a, button, span, label, td, th, li')) {
      const text = target.innerText || target.textContent;
      if (text && text.trim().length > 0) {
        e.stopPropagation(); // prevent bubbling up
        this.speak(text.trim());
      }
    }
  }

  speak(text: string) {
    if (!this.isBrowser) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Setting slight configuration for better readability
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  resetToDefault() {
    this.setTheme('theme-default');
    this.setTextSize('reset');
    this.setVoiceMode(false);
    this.setHighlightMode(false);
  }
}
