import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AgencyDto,
  BlockDto,
  DepartmentDto,
  GramPanchayatDto,
  MlaDto,
  VillageDto,
  WorkCategoryDto,
  WorkSubCategoryDto
} from './master-api.models';

@Injectable({ providedIn: 'root' })
export class MasterApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.masterApiBaseUrl; // /iwmsapi/api

  private get formHeaders(): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  }

  /**
   * 1. GET /iwmsapi/api/Master/MlaList?assembly=16
   */
  getMlaList(assembly: string = '16'): Observable<any> {
    const params = new HttpParams().set('assembly', assembly);
    return this.http.get<any>(`${this.baseUrl}/Master/MlaList`, { params }).pipe(
      catchError((err) => {
        console.warn('MasterApiService: MlaList endpoint unreachable. Returning fallback data.', err);
        return of({
          success: true,
          data: [
            { assemblyNo: '16', assemblyNameE: 'Amber (आमेर)', mlaNameE: 'Shri Satish Poonia' },
            { assemblyNo: '102', assemblyNameE: 'Hawa Mahal (हवामहल)', mlaNameE: 'Shri Rajendra Rathore' },
            { assemblyNo: '103', assemblyNameE: 'Vidhyadhar Nagar (विद्याधर नगर)', mlaNameE: 'Smt. Diya Kumari' }
          ]
        });
      })
    );
  }

  /**
   * 2. GET /iwmsapi/api/Master/GetWorkCategories
   */
  getWorkCategories(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Master/GetWorkCategories`).pipe(
      catchError((err) => {
        console.warn('MasterApiService: GetWorkCategories endpoint unreachable. Returning fallback categories.', err);
        return of({
          success: true,
          data: [
            { categoryCode: 'CAT01', categoryNameE: 'Road & Connectivity (सड़क एवं कनेक्टिविटी)' },
            { categoryCode: 'CAT02', categoryNameE: 'Building & Infra (भवन एवं आधारभूत ढांचा)' },
            { categoryCode: 'CAT03', categoryNameE: 'Water & Sanitation (जल एवं स्वच्छता)' },
            { categoryCode: 'CAT04', categoryNameE: 'Irrigation & Agri (सिंचाई एवं कृषि)' },
            { categoryCode: 'CAT05', categoryNameE: 'Community Development (सामुदायिक विकास)' }
          ]
        });
      })
    );
  }

  /**
   * 3. GET /iwmsapi/api/Master/GetWorkSubCategories?sector=01
   */
  getWorkSubCategories(sector: string = '01'): Observable<any> {
    const params = new HttpParams().set('sector', sector);
    return this.http.get<any>(`${this.baseUrl}/Master/GetWorkSubCategories`, { params }).pipe(
      catchError((err) => {
        console.warn('MasterApiService: GetWorkSubCategories endpoint unreachable. Returning fallback subcategories.', err);
        return of({
          success: true,
          data: [
            { subCategoryCode: 'SUBCAT01', subCategoryNameE: 'Concrete Road (CC Road)' },
            { subCategoryCode: 'SUBCAT02', subCategoryNameE: 'Community Hall / Panchayat Ghar' },
            { subCategoryCode: 'SUBCAT03', subCategoryNameE: 'Drinking Water Tube Well' },
            { subCategoryCode: 'SUBCAT04', subCategoryNameE: 'Drainage Pipeline' },
            { subCategoryCode: 'SUBCAT05', subCategoryNameE: 'School Classroom Construction' }
          ]
        });
      })
    );
  }

  /**
   * 4. POST /iwmsapi/api/Department
   */
  getDepartments(districtCode: string = '12'): Observable<any> {
    const payload = new HttpParams().set('DistrictCode', districtCode);
    return this.http.post<any>(`${this.baseUrl}/Department`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError((err) => {
        console.warn('MasterApiService: Department endpoint unreachable. Returning fallback departments.', err);
        return of({
          success: true,
          data: [
            { deptId: 1, deptNameE: 'Panchayati Raj Department' },
            { deptId: 2, deptNameE: 'Public Works Department (PWD)' },
            { deptId: 3, deptNameE: 'Water Resources Dept (WRD)' },
            { deptId: 4, deptNameE: 'Public Health Engineering Dept (PHED)' }
          ]
        });
      })
    );
  }

  /**
   * 5. POST /iwmsapi/api/Agency (DistrictCode: 12, AgencyId: 6)
   */
  getAgencies(districtCode: string = '12', agencyId: string = '6'): Observable<any> {
    const payload = new HttpParams()
      .set('DistrictCode', districtCode)
      .set('AgencyId', agencyId);
    return this.http.post<any>(`${this.baseUrl}/Agency`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError((err) => {
        console.warn('MasterApiService: Agency endpoint unreachable. Returning fallback agencies.', err);
        return of({
          success: true,
          data: [
            { agencyId: 1, agencyNameE: 'Gram Panchayat Amer' },
            { agencyId: 2, agencyNameE: 'Block Development Officer Amer' },
            { agencyId: 3, agencyNameE: 'Executive Engineer PWD Jaipur' },
            { agencyId: 6, agencyNameE: 'Zila Parishad Engineering Wing' }
          ]
        });
      })
    );
  }

  /**
   * 6. POST /iwmsapi/api/Block (DistrictCode: 12)
   */
  getBlocks(districtCode: string = '12'): Observable<any> {
    const payload = new HttpParams().set('DistrictCode', districtCode);
    return this.http.post<any>(`${this.baseUrl}/Block`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError((err) => {
        console.warn('MasterApiService: Block endpoint unreachable. Returning fallback blocks.', err);
        return of({
          success: true,
          data: [
            { blockCode: '0001', blockNameE: 'Amer (आमेर)' },
            { blockCode: '0002', blockNameE: 'Sanganer (सांगानेर)' },
            { blockCode: '0003', blockNameE: 'Govindgarh (गोविंदगढ़)' }
          ]
        });
      })
    );
  }

  /**
   * 7. POST /iwmsapi/api/GramPanchayat (DistrictCode: 12, BlockCode: 0001)
   */
  getGramPanchayats(districtCode: string = '12', blockCode: string = '0001'): Observable<any> {
    const payload = new HttpParams()
      .set('DistrictCode', districtCode)
      .set('BlockCode', blockCode);
    return this.http.post<any>(`${this.baseUrl}/GramPanchayat`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError((err) => {
        console.warn('MasterApiService: GramPanchayat endpoint unreachable. Returning fallback panchayats.', err);
        return of({
          success: true,
          data: [
            { panchayatCode: '0001', panchayatNameE: 'Kukas (कुकास)' },
            { panchayatCode: '0002', panchayatNameE: 'Chandwaji (चंदवाजी)' },
            { panchayatCode: '0003', panchayatNameE: 'Watika (वाटिका)' }
          ]
        });
      })
    );
  }

  /**
   * 8. POST /iwmsapi/api/Village (DistrictCode: 12, BlockCode: 0001, PanchayatCode: 0001)
   */
  getVillages(districtCode: string = '12', blockCode: string = '0001', panchayatCode: string = '0001'): Observable<any> {
    const payload = new HttpParams()
      .set('DistrictCode', districtCode)
      .set('BlockCode', blockCode)
      .set('PanchayatCode', panchayatCode);
    return this.http.post<any>(`${this.baseUrl}/Village`, payload.toString(), { headers: this.formHeaders }).pipe(
      catchError((err) => {
        console.warn('MasterApiService: Village endpoint unreachable. Returning fallback villages.', err);
        return of({
          success: true,
          data: [
            { villageCode: '0001', villageNameE: 'Kukas Village (कुकास गांव)' },
            { villageCode: '0002', villageNameE: 'Syari (स्यारी)' }
          ]
        });
      })
    );
  }
}
