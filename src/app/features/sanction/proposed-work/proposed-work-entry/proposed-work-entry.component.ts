import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProposedWorksApiService } from '../../../../core/services/proposed-works-api.service';

type Row = any;
interface FundInput { selected: boolean; amount: number | null; ownFundRelease: number | null; publicContribution: number | null; availableAmount: number | null; }
@Component({ selector: 'app-proposed-work-entry', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './proposed-work-entry.component.html', styleUrls: ['./proposed-work-entry.component.css'] })
export class ProposedWorkEntryComponent implements OnInit {
  sector: 'Rural' | 'Urban' = 'Rural'; workType: 'N' | 'M' = 'M'; finYear = ''; districtCode = ''; workName = ''; approvalNumber = '';
  workApprovalDate = ''; workReceiptDate = ''; workTo: 'V' | 'P' | 'B' | 'T' = 'V'; blockCode = ''; panchayatCode = ''; villageCode = ''; townCode = ''; wardCode = '';
  campaignSchemeId: string | number | null = null; isShreeScheme = false; priority = 1; isConvergence = true;
  workCategory: string | number | null = null; workSubCategory: number | null = null; agencyId: number | null = null; subAgencyId: number | null = null; expectedTimeMonths: number | null = null;
  beneficiaryGroup = 'G'; beneficiarySc = false; beneficiarySt = false; beneficiaryObc = false; beneficiaryGeneral = false; beneficiarySbc = false; beneficiaryOther = false; beneficiaryMinority = false;
  beneficiaryBpl = false; beneficiaryApl = false; beneficiaryState = false;
  schemeDepartment = '01'; assemblyNumber: number | null = null; constituencyCode = ''; mlaName = ''; parliamentHouse: 'L' | 'R' = 'L'; parliamentNumber: number | null = null; parliamentCode = ''; mpName = '';
  recommendedBy = ''; remarks = ''; isAnnualWorkPlan = true; isChecklistConfirmed = false; signatoryName = ''; signatoryDesignation = ''; otp = '';
  recommendationPdf: File | null = null; revenueRecordPdf: File | null = null;
  districts: Row[] = []; financialYears: Row[] = []; campaignSchemes: Row[] = []; categories: Row[] = []; subCategories: Row[] = []; blocks: Row[] = []; panchayats: Row[] = []; villages: Row[] = []; towns: Row[] = []; agencies: Row[] = []; subAgencies: Row[] = []; assemblies: Row[] = []; mlaList: Row[] = []; mpList: Row[] = []; schemes: Row[] = []; convergenceSchemes: Row[] = [];
  fundInputs: Record<string, FundInput> = {}; convergenceInputs: Record<string, { selected: boolean; amount: number | null }> = {};
  isLoading = false; isSaving = false; errorMessage = ''; successMessage = ''; approvedPlan: Row | null = null; currentUserType = '';

