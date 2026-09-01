import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

export interface UserSession {
  username: string;
  district: string;
  districtHi: string;
  role: string;
  roleHi: string;
  department: string;
  departmentHi: string;
  loginTime: string;
  portalVersion: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private defaultSession: UserSession = {
    username: 'jaipur',
    district: 'JAIPUR',
    districtHi: 'जयपुर',
    role: 'District Administrator',
    roleHi: 'जिला अधिकारी',
    department: 'Rural Development and Panchayati Raj Department',
    departmentHi: 'ग्रामीण विकास एवं पंचायती राज विभाग',
    loginTime: '27/07/2026, 10:59 AM',
    portalVersion: 'e-Work Integrated Work Monitoring System (Version 3.0)'
  };

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserSession | null>(this.defaultSession);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkInitialSession();
  }

  private checkInitialSession() {
    const saved = localStorage.getItem('ework_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.currentUserSubject.next(parsed);
        this.isLoggedInSubject.next(true);
      } catch (e) {
        // Fallback to default
        this.isLoggedInSubject.next(false);
      }
    }
  }

  login(customUser?: Partial<UserSession>): void {
    const session = {
      ...this.defaultSession,
      ...customUser,
      loginTime: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', '')
    };
    localStorage.setItem('ework_user_session', JSON.stringify(session));
    this.currentUserSubject.next(session);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('ework_user_session');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/dashboard']);
  }

  getCurrentUser(): UserSession {
    return this.currentUserSubject.value || this.defaultSession;
  }

  // ═══ AES-GCM 256-BIT ENCRYPTION HELPERS ═══
  private hexStringToBytes(hexString: string): Uint8Array {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  async encryptAesGcm(plainText: string, hexKey: string, hexIV: string): Promise<string> {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Web Crypto API (window.crypto.subtle) is not available (requires HTTPS/localhost). Falling back to Base64 plaintext.');
      // Return Base64 of UTF-8 text as fallback for insecure HTTP development contexts
      try {
        const utf8Bytes = new TextEncoder().encode(plainText);
        let binaryString = '';
        for (let i = 0; i < utf8Bytes.length; i++) {
          binaryString += String.fromCharCode(utf8Bytes[i]);
        }
        return window.btoa(binaryString);
      } catch (e) {
        return '';
      }
    }

    try {
      const keyBytes = this.hexStringToBytes(hexKey);
      const ivBytes = this.hexStringToBytes(hexIV);
      const plainBytes = new TextEncoder().encode(plainText);

      // Import Raw Symmetric Key
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // Encrypt with 128-bit Authentication Tag length
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes,
          tagLength: 128
        },
        cryptoKey,
        plainBytes
      );

      // Convert ArrayBuffer to Base64 output string
      const encryptedBytes = new Uint8Array(encryptedBuffer);
      let binaryString = '';
      const len = encryptedBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(encryptedBytes[i]);
      }
      return window.btoa(binaryString);
    } catch (error) {
      console.error('Error during client-side AES-GCM encryption:', error);
      return '';
    }
  }

  // ═══ BACKEND SECURE SSO LOGIN INTEGRATION ═══
  async loginWithBackend(ssoId: string, pswd: string, userType: string = 'portal'): Promise<boolean> {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const BASE_URL = isLocalhost ? '/iwmsapi' : 'http://10.130.3.10/iwmsapi';
    const HEX_IV = '881F7841B563695E1A3DDEE1EE8CAEB0';
    const HEX_KEY = '70B3BAEB69E82EEBCAD94CB48EE80625FE11FC4FC72D6D256839628D9F04D963';

    try {
      // 1. Perform client-side AES-GCM encryption on Credentials
      const enc_ssoId = await this.encryptAesGcm(ssoId.trim(), HEX_KEY, HEX_IV);
      const enc_pswd = await this.encryptAesGcm(pswd, HEX_KEY, HEX_IV);

      if (!enc_ssoId || !enc_pswd) {
        throw new Error('Encryption failed. Unable to securely encrypt login credentials.');
      }

      // 2. Prepare payload as x-www-form-urlencoded for the API
      const payload = new HttpParams()
        .set('ssoId', enc_ssoId)
        .set('ssoPassword', enc_pswd)
        .set('imei_no', 'WEB_BROWSER_CLIENT')
        .set('device_id', 'WEB_BROWSER_CLIENT')
        .set('type', userType);

      const url = `${BASE_URL}/api/SsoLogin`;
      const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

      // 3. Make HTTP POST call to SecLAN/Intranet API (bypassing CORS via proxy)
      console.log('Sending SSO Login request payload to intranet endpoint...', {
        url,
        body: payload.toString()
      });

      const response: any = await firstValueFrom(
        this.http.post(url, payload.toString(), { headers })
      );
      console.log('SSO Login backend response received:', response);

      // 4. Map successful response or handle status
      if (response && response.isSuccessful === true) {
        const customUser: Partial<UserSession> = {
          username: ssoId.trim(),
          district: response.district || 'JAIPUR',
          districtHi: response.districtHi || 'जयपुर',
          role: response.role || 'District Administrator',
          roleHi: response.roleHi || 'जिला अधिकारी',
          department: response.department || 'Rural Development and Panchayati Raj Department',
          departmentHi: response.departmentHi || 'ग्रामीण विकास एवं पंचायती राज विभाग',
          token: response.result?.app_auth_token
        };
        this.login(customUser);
        return true;
      } else {
        throw new Error(response?.message || 'अमान्य क्रेडेंशियल (Invalid credentials).');
      }
    } catch (error: any) {
      console.error('SSO Backend Auth Error:', error);
      // Rethrow to let UI handle the error message display
      throw error;
    }
  }
}
