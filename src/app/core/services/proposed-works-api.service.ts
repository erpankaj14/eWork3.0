import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProposedWorksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.rdWebApiBaseUrl.replace(/\/$/, '')}`;

  private master(path: string, params?: HttpParams) {
    return this.http.get<any>(`${this.baseUrl}/Master/${path}`, { params });
  }
  getFinancialYears() { return this.master('GetFinancialYears'); }
  getDistricts() { return this.master('GetDistricts'); }
  getCampaignSchemes() { return this.master('GetCampaignSchemes'); }
  getWorkCategories(campaignSchemeId?: string | number) {
    let params = new HttpParams(); if (campaignSchemeId) params = params.set('campaignSchemeId', campaignSchemeId);
    return this.master('GetWorkCategories', params);
  }
  getWorkSubCategories(sector: string, campaignSchemeId?: string | number) {
    let params = new HttpParams().set('sector', sector); if (campaignSchemeId) params = params.set('campaignSchemeId', campaignSchemeId);
    return this.master('GetWorkSubCategories', params);
  }
  getBlocks(districtCode: string) { return this.master('GetBlocks', new HttpParams().set('districtCode', districtCode)); }
  getPanchayats(districtCode: string, blockCodes: string[]) {
    let params = new HttpParams().set('districtCode', districtCode); blockCodes.forEach(c => params = params.append('blockCodes', c));
    return this.master('GetPanchayats', params);
  }
  getVillages(districtCode: string, blockCode: string, panchayatCodes: string[]) {
    let params = new HttpParams().set('districtCode', districtCode).set('blockCode', blockCode);
    panchayatCodes.forEach(c => params = params.append('panchayatCodes', c)); return this.master('GetVillages', params);
  }
  getTowns(districtCode: string) { return this.master('GetTowns', new HttpParams().set('districtCode', districtCode)); }
  getAgencies() { return this.master('GetAgencies'); }
  getSubAgencies(agencyId: string | number, districtCode?: string) {
    let params = new HttpParams().set('agencyId', agencyId); if (districtCode) params = params.set('districtCode', districtCode);
    return this.master('GetSubAgencies', params);
  }
  getAssemblies(districtCode?: string) { return this.master('GetAssemblies', districtCode ? new HttpParams().set('districtCode', districtCode) : undefined); }
  getMlaList(assembly: string, districtCode?: string) {
    let params = new HttpParams().set('assembly', assembly); if (districtCode) params = params.set('districtCode', districtCode); return this.master('GetMlaList', params);
  }
  getMembersOfParliament(districtCode?: string, parliamentNumber?: number) {
    let params = new HttpParams(); if (districtCode) params = params.set('districtCode', districtCode); if (parliamentNumber) params = params.set('parliamentNumber', parliamentNumber);
    return this.master('GetMembersOfParliament', params);
  }
  getConvergenceSchemes(masterSchemeCode?: string | number) {
    return this.master('GetConvergenceSchemes', masterSchemeCode ? new HttpParams().set('masterSchemeCode', masterSchemeCode) : undefined);
  }
  create(data: unknown, recommendationPdf?: File | null, revenueRecordPdf?: File | null) {
    const form = new FormData(); form.append('Data', JSON.stringify(data));
    if (recommendationPdf) form.append('RecommendationPdf', recommendationPdf);
    if (revenueRecordPdf) form.append('RevenueRecordPdf', revenueRecordPdf);
    return this.http.post<any>(`${this.baseUrl}/ProposedWorks/Create`, form);
  }
  getList(params: Record<string, string | number>) { return this.http.get<any>(`${this.baseUrl}/ProposedWorks/GetList`, { params: new HttpParams({ fromObject: Object.fromEntries(Object.entries(params).map(([k,v]) => [k,String(v)])) }) }); }
  getById(workId: string) { return this.http.get<any>(`${this.baseUrl}/ProposedWorks/GetById`, { params: new HttpParams().set('workId', workId) }); }
  update(workId: string, data: unknown, recommendationPdf?: File | null, revenueRecordPdf?: File | null) {
    const form = new FormData(); form.append('Data', JSON.stringify(data));
    if (recommendationPdf) form.append('RecommendationPdf', recommendationPdf);
    if (revenueRecordPdf) form.append('RevenueRecordPdf', revenueRecordPdf);
    return this.http.put<any>(`${this.baseUrl}/ProposedWorks/Update`, form, { params: new HttpParams().set('workId', workId) });
  }
  delete(workId: string) { return this.http.delete<any>(`${this.baseUrl}/ProposedWorks/Delete`, { params: new HttpParams().set('workId', workId) }); }
  getAdminSanction(workId: string) { return this.http.get<any>(`${this.baseUrl}/ProposedWorks/GetAdminSanction`, { params: new HttpParams().set('workId', workId) }); }
  saveAdminSanction(workId: string, data: unknown) { return this.http.post<any>(`${this.baseUrl}/ProposedWorks/SaveAdminSanction`, data, { params: new HttpParams().set('workId', workId) }); }
  download(workId: string, kind: 'recommendation' | 'revenue') {
    return this.http.get(`${this.baseUrl}/ProposedWorks/Download${kind === 'recommendation' ? 'Recommendation' : 'RevenueRecord'}`, { params: new HttpParams().set('workId', workId), responseType: 'blob' });
  }
  getSchemes(params: Record<string, string | boolean | number>) { return this.master('GetSchemes', new HttpParams({ fromObject: Object.fromEntries(Object.entries(params).map(([k,v]) => [k, String(v)])) })); }
}
