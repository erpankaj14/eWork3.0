import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSub = new BehaviorSubject<string>('en');
  currentLang$ = this.currentLangSub.asObservable();
  
  private isBrowser: boolean;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initLanguage();
  }

  private initLanguage() {
    this.translate.addLangs(['default', 'en', 'hi']);

    if (this.isBrowser) {
      const savedLang = localStorage.getItem('app_lang');
      if (savedLang && ['default', 'en', 'hi'].includes(savedLang)) {
        this.setLanguage(savedLang);
      } else {
        this.setLanguage('default');
      }
    }
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLangSub.next(lang);
    
    if (this.isBrowser) {
      localStorage.setItem('app_lang', lang);
      
      // Update body class for font styling
      if (lang === 'hi') {
        document.body.classList.add('lang-hi');
      } else {
        document.body.classList.remove('lang-hi');
      }
    }
  }
}
