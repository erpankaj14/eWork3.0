import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Service that wraps all MLA Recommendation related backend endpoints.
 *
 * - Master data APIs (village, town, block, panchayat, department, agency)
 *   use the SAME base URL and pattern as MasterApiService (/iwmsapi/api)
 *   with form-urlencoded body — NO Bearer token (that was causing 400 errors).
 *
 * - Recommendation CRUD APIs (/api/SaveRecommendation etc.) use Bearer token.
 */
@Injectable({ providedIn: 'root' })
export class MlaRecommendationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  /** Same as MasterApiService - /iwmsapi/api */
  private readonly masterBaseUrl = environment.masterApiBaseUrl;
  /** RdWeb APIs documented in MLA_Recommendation_API_Integration_Guide.docx. */
  private readonly rdWebBaseUrl = environment.rdWebApiBaseUrl;

  getRecommendations(finYr?: string): Observable<any> {
    let params = new HttpParams();
    if (finYr) params = params.set('finYr', finYr);
    return this.withRdWebAuthHandling(this.http.get<any>(`${this.rdWebBaseUrl}/GetRecommendations`, { params }));
  }

  searchRecommendations(finYr?: string): Observable<any> {
    return this.withRdWebAuthHandling(this.http.post<any>(`${this.rdWebBaseUrl}/SearchRecommendations`, { finYr: finYr || null }));
  }

  downloadRecommendationPdf(id: number): Observable<Blob> {
    return this.withRdWebAuthHandling(this.http.get(`${this.rdWebBaseUrl}/DownloadRecommendationPdf/${id}`, { responseType: 'blob' }));
  }

  getRevertRequests(): Observable<any> {
    return this.withRdWebAuthHandling(this.http.get<any>(`${this.rdWebBaseUrl}/GetRevertRequests`), false);
  }

  finishRevert(id: number): Observable<any> {
    return this.withRdWebAuthHandling(this.http.post<any>(`${this.rdWebBaseUrl}/FinishRevert/${id}`, null), false);
  }

  getRecommendationPdf(id: number): Observable<Blob> {
    return this.withRdWebAuthHandling(this.http.get(`${this.rdWebBaseUrl}/GetRecommendationPdf/${id}`, { responseType: 'blob' }), false);
  }

  getRevertPdf(id: number): Observable<Blob> {
    return this.withRdWebAuthHandling(this.http.get(`${this.rdWebBaseUrl}/GetRevertPdf/${id}`, { responseType: 'blob' }), false);
  }

  private withRdWebAuthHandling<T>(request: Observable<T>, logoutOnUnauthorized = true): Observable<T> {
    return request.pipe(catchError(error => {
      if (error?.status === 401 && logoutOnUnauthorized) this.auth.logout();
      return throwError(() => error);
    }));
  }

  /** form-urlencoded headers (no auth) — matches MasterApiService */
  private get formHeaders(): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  }

  getDistricts(): Observable<any> {
    return this.http.post<any>(`${this.masterBaseUrl}/District`, null, { headers: this.formHeaders });
  }

  getFinancialYears(): Observable<any> {
    return this.http.post<any>(`${this.masterBaseUrl}/FinYrListWithoutAll`, null, { headers: this.formHeaders });
  }

  getSchemeMaster(): Observable<any> {
    return this.http.post<any>(`${this.masterBaseUrl}/SchemeMaster`, {}, { headers: this.authHeaders });
  }

  /** Bearer token headers for CRUD endpoints only */
  private get authHeaders(): HttpHeaders {
    const token = this.auth.getCurrentUser()?.token || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MASTER DATA — same pattern as MasterApiService (fixes 400 errors)
  // ─────────────────────────────────────────────────────────────────────────

  getBlocks(districtCode: string): Observable<any> {
    const payload = new HttpParams().set('DistrictCode', districtCode);
    return this.http.post<any>(`${this.masterBaseUrl}/Block`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError(err => { console.warn('Block API error', err); return of({ data: [] }); })
    );
  }

  getGramPanchayats(districtCode: string, blockCode: string): Observable<any> {
    const payload = new HttpParams()
      .set('DistrictCode', districtCode)
      .set('BlockCode', blockCode);
    return this.http.post<any>(`${this.masterBaseUrl}/GramPanchayat`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError(err => { console.warn('GramPanchayat API error', err); return of({ data: [] }); })
    );
  }

  getVillages(districtCode: string, blockCode: string, panchayatCode: string): Observable<any> {
    const payload = new HttpParams()
      .set('DistrictCode', districtCode)
      .set('BlockCode', blockCode)
      .set('PanchayatCode', panchayatCode);
    return this.http.post<any>(`${this.masterBaseUrl}/Village`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError(err => { console.warn('Village API error', err); return of({ data: [] }); })
    );
  }

  getTown(districtCode: string): Observable<any> {
    const payload = new HttpParams().set('DistrictCode', districtCode);
    return this.http.post<any>(`${this.masterBaseUrl}/Town`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError(err => { console.warn('Town API error', err); return of({ data: [] }); })
    );
  }

  getDepartment(districtCode: string = '12'): Observable<any> {
    const payload = new HttpParams().set('DistrictCode', districtCode);
    return this.http.post<any>(`${this.masterBaseUrl}/Department`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError(err => { console.warn('Department API error', err); return of({ data: [] }); })
    );
  }

  getAgency(districtCode: string, agencyId: string): Observable<any> {
    const payload = new HttpParams()
      .set('DistrictCode', districtCode)
      .set('AgencyId', agencyId);
    return this.http.post<any>(`${this.masterBaseUrl}/Agency`, payload.toString(), { headers: this.formHeaders });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECOMMENDATION CRUD — uses Bearer token
  // ─────────────────────────────────────────────────────────────────────────

  saveRecommendation(form: any, file?: File): Observable<any> {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });
    if (file) {
      formData.append('UploadFile', file, file.name);
    }
    return this.http.post<any>(`${this.masterBaseUrl}/SaveRecommendation`, formData, { headers: this.authHeaders });
  }

  deleteRecommendation(id: string): Observable<any> {
    const payload = new HttpParams().set('id', id);
    return this.http.post<any>(
      `${this.masterBaseUrl}/Delete`,
      payload.toString(),
      { headers: this.authHeaders.set('Content-Type', 'application/x-www-form-urlencoded') }
    );
  }

  updateRecommendation(id: string, form: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });
    if (file) {
      formData.append('UploadFile', file, file.name);
    }
    return this.http.post<any>(`${this.masterBaseUrl}/UpdateRecommendation`, formData, { headers: this.authHeaders });
  }

  reportRecommendation(userName: string): Observable<any> {
    const payload = new HttpParams().set('UserName', userName);
    return this.http.post<any>(
      `${this.masterBaseUrl}/ReportRecommendation`,
      payload.toString(),
      { headers: this.authHeaders.set('Content-Type', 'application/x-www-form-urlencoded') }
    );
  }

  fetchMlaIndividualReport(userName: string, finYr: string, districtCode: string, aNo: string): Observable<any> {
    const payload = new HttpParams()
      .set('UserName', userName)
      .set('FinYr', finYr)
      .set('DistrictCode', districtCode)
      .set('a_no', aNo);
    return this.http.post<any>(
      `${this.masterBaseUrl}/MLAindividualreport`,
      payload.toString(),
      { headers: this.authHeaders.set('Content-Type', 'application/x-www-form-urlencoded') }
    );
  }

  fetchPdf(id: string): Observable<any> {
    const payload = new HttpParams().set('Id', id);
    return this.http.post<any>(
      `${this.masterBaseUrl}/SendPdf`,
      payload.toString(),
      { headers: this.authHeaders.set('Content-Type', 'application/x-www-form-urlencoded'), responseType: 'blob' as 'json' }
    );
  }
}