  constructor(public languageService: LanguageService, private readonly router: Router, private readonly api: ProposedWorksApiService, public readonly auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.districtCode = String(user?.districtCode || ''); this.currentUserType = String(user?.usertype ?? '');
    this.approvedPlan = this.router.getCurrentNavigation()?.extras.state?.['approvedPlan'] || history.state?.approvedPlan || null;
    if (this.approvedPlan) this.prefillPlan(this.approvedPlan);
    this.isLoading = true;
    this.api.getDistricts().subscribe({ next: r => { this.districts = this.rows(r); if (!this.districtCode) this.districtCode = String(this.pick(this.districts[0], 'districtCode','code','id') || ''); this.loadDistrictData(); }, error: e => { this.loadError(e); this.isLoading = false; } });
    this.api.getFinancialYears().subscribe({ next: r => { this.financialYears = this.rows(r); this.finYear ||= String(this.pick(this.financialYears.find(x => this.pick(x,'isCurrent','current') === true) || this.financialYears[0], 'finYear','finYr','financialYear','code','value') || ''); this.loadSchemes(); }, error: e => this.loadError(e) });
    this.api.getCampaignSchemes().subscribe({ next: r => this.campaignSchemes = this.rows(r), error: e => this.loadError(e) });
    this.loadCategories();
    this.api.getAgencies().subscribe({ next: r => this.agencies = this.rows(r), error: e => this.loadError(e) });
    this.api.getAssemblies(this.districtCode || undefined).subscribe({ next: r => this.assemblies = this.rows(r), error: e => this.loadError(e) });
    this.api.getMembersOfParliament(this.districtCode || undefined).subscribe({ next: r => this.mpList = this.rows(r), error: e => this.loadError(e) });
    this.api.getConvergenceSchemes().subscribe({ next: r => { this.convergenceSchemes = this.rows(r); for (const x of this.convergenceSchemes) this.convergenceInputs[this.key(x,'convergenceSchemeCode','schemeCode','code','id')] ||= { selected: false, amount: null }; }, error: e => this.loadError(e) });
  }
  private rows(res: any): Row[] {
    const ok = this.pick(res, 'success', 'isSuccess', 'isSuccessful');
    if (ok === false) { this.errorMessage = String(this.pick(res, 'message', 'error') || 'Master API ने success=false लौटाया।'); return []; }
    const visit = (value: any, depth: number): Row[] | null => {
      if (Array.isArray(value)) return value;
      if (!value || typeof value !== 'object' || depth > 5) return null;
      const entries = Object.entries(value);
      const normalized = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
      const preferred = new Set(['data','result','items','rows','list','records','financialyears','districts','schemes','categories','subcategories','blocks','panchayats','villages','towns','agencies','assemblies','members','mlalist']);
      for (const [key, child] of entries) if (preferred.has(normalized(key))) { const result = visit(child, depth + 1); if (result) return result; }
      for (const [, child] of entries) if (Array.isArray(child)) return child;
      for (const [, child] of entries) if (child && typeof child === 'object') { const result = visit(child, depth + 1); if (result) return result; }
      return null;
    };
    return visit(res, 0) || [];
  }
  pick(row: Row | undefined, ...keys: string[]): any {
    if (!row || typeof row !== 'object') return '';
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of keys) { if (row[key] !== undefined && row[key] !== null) return row[key]; const actual = Object.keys(row).find(k => normalize(k) === normalize(key)); if (actual && row[actual] !== undefined && row[actual] !== null) return row[actual]; }
    return '';
  }
  key(row: Row, ...keys: string[]): string { return String(this.pick(row, ...keys)); }
  label(row: Row, ...keys: string[]): string {
    const hindi = this.languageService.currentLang.toLowerCase().startsWith('hi');
    const matchingLocaleKeys = keys.filter(k => hindi ? /hindi|namehi|_hi$/i.test(k) : /english|nameen|_en$/i.test(k));
    const localizedKeys = hindi
      ? ['nameHindi','nameHi','descriptionHindi','workCategoryNameHindi','categoryNameHindi','subCategoryNameHindi','schemeNameHindi','agencyNameHindi','blockNameHindi','panchayatNameHindi','villageNameHindi','townNameHindi','mlaNameHindi','assemblyNameHindi']
      : ['nameEnglish','nameEn','description','workCategoryNameEnglish','categoryNameEnglish','subCategoryNameEnglish','schemeNameEnglish','agencyNameEnglish','blockNameEnglish','panchayatNameEnglish','villageNameEnglish','townNameEnglish','mlaNameEnglish','assemblyNameEnglish'];
    const localized = this.pick(row, ...matchingLocaleKeys, ...localizedKeys, 'descriptionHindi', 'description', 'nameHindi', 'nameEnglish');
    if (localized !== '' && localized !== undefined && localized !== null) return String(localized);
    const direct = this.pick(row, ...keys); if (direct !== '' && direct !== undefined && direct !== null) return String(direct);
    return String(this.pick(row, ...(hindi ? ['nameEnglish','nameEn','description'] : ['nameHindi','nameHi','descriptionHindi'])) || '');
  }
  private loadDistrictData(): void { if (!this.districtCode) { this.isLoading = false; return; } this.loadBlocks(); this.loadTowns(); this.loadAssemblies(); this.api.getMembersOfParliament(this.districtCode).subscribe({ next: r => this.mpList = this.rows(r), error: e => this.loadError(e) }); this.isLoading = false; }
  loadBlocks(): void { if (this.districtCode) this.api.getBlocks(this.districtCode).subscribe({ next: r => this.blocks = this.rows(r), error: e => this.loadError(e) }); }
  loadTowns(): void { if (this.districtCode) this.api.getTowns(this.districtCode).subscribe({ next: r => this.towns = this.rows(r), error: e => this.loadError(e) }); }
  loadAssemblies(): void { this.api.getAssemblies(this.districtCode || undefined).subscribe({ next: r => this.assemblies = this.rows(r), error: e => this.loadError(e) }); }
  private prefillPlan(p: Row): void {
    this.finYear = String(p.finYr ?? p.finYear ?? ''); this.sector = String(p.sectorArea ?? p.sector ?? 'R').toUpperCase().startsWith('U') ? 'Urban' : 'Rural';
    this.workType = String(p.workType ?? 'M').toUpperCase().startsWith('N') ? 'N' : 'M'; this.workName = String(p.workName || ''); this.districtCode = String(p.districtCode || this.districtCode);
    this.workCategory = p.workCategory ?? ''; this.workSubCategory = Number(p.workSubCategory ?? '') || null; this.priority = Number(p.priority || 1);
    this.workTo = String(p.workTo || (this.sector === 'Urban' ? 'T' : 'V')) as any; this.blockCode = String(p.blockCode || ''); this.panchayatCode = String(p.panchayatCode || ''); this.villageCode = String(p.villageCode || ''); this.townCode = String(p.townCode || '');
    this.agencyId = Number(p.agencyId) || null; this.subAgencyId = Number(p.subAgencyId) || null; this.assemblyNumber = Number(p.assemblyNo ?? p.assemblyNumber) || null;
    this.recommendedBy = String(p.recommendedBy || ''); this.isConvergence = !!p.isConvergence;
  }
  onSectorChange(value: 'Rural' | 'Urban'): void { this.sector = value; this.workTo = value === 'Urban' ? 'T' : 'V'; this.blockCode = this.panchayatCode = this.villageCode = this.townCode = ''; this.loadCategories(); }
  onSchemeDepartmentChange(): void { this.loadSchemes(); }
  onCampaignChange(): void { this.loadCategories(); }
  onFinancialYearChange(): void { this.loadSchemes(); }
  onDistrictChange(): void { this.blockCode = this.panchayatCode = this.villageCode = this.townCode = ''; this.loadBlocks(); this.loadTowns(); this.loadAssemblies(); this.loadMembersOfParliament(); this.loadSchemes(); }
  loadCategories(): void {
    this.api.getWorkCategories().subscribe({ next: r => this.categories = this.rows(r), error: e => this.loadError(e) });
    this.api.getWorkSubCategories(this.sector === 'Rural' ? 'R' : 'U').subscribe({ next: r => this.subCategories = this.rows(r), error: e => this.loadError(e) });
  }
  loadSchemes(): void {
    if (!this.districtCode || !this.finYear || !this.schemeDepartment) return;
    const filters: Record<string, string | number | boolean> = { districtCode: this.districtCode, finYear: this.finYear, schemeDepartment: this.schemeDepartment, shreeOnly: this.isShreeScheme, previousYearOnly: false };
    if (this.constituencyCode) filters['constCode'] = this.constituencyCode; if (this.assemblyNumber) filters['assemblyNo'] = this.assemblyNumber;
    this.api.getSchemes(filters).subscribe({ next: r => { this.schemes = this.rows(r); const next: Record<string, FundInput> = {}; for (const s of this.schemes) { const k = this.key(s,'schemeCode','code','id'); next[k] = this.fundInputs[k] || { selected: false, amount: null, ownFundRelease: null, publicContribution: null, availableAmount: Number(this.pick(s,'availableAmount') || 0) }; } this.fundInputs = next; }, error: e => this.loadError(e) });
  }
  onBlockChange(): void {
    this.panchayatCode = ''; this.villageCode = ''; this.panchayats = []; this.villages = [];
    const block = this.blocks.find(item => String(this.pick(item, 'blockCode', 'blockId', 'code', 'id')) === String(this.blockCode));
    const code = String(this.pick(block, 'blockCode', 'blockId', 'code', 'id') || '').trim();
    if (!this.districtCode || !code) return;
    this.api.getPanchayats(this.districtCode, [code]).subscribe({ next: r => this.panchayats = this.rows(r), error: e => this.loadError(e) });
  }
  onPanchayatChange(): void { this.villageCode = ''; this.villages = []; if (this.blockCode && this.panchayatCode) this.api.getVillages(this.districtCode, this.blockCode, [this.panchayatCode]).subscribe({ next: r => this.villages = this.rows(r), error: e => this.loadError(e) }); }
  onAgencyChange(): void { this.subAgencyId = null; this.subAgencies = []; if (this.agencyId) this.api.getSubAgencies(this.agencyId, this.districtCode).subscribe({ next: r => this.subAgencies = this.rows(r), error: e => this.loadError(e) }); }
  onAssemblyChange(): void { this.mlaName = ''; this.mlaList = []; const assembly = this.assemblies.find(a => Number(this.pick(a,'assemblyNumber','assemblyNo','assembly','code','id')) === Number(this.assemblyNumber)); this.constituencyCode = String(this.pick(assembly,'constituencyCode','constCode') || ''); if (this.assemblyNumber) this.api.getMlaList(String(this.assemblyNumber), this.districtCode).subscribe({ next: r => this.mlaList = this.rows(r), error: e => this.loadError(e) }); this.loadSchemes(); }
  onParliamentHouseChange(): void { this.loadMembersOfParliament(); }
  loadMembersOfParliament(): void { this.api.getMembersOfParliament(this.districtCode || undefined, this.parliamentNumber || undefined).subscribe({ next: r => this.mpList = this.rows(r), error: e => this.loadError(e) }); }
  onCampaignMasterChange(): void { this.loadCategories(); }
  selectPdf(event: Event, kind: 'recommendation' | 'revenue'): void { const input = event.target as HTMLInputElement, file = input.files?.[0] || null; if (!file) return; if (file.type !== 'application/pdf' || file.size > 3 * 1024 * 1024) { this.errorMessage = 'केवल 3 MB तक की PDF फ़ाइल चुनें।'; input.value = ''; return; } this.errorMessage = ''; if (kind === 'recommendation') this.recommendationPdf = file; else this.revenueRecordPdf = file; }
  private selectedSchemeRequests(): any[] { return Object.entries(this.fundInputs).filter(([,v]) => v.selected).map(([k,v]) => ({ schemeCode: Number(k), amount: Number(v.amount), ownFundRelease: Number(v.ownFundRelease || 0), publicContribution: Number(v.publicContribution || 0) })); }
  private selectedConvergenceRequests(): any[] { return Object.entries(this.convergenceInputs).filter(([,v]) => v.selected).map(([k,v]) => ({ convergenceSchemeCode: Number(k), amount: Number(v.amount) })); }
  submit(): void {
    this.errorMessage = ''; const schemes = this.selectedSchemeRequests(), convergenceSchemes = this.isConvergence ? this.selectedConvergenceRequests() : [];
    if (!this.districtCode || !this.finYear || !this.workName.trim() || !this.approvalNumber.trim()) { this.errorMessage = 'जिला, वित्तीय वर्ष, कार्य का नाम और अनुमोदन संख्या भरें।'; return; }
    if (!schemes.length || schemes.some(x => !x.amount || x.amount <= 0 || x.amount > 9999)) { this.errorMessage = 'कम से कम एक योजना चुनें और उसकी राशि 0 से अधिक तथा 9999 तक भरें।'; return; }
    if (this.currentUserType === '6' && !this.otp.trim()) { this.errorMessage = 'इस उपयोगकर्ता प्रकार के लिए OTP आवश्यक है।'; return; }
    const locations = this.sector === 'Rural' ? [{ blockCode: this.blockCode || null, panchayatCode: ['P','V'].includes(this.workTo) ? this.panchayatCode || null : null, villageCode: this.workTo === 'V' ? this.villageCode || null : null, townCode: null, wardCode: null }] : [{ townCode: this.townCode || null, wardCode: this.wardCode || null }];
    if ((this.sector === 'Rural' && (!this.blockCode || (this.workTo !== 'B' && !this.panchayatCode) || (this.workTo === 'V' && !this.villageCode))) || (this.sector === 'Urban' && !this.townCode)) { this.errorMessage = 'कृपया कार्य का स्थान चुनें।'; return; }
    const request = { districtCode: this.districtCode, finYear: this.finYear, sector: this.sector === 'Rural' ? 'R' : 'U', workType: this.workType, schemeDepartment: this.schemeDepartment, workCategory: this.workCategory, workSubCategory: Number(this.workSubCategory), workName: this.workName.trim(), workApprovalNumber: this.approvalNumber.trim(), workApprovalDate: this.workApprovalDate || null, workReceiptDate: this.workReceiptDate || null, agencyId: Number(this.agencyId), subAgencyId: this.subAgencyId ? Number(this.subAgencyId) : null, expectedTimeMonths: this.expectedTimeMonths ? Number(this.expectedTimeMonths) : null, workTo: this.workTo, beneficiaryGroup: this.beneficiaryGroup, beneficiarySc: this.beneficiarySc, beneficiarySt: this.beneficiarySt, beneficiaryObc: this.beneficiaryObc, beneficiaryGeneral: this.beneficiaryGeneral, beneficiarySbc: this.beneficiarySbc, beneficiaryOther: this.beneficiaryOther, beneficiaryMinority: this.beneficiaryMinority, beneficiaryBpl: this.beneficiaryBpl, beneficiaryApl: this.beneficiaryApl, beneficiaryState: this.beneficiaryState, assemblyNumber: this.assemblyNumber, constituencyCode: this.constituencyCode || null, mlaName: this.mlaName || null, parliamentCode: this.parliamentCode || null, parliamentNumber: this.parliamentNumber, parliamentHouse: this.parliamentHouse, mpName: this.mpName || null, recommendedBy: this.recommendedBy || null, remarks: this.remarks || null, campaignSchemeId: this.campaignSchemeId, isShreeScheme: this.isShreeScheme, priority: Number(this.priority), isConvergence: this.isConvergence, isAnnualWorkPlan: this.isAnnualWorkPlan, isChecklistConfirmed: this.isChecklistConfirmed, signatoryName: this.signatoryName, signatoryDesignation: this.signatoryDesignation, sourcePlanId: this.approvedPlan?.sourcePlanId ?? this.approvedPlan?.planId ?? this.approvedPlan?.id ?? null, mlaRecommendationId: null, otp: this.otp || null, locations, schemes, convergenceSchemes };
    const requiresRecommendation = schemes.some(s => [9,10].includes(s.schemeCode)); if (requiresRecommendation && !this.recommendationPdf) { this.errorMessage = 'चयनित योजना के लिए विधायक अनुशंसा PDF आवश्यक है।'; return; }
    this.isSaving = true; this.api.create(request, this.recommendationPdf, this.revenueRecordPdf).subscribe({ next: r => { this.isSaving = false; if (r?.success === false) { this.errorMessage = r.message || 'प्रस्ताव सुरक्षित नहीं हो सका।'; return; } this.successMessage = r?.message || 'प्रस्ताव सफलतापूर्वक सुरक्षित हुआ।'; }, error: e => { this.isSaving = false; this.errorMessage = this.validationMessage(e); } });
  }
  private validationMessage(e: any): string {
    const status = Number(e?.status || e?.statusCode || 0), errors = e?.error?.errors;
    if (errors) return Object.entries(errors).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' ');
    if (status === 0) return 'API तक connection नहीं हो पाया। Proxy/network और backend availability जाँचें।';
    if (status === 401) return `API ने 401 Unauthorized लौटाया। ${this.internalTokenDiagnostics()} यदि claims ठीक हों, token expire/revoke हो सकता है या backend की signing/issuer configuration अलग हो सकती है।`;
    if (status === 403) return 'API ने 403 Forbidden लौटाया। Token के district/role को इस request की अनुमति नहीं है।';
    if (status === 404) return 'API ने 404 लौटाया। Endpoint path या backend deployment route जाँचें।';
    if (status === 400) {
      const detail = e?.error?.message || e?.error?.detail || e?.error?.title || e?.error?.error;
      return typeof detail === 'string' && detail.trim() ? `API ने 400 Bad Request लौटाया: ${detail}` : `API ने 400 Bad Request लौटाया। ${JSON.stringify(e?.error || {})}`;
    }
    return e?.error?.message || (status ? `API request failed (HTTP ${status}).` : 'API से data प्राप्त/सुरक्षित नहीं हुआ। Browser Network response जाँचें।');
  }
  private internalTokenDiagnostics(): string {
    let sessionToken = '';
    try { const saved = localStorage.getItem('ework_user_session') || sessionStorage.getItem('ework_user_session'); if (saved) sessionToken = String(JSON.parse(saved)?.token || JSON.parse(saved)?.access_token || ''); } catch { /* read the dedicated token key below */ }
    let token = sessionToken.trim().replace(/^Bearer\s+/i, '');
    if (token.split('.').length !== 3) token = String(localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '').trim().replace(/^Bearer\s+/i, '');
    if (token.split('.').length !== 3) return 'Browser में usable JWT नहीं मिला।';
    try {
      const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
      const normalized = (s: string) => (s.split(/[\/#]/).pop() || s).toLowerCase().replace(/[^a-z]/g, '');
      const find = (name: string) => Object.entries(claims).find(([key]) => normalized(key) === name)?.[1];
      const tokenType = String(find('tokentype') || '').toLowerCase() === 'internal';
      const hasUser = find('userid') !== undefined && find('userid') !== null && String(find('userid')) !== '';
      const hasDistrict = find('districtcode') !== undefined && find('districtcode') !== null && String(find('districtcode')) !== '';
      const hasUserType = find('usertype') !== undefined && find('usertype') !== null && String(find('usertype')) !== '';
      const expiry = Number(find('exp') || 0); const expired = !!expiry && expiry * 1000 <= Date.now();
      return `JWT check (values छुपाए गए): TokenType=Internal ${tokenType ? 'हाँ' : 'नहीं'}, UserId ${hasUser ? 'मौजूद' : 'नहीं'}, DistrictCode ${hasDistrict ? 'मौजूद' : 'नहीं'}, UserType ${hasUserType ? 'मौजूद' : 'नहीं'}${expired ? ', token expired' : ''}.`;
    } catch { return 'Browser में JWT मिला, लेकिन उसके claims decode नहीं हो सके।'; }
  }
  private loadError(e: any): void { this.errorMessage = this.validationMessage(e); }
}
