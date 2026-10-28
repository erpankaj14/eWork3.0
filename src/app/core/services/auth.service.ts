import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface UserSession {
  username: string;
  district: string;
  districtCode?: string;
  usertype?: number | string;
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
    username: '',
    district: '',
    districtHi: '',
    role: '',
    roleHi: '',
    department: '',
    departmentHi: '',
    loginTime: '',
    portalVersion: 'e-Work Integrated Work Monitoring System (Version 3.0)',
  };

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkInitialSession();
  }

  private checkInitialSession() {
    const saved = localStorage.getItem('ework_user_session') ?? sessionStorage.getItem('ework_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.usertype = parsed.usertype ?? parsed.userType ?? parsed.UserType ?? this.readUserTypeClaim(parsed.token || localStorage.getItem('access_token'));
        this.currentUserSubject.next(parsed);
        this.isLoggedInSubject.next(true);
      } catch (e) {
        localStorage.removeItem('ework_user_session');
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
      }
    }
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(customUser?: Partial<UserSession>): void {
    const sessionToken = typeof customUser?.token === 'string' ? customUser.token.trim() : '';
    if (sessionToken) {
      localStorage.setItem('access_token', sessionToken);
      sessionStorage.removeItem('access_token');
    } else {
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
    }
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
    sessionStorage.removeItem('ework_user_session');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigateByUrl('/dashboard', { replaceUrl: true });
  }

  getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value;
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
  async loginWithBackend(ssoId: string, pswd: string, userType: string = 'E'): Promise<boolean> {
    const HEX_IV = '881F7841B563695E1A3DDEE1EE8CAEB0';
    const HEX_KEY = '70B3BAEB69E82EEBCAD94CB48EE80625FE11FC4FC72D6D256839628D9F04D963';

    try {
      // 1. Perform client-side AES-GCM encryption on Credentials if not already encrypted
      const enc_ssoId = ssoId.includes('=') && ssoId.length > 25
        ? ssoId.trim()
        : await this.encryptAesGcm(ssoId.trim(), HEX_KEY, HEX_IV);

      const enc_pswd = pswd.includes('=') && pswd.length > 25
        ? pswd
        : await this.encryptAesGcm(pswd, HEX_KEY, HEX_IV);

      if (!enc_ssoId || !enc_pswd) {
        throw new Error('Encryption failed. Unable to securely encrypt login credentials.');
      }

      // 2. Prepare properly URL-encoded x-www-form-urlencoded body (encodes '+' to '%2B' to prevent C# Base64 corruption)
      const bodyString = [
        `SsoId=${encodeURIComponent(enc_ssoId)}`,
        `SsoPassword=${encodeURIComponent(enc_pswd)}`,
        `imei_no=${encodeURIComponent('45354')}`,
        `device_id=${encodeURIComponent('76745')}`,
        `Type=${encodeURIComponent(userType || 'E')}`
      ].join('&');

      const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

      // Try main /api/SsoLogin URL first, fallback to /iwmsapi/api/SsoLogin if 400/404 occurs
      let response: any = null;
      const primaryUrl = environment.ssoLoginUrl; // /api/SsoLogin
      const secondaryUrl = '/iwmsapi/api/SsoLogin';

      try {
        response = await firstValueFrom(
          this.http.post(primaryUrl, bodyString, { headers })
        );
      } catch (primaryErr: any) {
        console.warn('Primary endpoint /api/SsoLogin returned error. Retrying with /iwmsapi/api/SsoLogin...', primaryErr);
        response = await firstValueFrom(
          this.http.post(secondaryUrl, bodyString, { headers })
        );
      }

      // 3. Check response status strictly
      if (response && (response.isSuccessful === true || response.success === true || response.token || response.access_token || response.result?.app_auth_token)) {
        const token = String(response.result?.app_auth_token || response.result?.AppAuthToken || response.token || response.access_token || response.app_auth_token || '')
          .trim()
          .replace(/^Bearer\s+/i, '');
        if (!token) {
          localStorage.removeItem('access_token');
          sessionStorage.removeItem('access_token');
          throw new Error('SSO login succeeded but did not return an access token.');
        }
        localStorage.setItem('access_token', token);
        const customUser: Partial<UserSession> = {
          username: response.result?.user_name || response.username || ssoId.trim(),
          usertype: response.result?.usertype ?? response.result?.userType ?? response.result?.UserType ?? response.result?.user_type ?? response.usertype ?? response.userType ?? response.UserType ?? response.user_type ?? this.readUserTypeClaim(token),
          district: response.district || response.result?.district_name || response.result?.DistrictName || '',
          districtCode: String(response.result?.DistrictCode ?? response.result?.districtCode ?? response.result?.district_code ?? response.result?.distict_code ?? this.readDistrictCodeClaim(token) ?? ''),
          districtHi: response.districtHi || response.result?.district_name_hi || '',
          role: response.result?.userTypeName || response.role || '',
          roleHi: response.roleHi || response.result?.userTypeNameHi || '',
          department: response.department || response.result?.departmentName || '',
          departmentHi: response.departmentHi || response.result?.departmentNameHi || '',
          token: token
        };
        this.login(customUser);
        return true;
      } else {
        const errorMsg = response?.message || response?.error || 'अमान्य क्रेडेंशियल (Invalid credentials).';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('SSO Backend Auth Error:', error);
      throw error;
    }
  }

  private readUserTypeClaim(token?: string | null): number | string | undefined {
    if (!token) return undefined;
    try {
      const encodedPayload = token.split('.')[1];
      if (!encodedPayload) return undefined;
      const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(paddedBase64));
      const claim = Object.entries(payload).find(([key]) =>
        (key.split(/[\/#]/).pop() || key).toLowerCase().replace(/[^a-z]/g, '') === 'usertype'
      )?.[1];
      return typeof claim === 'number' || typeof claim === 'string' ? claim : undefined;
    } catch {
      return undefined;
    }
  }

  private readDistrictCodeClaim(token?: string | null): string | undefined {
    if (!token) return undefined;
    try {
      const encodedPayload = token.split('.')[1];
      if (!encodedPayload) return undefined;
      const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(paddedBase64));
      const claim = Object.entries(payload).find(([key]) =>
        (key.split(/[\/#]/).pop() || key).toLowerCase().replace(/[^a-z]/g, '') === 'districtcode'
      )?.[1];
      return typeof claim === 'number' || typeof claim === 'string' ? String(claim) : undefined;
    } catch {
      return undefined;
    }
  }
}
