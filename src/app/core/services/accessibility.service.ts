import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface AccessibilityState {
  textSize: number; // 0, 1, 2, 3 (normal to largest)
  textSpacing: number; // 0, 1, 2, 3
  lineHeight: number; // 0, 1, 2, 3
  dyslexia: boolean;
  adhd: boolean;
  saturation: number; // 0 (normal), 1 (high), 2 (low)
  darkTheme: boolean;
  invertColors: boolean;
  highlightLinks: boolean;
  voiceMode: boolean;
  cursor: number; // 0 (normal), 1 (big black), 2 (big white)
  pauseAnim: boolean;
  hideImages: boolean;
}

const DEFAULT_STATE: AccessibilityState = {
  textSize: 0,
  textSpacing: 0,
  lineHeight: 0,
  dyslexia: false,
  adhd: false,
  saturation: 0,
  darkTheme: false,
  invertColors: false,
  highlightLinks: false,
  voiceMode: false,
  cursor: 0,
  pauseAnim: false,
  hideImages: false
};

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  
  private stateSub = new BehaviorSubject<AccessibilityState>(DEFAULT_STATE);
  state$ = this.stateSub.asObservable();
  private isBrowser: boolean;

  // ADHD Mask elements
  private maskTop?: HTMLDivElement;
  private maskBottom?: HTMLDivElement;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadPreferences();
  }

  private loadPreferences() {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem('ux4g_accessibility');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.updateState({ ...DEFAULT_STATE, ...parsed }, false);
      } catch (e) {
        this.updateState(DEFAULT_STATE, false);
      }
    } else {
      this.updateState(DEFAULT_STATE, false);
    }
  }

  // --- ACTIONS ---

  cycleTextSize() {
    const s = this.stateSub.value;
    this.updateState({ ...s, textSize: s.textSize >= 3 ? 0 : s.textSize + 1 });
  }

  cycleTextSpacing() {
    const s = this.stateSub.value;
    this.updateState({ ...s, textSpacing: s.textSpacing >= 3 ? 0 : s.textSpacing + 1 });
  }

  cycleLineHeight() {
    const s = this.stateSub.value;
    this.updateState({ ...s, lineHeight: s.lineHeight >= 3 ? 0 : s.lineHeight + 1 });
  }

  toggleDyslexia() {
    const s = this.stateSub.value;
    this.updateState({ ...s, dyslexia: !s.dyslexia });
  }

  toggleAdhd() {
    const s = this.stateSub.value;
    this.updateState({ ...s, adhd: !s.adhd });
  }

  cycleSaturation() {
    const s = this.stateSub.value;
    this.updateState({ ...s, saturation: s.saturation >= 3 ? 0 : s.saturation + 1 });
  }

  toggleDarkTheme() {
    const s = this.stateSub.value;
    this.updateState({ ...s, darkTheme: !s.darkTheme });
  }

  toggleInvertColors() {
    const s = this.stateSub.value;
    this.updateState({ ...s, invertColors: !s.invertColors });
  }

  toggleHighlightLinks() {
    const s = this.stateSub.value;
    this.updateState({ ...s, highlightLinks: !s.highlightLinks });
  }

  toggleVoiceMode() {
    const s = this.stateSub.value;
    this.updateState({ ...s, voiceMode: !s.voiceMode });
  }

  cycleCursor() {
    const s = this.stateSub.value;
    this.updateState({ ...s, cursor: s.cursor >= 2 ? 0 : s.cursor + 1 });
  }

  togglePauseAnim() {
    const s = this.stateSub.value;
    this.updateState({ ...s, pauseAnim: !s.pauseAnim });
  }

  toggleHideImages() {
    const s = this.stateSub.value;
    this.updateState({ ...s, hideImages: !s.hideImages });
  }

  resetAll() {
    this.updateState(DEFAULT_STATE);
  }

  // --- CORE STATE APPLICATION ---

  private updateState(newState: AccessibilityState, save = true) {
    this.stateSub.next(newState);
    
    if (!this.isBrowser) return;

    if (save) {
      localStorage.setItem('ux4g_accessibility', JSON.stringify(newState));
    }

    this.applyCssClasses(newState);
    this.handleVoiceMode(newState.voiceMode);
    this.handleAdhdMode(newState.adhd);
  }

  private applyCssClasses(state: AccessibilityState) {
    const html = document.documentElement;
    const body = document.body;

    // Reset old classes
    body.className = body.className.replace(/access-[a-zA-Z0-9-]+/g, '').trim();

    // 1. Text Size (handled via css variable)
    // 0: normal(100%), 1: 110%, 2: 125%, 3: 150%
    // -1: 90%, -2: 80%, -3: 70%
    let zoom = 1;
    if (state.textSize === 1) zoom = 1.1;
    if (state.textSize === 2) zoom = 1.25;
    if (state.textSize === 3) zoom = 1.5;
    if (state.textSize === -1) zoom = 0.9;
    if (state.textSize === -2) zoom = 0.8;
    if (state.textSize === -3) zoom = 0.7;
    html.style.setProperty('font-size', `${16 * zoom}px`, 'important');

    // 2. Text Spacing
    if (state.textSpacing > 0) body.classList.add(`access-spacing-${state.textSpacing}`);
    
    // 3. Line Height
    if (state.lineHeight > 0) body.classList.add(`access-line-height-${state.lineHeight}`);

    // 4. Dyslexia Friendly
    if (state.dyslexia) body.classList.add('access-dyslexia');

    // 5. Saturation
    if (state.saturation === 1) body.classList.add('access-saturate-high');
    if (state.saturation === 2) body.classList.add('access-saturate-low');
    if (state.saturation === 3) body.classList.add('access-saturate-none');

    // 6. Dark Theme & Invert
    if (state.darkTheme) {
      html.classList.add('dark'); // Native Tailwind dark mode
    } else {
      html.classList.remove('dark');
    }
    if (state.invertColors) body.classList.add('access-invert-colors');

    // 7. Highlight Links
    if (state.highlightLinks) body.classList.add('access-highlight-links');

    // 8. Cursor
    if (state.cursor === 1) body.classList.add('access-cursor-big-black');
    if (state.cursor === 2) body.classList.add('access-cursor-big-white');

    // 9. Pause Animation
    if (state.pauseAnim) body.classList.add('access-pause-anim');

    // 10. Hide Images
    if (state.hideImages) body.classList.add('access-hide-images');
  }

  // --- VOICE MODE ---
  
  private handleVoiceMode(enabled: boolean) {
    if (!this.isBrowser) return;
    
    if (enabled) {
      document.addEventListener('mouseover', this.handleMouseOverForVoice);
      this.speak("Text to speech enabled");
    } else {
      document.removeEventListener('mouseover', this.handleMouseOverForVoice);
      window.speechSynthesis.cancel();
    }
  }

  private handleMouseOverForVoice = (e: MouseEvent) => {
    if (!this.stateSub.value.voiceMode) return;
    const target = e.target as HTMLElement;
    if (target.matches('h1, h2, h3, h4, h5, h6, p, a, button, span, label, td, th, li')) {
      const text = target.innerText || target.textContent;
      if (text && text.trim().length > 0) {
        e.stopPropagation();
        this.speak(text.trim());
      }
    }
  }

  private speak(text: string) {
    if (!this.isBrowser) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  // --- ADHD MODE (Reading Mask) ---

  private handleAdhdMode(enabled: boolean) {
    if (!this.isBrowser) return;
    
    if (enabled) {
      if (!this.maskTop) {
        this.maskTop = document.createElement('div');
        this.maskBottom = document.createElement('div');
        
        const maskStyles = 'position:fixed; left:0; right:0; background:rgba(0,0,0,0.6); z-index:999999; pointer-events:none; transition: height 0.1s ease-out, top 0.1s ease-out;';
        this.maskTop.style.cssText = maskStyles + 'top:0;';
        this.maskBottom!.style.cssText = maskStyles + 'bottom:0;';
        
        document.body.appendChild(this.maskTop);
        document.body.appendChild(this.maskBottom!);
        
        document.addEventListener('mousemove', this.updateAdhdMask);
        
        // Initial position center
        this.updateAdhdMask({ clientY: window.innerHeight / 2 } as MouseEvent);
      }
    } else {
      if (this.maskTop) {
        document.body.removeChild(this.maskTop);
        document.body.removeChild(this.maskBottom!);
        document.removeEventListener('mousemove', this.updateAdhdMask);
        this.maskTop = undefined;
        this.maskBottom = undefined;
      }
    }
  }

  private updateAdhdMask = (e: MouseEvent) => {
    if (!this.maskTop || !this.maskBottom) return;
    const maskHeight = 150; // Opening window of 150px
    const y = e.clientY;
    
    const topHeight = Math.max(0, y - (maskHeight / 2));
    this.maskTop.style.height = `${topHeight}px`;
    
    const bottomTop = Math.min(window.innerHeight, y + (maskHeight / 2));
    this.maskBottom.style.top = `${bottomTop}px`;
    this.maskBottom.style.height = `${window.innerHeight - bottomTop}px`;
  }
}
