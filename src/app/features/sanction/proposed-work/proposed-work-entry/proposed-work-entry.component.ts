import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProposedWorksApiService } from '../../../../core/services/proposed-works-api.service';
import { forkJoin } from 'rxjs';

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
  isHandicapped: '' | 'Y' | 'N' = ''; sex: '' | 'M' | 'F' | 'T' = '';
  schemeDepartment = '01'; assemblyNumber: number | null = null; constituencyCode = ''; mlaName = ''; parliamentHouse: 'L' | 'R' = 'L'; parliamentNumber: number | null = null; parliamentCode = ''; mpName = '';
  recommendedBy = ''; remarks = ''; isAnnualWorkPlan = true; isChecklistConfirmed = false; signatoryName = ''; signatoryDesignation = ''; otp = '';
  recommendationPdf: File | null = null; revenueRecordPdf: File | null = null;
  districts: Row[] = []; financialYears: Row[] = []; campaignSchemes: Row[] = []; categories: Row[] = []; subCategories: Row[] = []; blocks: Row[] = []; panchayats: Row[] = []; villages: Row[] = []; towns: Row[] = []; agencies: Row[] = []; subAgencies: Row[] = []; assemblies: Row[] = []; mlaList: Row[] = []; mpList: Row[] = []; schemes: Row[] = []; convergenceSchemes: Row[] = [];
  fundInputs: Record<string, FundInput> = {}; convergenceInputs: Record<string, { selected: boolean; amount: number | null }> = {};
  private convergenceMap = new Map<number, Set<number>>();
  isLoading = false; isLoadingConvergence = false; isSaving = false; errorMessage = ''; successMessage = ''; approvedPlan: Row | null = null; currentUserType = '';
  validationErrors: Array<{ field: string; message: string }> = [];

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
  onSectorChange(value: 'Rural' | 'Urban'): void { this.sector = value; this.workTo = value === 'Urban' ? 'T' : 'V'; this.blockCode = this.panchayatCode = this.villageCode = this.townCode = this.wardCode = ''; this.panchayats = []; this.villages = []; this.loadCategories(); }
  onSchemeDepartmentChange(): void { this.loadSchemes(); }
  onCampaignChange(): void { this.workCategory = null; this.workSubCategory = null; this.loadCategories(); }
  onCategoryChange(): void { this.workSubCategory = null; }
  onConvergenceChange(enabled: boolean): void { this.isConvergence = enabled; if (!enabled) { for (const value of Object.values(this.convergenceInputs)) { value.selected = false; value.amount = null; } } }
  onFinancialYearChange(): void { this.loadSchemes(); }
  onDistrictChange(): void { this.blockCode = this.panchayatCode = this.villageCode = this.townCode = this.wardCode = ''; this.panchayats = []; this.villages = []; this.subAgencyId = null; this.subAgencies = []; if (this.agencyId) this.onAgencyChange(); this.loadBlocks(); this.loadTowns(); this.loadAssemblies(); this.loadMembersOfParliament(); this.loadSchemes(); }
  loadCategories(): void {
    this.api.getWorkCategories(this.campaignSchemeId || undefined).subscribe({ next: r => this.categories = this.rows(r), error: e => this.loadError(e) });
    this.api.getWorkSubCategories(this.sector === 'Rural' ? 'R' : 'U', this.campaignSchemeId || undefined).subscribe({ next: r => this.subCategories = this.rows(r), error: e => this.loadError(e) });
  }
  loadSchemes(): void {
    if (!this.districtCode || !this.finYear || !this.schemeDepartment) return;
    const filters: Record<string, string | number | boolean> = { districtCode: this.districtCode, finYear: this.finYear, schemeDepartment: this.schemeDepartment, shreeOnly: this.isShreeScheme, previousYearOnly: false };
    if (this.constituencyCode) filters['constCode'] = this.constituencyCode; if (this.assemblyNumber) filters['assemblyNo'] = this.assemblyNumber;
    this.api.getSchemes(filters).subscribe({ next: r => { this.schemes = this.rows(r); const next: Record<string, FundInput> = {}; for (const s of this.schemes) { const k = this.key(s,'schemeCode','code','id'); next[k] = { ...(this.fundInputs[k] || { selected: false, amount: null, ownFundRelease: null, publicContribution: null, availableAmount: null }), availableAmount: Number(this.pick(s,'availableAmount') || 0) }; } this.fundInputs = next; this.onPrimarySchemesChange(); }, error: e => this.loadError(e) });
  }
  onBlockChange(): void {
    this.panchayatCode = ''; this.villageCode = ''; this.panchayats = []; this.villages = [];
    const block = this.blocks.find(item => String(this.pick(item, 'blockCode', 'blockId', 'code', 'id')) === String(this.blockCode));
    const code = String(this.pick(block, 'blockCode', 'blockId', 'code', 'id') || '').trim();
    if (!this.districtCode || !code) return;
    this.api.getPanchayats(this.districtCode, [code]).subscribe({ next: r => this.panchayats = this.rows(r), error: e => this.loadError(e) });
  }
  onPanchayatChange(): void { this.villageCode = ''; this.villages = []; if (this.blockCode && this.panchayatCode) this.api.getVillages(this.districtCode, this.blockCode, [this.panchayatCode]).subscribe({ next: r => this.villages = this.rows(r), error: e => this.loadError(e) }); }
  onWorkToChange(): void { if (this.workTo === 'B') { this.panchayatCode = ''; this.villageCode = ''; this.panchayats = []; this.villages = []; } else if (this.workTo === 'P') { this.villageCode = ''; this.villages = []; } }
  onAgencyChange(): void { this.subAgencyId = null; this.subAgencies = []; if (this.agencyId) this.api.getSubAgencies(this.agencyId, this.districtCode).subscribe({ next: r => this.subAgencies = this.rows(r), error: e => this.loadError(e) }); }
  onAssemblyChange(): void { this.mlaName = ''; this.mlaList = []; const assembly = this.assemblies.find(a => Number(this.pick(a,'assemblyNumber','assemblyNo','assembly','code','id')) === Number(this.assemblyNumber)); this.constituencyCode = String(this.pick(assembly,'constituencyCode','constCode') || ''); if (this.assemblyNumber) this.api.getMlaList(String(this.assemblyNumber), this.districtCode).subscribe({ next: r => this.mlaList = this.rows(r), error: e => this.loadError(e) }); this.loadSchemes(); }
  onParliamentHouseChange(): void { this.loadMembersOfParliament(); }
  onMpChange(): void { const mp = this.mpList.find(x => String(this.pick(x,'mpName','memberName','name')) === this.mpName); this.parliamentCode = this.pick(mp,'parliamentCode','parliamentId','code') || ''; }
  loadMembersOfParliament(): void { this.mpName = ''; this.parliamentCode = ''; this.mpList = []; this.api.getMembersOfParliament(this.districtCode || undefined, this.parliamentNumber || undefined).subscribe({ next: r => this.mpList = this.rows(r), error: e => this.loadError(e) }); }
  onCampaignMasterChange(): void { this.onCampaignChange(); }
  hasScheme(code: number): boolean { return Object.entries(this.fundInputs).some(([id, value]) => value.selected && Number(id) === code); }
  onPrimarySchemesChange(): void {
    const selected = Object.entries(this.fundInputs).filter(([, value]) => value.selected).map(([code]) => Number(code));
    if (!selected.includes(9)) { this.assemblyNumber = null; this.constituencyCode = ''; this.mlaName = ''; this.mlaList = []; }
    if (!selected.includes(10)) { this.parliamentCode = ''; this.parliamentNumber = null; this.parliamentHouse = 'L'; this.mpName = ''; this.mpList = []; }
    this.convergenceMap.clear();
    if (!selected.length) { this.isLoadingConvergence = false; return; }
    this.isLoadingConvergence = true;
    forkJoin(selected.map(code => this.api.getConvergenceSchemes(code))).subscribe({
      next: responses => {
        const nextMap = new Map<number, Set<number>>();
        responses.forEach((response, index) => {
          const rows = this.rows(response), allowed = new Set<number>();
          for (const row of rows) { const code = Number(this.pick(row,'convergenceSchemeCode','schemeCode','code','id')); if (Number.isInteger(code) && code > 0) allowed.add(code); }
          nextMap.set(selected[index], allowed);
        });
        this.convergenceMap = nextMap; this.isLoadingConvergence = false;
      }, error: e => { this.isLoadingConvergence = false; this.loadError(e); }
    });
  }
  async selectPdf(event: Event, kind: 'recommendation' | 'revenue'): Promise<void> {
    const input = event.target as HTMLInputElement, file = input.files?.[0] || null;
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) || (!!file.type && file.type.toLowerCase() !== 'application/pdf') || file.size <= 0 || file.size > 3 * 1024 * 1024) {
      if (kind === 'recommendation') this.recommendationPdf = null; else this.revenueRecordPdf = null;
      this.errorMessage = `${kind === 'recommendation' ? 'Recommendation' : 'Revenue record'} must be a non-empty PDF no larger than 3 MB.`; input.value = ''; return;
    }
    if (await file.slice(0, 5).text() !== '%PDF-') { if (kind === 'recommendation') this.recommendationPdf = null; else this.revenueRecordPdf = null; this.errorMessage = 'The selected file does not have a valid PDF signature.'; input.value = ''; return; }
    this.errorMessage = ''; if (kind === 'recommendation') this.recommendationPdf = file; else this.revenueRecordPdf = file;
  }
  private selectedSchemeRequests(): any[] { return Object.entries(this.fundInputs).filter(([,v]) => v.selected).map(([k,v]) => ({ schemeCode: Number(k), amount: Number(v.amount), ownFundRelease: Number(v.ownFundRelease || 0), publicContribution: Number(v.publicContribution || 0) })); }
  private selectedConvergenceRequests(): any[] { return Object.entries(this.convergenceInputs).filter(([,v]) => v.selected).map(([k,v]) => ({ convergenceSchemeCode: Number(k), amount: Number(v.amount) })); }
  submit(form?: NgForm): void {
    form?.form.markAllAsTouched();
    this.errorMessage = ''; this.successMessage = ''; this.validationErrors = []; const schemes = this.selectedSchemeRequests(), convergenceSchemes = this.isConvergence ? this.selectedConvergenceRequests() : [];
    this.validationErrors = this.validateBeforeSubmit(schemes, convergenceSchemes);
    if (this.validationErrors.length) { this.errorMessage = `Please correct ${this.validationErrors.length} validation issue${this.validationErrors.length === 1 ? '' : 's'} before submitting.`; this.focusFirstInvalid(this.validationErrors[0].field); return; }
    if (!this.districtCode || !this.finYear || !this.workName.trim() || !this.approvalNumber.trim()) { this.errorMessage = 'जिला, वित्तीय वर्ष, कार्य का नाम और अनुमोदन संख्या भरें।'; return; }
    if (!schemes.length || schemes.some(x => !x.amount || x.amount <= 0 || x.amount > 9999)) { this.errorMessage = 'कम से कम एक योजना चुनें और उसकी राशि 0 से अधिक तथा 9999 तक भरें।'; return; }
    if (this.currentUserType === '6' && !this.otp.trim()) { this.errorMessage = 'इस उपयोगकर्ता प्रकार के लिए OTP आवश्यक है।'; return; }
    const locations = this.sector === 'Rural' ? [{ blockCode: this.blockCode || null, panchayatCode: ['P','V'].includes(this.workTo) ? this.panchayatCode || null : null, villageCode: this.workTo === 'V' ? this.villageCode || null : null, townCode: null, wardCode: null }] : [{ townCode: this.townCode || null, wardCode: this.wardCode || null }];
    if ((this.sector === 'Rural' && (!this.blockCode || (this.workTo !== 'B' && !this.panchayatCode) || (this.workTo === 'V' && !this.villageCode))) || (this.sector === 'Urban' && !this.townCode)) { this.errorMessage = 'कृपया कार्य का स्थान चुनें।'; return; }
    const request: any = { districtCode: this.districtCode, finYear: this.finYear, sector: this.sector === 'Rural' ? 'R' : 'U', workType: this.workType, schemeDepartment: this.schemeDepartment, workCategory: this.workCategory, workSubCategory: Number(this.workSubCategory), workName: this.workName.trim(), workApprovalNumber: this.approvalNumber.trim(), workApprovalDate: this.workApprovalDate || null, workReceiptDate: this.workReceiptDate || null, agencyId: Number(this.agencyId), subAgencyId: this.subAgencyId ? Number(this.subAgencyId) : null, expectedTimeMonths: this.expectedTimeMonths ? Number(this.expectedTimeMonths) : null, workTo: this.workTo, beneficiaryGroup: this.beneficiaryGroup, isHandicapped: this.isHandicapped || null, sex: this.sex || null, beneficiarySc: this.beneficiarySc, beneficiarySt: this.beneficiarySt, beneficiaryObc: this.beneficiaryObc, beneficiaryGeneral: this.beneficiaryGeneral, beneficiarySbc: this.beneficiarySbc, beneficiaryOther: this.beneficiaryOther, beneficiaryMinority: this.beneficiaryMinority, beneficiaryBpl: this.beneficiaryBpl, beneficiaryApl: this.beneficiaryApl, beneficiaryState: this.beneficiaryState, assemblyNumber: this.assemblyNumber, constituencyCode: this.constituencyCode || null, mlaName: this.mlaName || null, parliamentCode: this.parliamentCode || null, parliamentNumber: this.parliamentNumber, parliamentHouse: this.parliamentHouse, mpName: this.mpName || null, recommendedBy: this.recommendedBy || null, remarks: this.remarks || null, campaignSchemeId: this.campaignSchemeId, isShreeScheme: this.isShreeScheme, priority: Number(this.priority), isConvergence: this.isConvergence, isAnnualWorkPlan: this.isAnnualWorkPlan, isChecklistConfirmed: this.isChecklistConfirmed, signatoryName: this.signatoryName, signatoryDesignation: this.signatoryDesignation, sourcePlanId: this.approvedPlan?.sourcePlanId ?? this.approvedPlan?.planId ?? this.approvedPlan?.id ?? null, mlaRecommendationId: null, otp: this.otp || null, locations, schemes, convergenceSchemes };
    // Drop stale conditional values and trim all user-entered text before serialization.
    if (!schemes.some(s => s.schemeCode === 9)) { request.assemblyNumber = null; request.constituencyCode = null; request.mlaName = null; }
    if (!schemes.some(s => s.schemeCode === 10)) { request.parliamentCode = null; request.parliamentNumber = null; request.parliamentHouse = null; request.mpName = null; }
    request.workApprovalDate = this.workApprovalDate || null; request.workReceiptDate = this.workReceiptDate || null;
    request.schemeDepartment = this.schemeDepartment.trim(); request.beneficiaryGroup = this.beneficiaryGroup.trim(); request.signatoryName = this.signatoryName.trim(); request.signatoryDesignation = this.signatoryDesignation.trim(); request.recommendedBy = this.recommendedBy.trim() || null; request.remarks = this.remarks.trim() || null;
    const requestBytes = new TextEncoder().encode(JSON.stringify(request)).length + (this.recommendationPdf?.size || 0) + (this.revenueRecordPdf?.size || 0);
    if (requestBytes > 7 * 1024 * 1024) { this.validationErrors = [{field:'files', message:'Complete multipart request exceeds the 7 MB limit.'}]; this.errorMessage = this.validationErrors[0].message; return; }
    const requiresRecommendation = schemes.some(s => [9,10].includes(s.schemeCode)); if (requiresRecommendation && !this.recommendationPdf) { this.errorMessage = 'चयनित योजना के लिए विधायक अनुशंसा PDF आवश्यक है।'; return; }
    this.isSaving = true; this.api.create(request, this.recommendationPdf, this.revenueRecordPdf).subscribe({ next: r => { this.isSaving = false; if (r?.success === false) { this.validationErrors = this.serverErrors({error:r}); this.errorMessage = r.message || 'The proposal could not be saved.'; return; } this.successMessage = r?.message || 'The proposal was saved successfully.'; }, error: e => { this.isSaving = false; this.errorMessage = this.validationMessage(e); } });
  }
  private validateBeforeSubmit(schemes: any[], convergence: any[]): Array<{field:string;message:string}> {
    const out: Array<{field:string;message:string}> = [], add = (field:string,message:string) => out.push({field,message});
    const trim = (v:any) => String(v ?? '').trim(), positive = (v:any) => Number.isInteger(Number(v)) && Number(v) > 0;
    if (!/^\d{2}$/.test(this.districtCode) || !this.districts.some(x=>String(this.pick(x,'districtCode','distCode','code','id'))===this.districtCode)) add('districtCode','Select an active district with an exactly two-digit code.');
    if (!/^\d{4}-\d{2}$/.test(this.finYear) || !this.financialYears.some(x => this.key(x,'finYear','finYr','financialYear','code','value') === this.finYear)) add('finYear','Select a configured financial year in YYYY-YY format.');
    if (!['Rural','Urban'].includes(this.sector)) add('sector','Select Rural or Urban.');
    if (!['N','M'].includes(this.workType)) add('workType','Select a valid work type.');
    if (!/^.{1,2}$/.test(trim(this.schemeDepartment))) add('schemeDepartment','Scheme department is required (1–2 characters).');
    if (!trim(this.workCategory) || trim(this.workCategory).length !== 2 || !this.categories.some(x => String(this.pick(x,'workCategory','categoryCode','workCategoryCode','workCategoryId','categoryId','id','code')) === String(this.workCategory))) add('workCategory','Select an active work category.');
    if (!positive(this.workSubCategory) || !this.subCategories.some(x => String(this.pick(x,'workSubCategory','subCategoryCode','workSubCategoryCode','workSubCategoryId','subCategoryId','id','code')) === String(this.workSubCategory) && (!this.pick(x,'workCategory','categoryCode','workCategoryCode','categoryId') || String(this.pick(x,'workCategory','categoryCode','workCategoryCode','categoryId')) === String(this.workCategory)))) add('workSubCategory','Select an active subcategory that belongs to this category.');
    if (trim(this.workName).length < 3 || trim(this.workName).length > 250) add('workName','Work name must contain 3–250 nonblank characters.');
    if (!trim(this.approvalNumber) || trim(this.approvalNumber).length > 60) add('approvalNumber','Approval number is required and must be at most 60 characters.');
    const today = new Date(); today.setHours(0,0,0,0); const parseDate = (v:string) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null; const [year,month,day]=v.split('-').map(Number), d=new Date(year,month-1,day); return d.getFullYear()!==year || d.getMonth()!==month-1 || d.getDate()!==day ? null : d; };
    const approval=parseDate(this.workApprovalDate), receipt=parseDate(this.workReceiptDate);
    if (!approval || approval > today) add('workApprovalDate','Approval date must be valid and no later than today.');
    if (!receipt || receipt > today || (!!approval && receipt < approval)) add('workReceiptDate','Receipt date must be valid, no later than today, and not before approval date.');
    if (!positive(this.agencyId) || !this.agencies.some(x=>String(this.pick(x,'agencyId','id','code'))===String(this.agencyId))) add('agencyId','Select an active executing agency.');
    if (!positive(this.subAgencyId) || !this.subAgencies.some(x=>String(this.pick(x,'subAgencyId','id','code'))===String(this.subAgencyId))) add('subAgencyId','Select an approved subagency linked to the agency.');
    if (this.expectedTimeMonths !== null && this.expectedTimeMonths !== undefined && (!Number.isInteger(+this.expectedTimeMonths) || +this.expectedTimeMonths < 1 || +this.expectedTimeMonths > 600)) add('expectedTimeMonths','Expected time must be an integer from 1 to 600 months.');
    if (!['B','P','V','T'].includes(this.workTo) || (this.sector==='Rural' && this.workTo==='T') || (this.sector==='Urban' && this.workTo!=='T')) add('workTo','Choose a location type allowed for the selected sector.');
    if (!trim(this.beneficiaryGroup) || trim(this.beneficiaryGroup).length>50) add('beneficiaryGroup','Beneficiary group is required and limited to 50 characters.');
    if (![this.beneficiarySc,this.beneficiarySt,this.beneficiaryObc,this.beneficiaryGeneral,this.beneficiarySbc,this.beneficiaryOther,this.beneficiaryMinority].some(Boolean)) add('beneficiaryType','Select at least one beneficiary category: SC, ST, OBC, General, SBC, Other, or Minority.');
    if (this.priority !== null && this.priority !== undefined && (!Number.isInteger(+this.priority) || +this.priority<1 || +this.priority>999999)) add('priority','Priority must be an integer from 1 to 999999.');
    if (!['','Y','N'].includes(this.isHandicapped)) add('isHandicapped','Choose Y or N for handicap status.'); if (!['','M','F','T'].includes(this.sex)) add('sex','Choose M, F, or T for sex.');
    if (!this.isChecklistConfirmed) add('isChecklistConfirmed','Confirm that Form 5 has been received.');
    if (!trim(this.signatoryName) || trim(this.signatoryName).length>50) add('signatoryName','Signatory name is required and limited to 50 characters.');
    if (!trim(this.signatoryDesignation) || trim(this.signatoryDesignation).length>50) add('signatoryDesignation','Signatory designation is required and limited to 50 characters.');
    if (trim(this.recommendedBy).length>100) add('recommendedBy','Recommended by is limited to 100 characters.'); if (trim(this.remarks).length>60) add('remarks','Remarks are limited to 60 characters.');
    if (this.sector==='Rural' && (!this.blockCode || this.blockCode.length>4 || !this.blocks.some(x=>String(this.pick(x,'blockCode','blockId','code','id'))===this.blockCode) || (this.workTo!=='B' && (!this.panchayatCode || this.panchayatCode.length>4 || !this.panchayats.some(x=>String(this.pick(x,'panchayatCode','gramPanchayatCode','panchayatId','gramPanchayatId','code','id'))===this.panchayatCode))) || (this.workTo==='V' && (!this.villageCode || this.villageCode.length>8 || !this.villages.some(x=>String(this.pick(x,'villageCode','villageId','code','id'))===this.villageCode))))) add('locations','Select active block, panchayat, and village codes from their parent-scoped masters.');
    if (this.sector==='Urban' && (!this.townCode || this.townCode.length>8 || !this.towns.some(x=>String(this.pick(x,'townCode','townId','code','id'))===this.townCode) || this.wardCode.length>200)) add('locations','Select one active town; ward must be at most 200 characters.');
    if (!schemes.length) add('schemes','Select at least one primary scheme.');
    if (this.isLoadingConvergence) add('convergenceSchemes','Wait for mapped convergence schemes to finish loading.');
    const seen=new Set<number>();
    for (const [i,row] of schemes.entries()) { const code=Number(row.schemeCode), master=this.schemes.find(x=>Number(this.pick(x,'schemeCode','code','id'))===code), f=this.fundInputs[String(code)]; if(!positive(code)||seen.has(code)||!master)add(`Schemes[${i}].SchemeCode`,'Each selected scheme must be active and unique.'); seen.add(code); if(!(row.amount>0&&row.amount<=9999))add(`Schemes[${i}].Amount`,'Scheme amount must be greater than zero and no more than 9999.'); for(const field of ['ownFundRelease','publicContribution'])if(row[field]<0||row[field]>9999999999999)add(`Schemes[${i}].${field}`,'Contribution must be between 0 and 9999999999999.'); if(![9,10].includes(code)&&(!f?.availableAmount||f.availableAmount<=0||row.amount>f.availableAmount))add(`Schemes[${i}].Amount`,'Amount must not exceed a positive available fund balance.'); }
    if (this.isConvergence&&!convergence.length) add('convergenceSchemes','Select at least one convergence scheme, or choose No.');
    const convergenceCodes=new Set<number>(); for(const [i,row] of convergence.entries()){const code=Number(row.convergenceSchemeCode);if(!positive(code)||convergenceCodes.has(code)||!this.convergenceSchemes.some(x=>Number(this.pick(x,'convergenceSchemeCode','schemeCode','code','id'))===code))add(`ConvergenceSchemes[${i}].ConvergenceSchemeCode`,'Convergence schemes must be active and unique.');convergenceCodes.add(code);if(!(row.amount>0&&row.amount<=9999))add(`ConvergenceSchemes[${i}].Amount`,'Convergence amount must be greater than zero and no more than 9999.');if(schemes.some(s=>s.schemeCode===code||this.convergenceMap.get(s.schemeCode)?.has(code)))add(`ConvergenceSchemes[${i}]`,'A convergence scheme cannot be the same as or mapped to a selected primary scheme.');}
    if(schemes.some(s=>s.schemeCode===9)){if(!positive(this.assemblyNumber))add('assemblyNumber','Assembly is required for scheme 9.');if(!trim(this.constituencyCode)||trim(this.constituencyCode).length>3)add('constituencyCode','Constituency code is required and limited to 3 characters.');if(!trim(this.mlaName)||trim(this.mlaName).length>60)add('mlaName','MLA name is required and limited to 60 characters.');}
    if(schemes.some(s=>s.schemeCode===10)){if(!Number.isInteger(+this.parliamentCode)||!this.parliamentCode)add('parliamentCode','Parliament code is required for scheme 10.');if(!['L','R'].includes(this.parliamentHouse))add('parliamentHouse','Select L or R for scheme 10.');if(!trim(this.mpName)||trim(this.mpName).length>60)add('mpName','MP name is required and limited to 60 characters.');}
    const userDistrict=String(this.auth.getCurrentUser()?.districtCode||''); if(Number(this.currentUserType)===3&&userDistrict&&this.districtCode!==userDistrict&&schemes.some(s=>s.schemeCode!==10))add('schemes','UserType 3 proposing for another district must select only scheme 10.');
    if(this.campaignSchemeId&&(!this.campaignSchemes.some(x=>String(this.pick(x,'campaignSchemeId','schemeId','id','code'))===String(this.campaignSchemeId))||!this.categories.some(x=>String(this.pick(x,'workCategory','categoryCode','workCategoryCode','workCategoryId','categoryId','id','code'))===String(this.workCategory))||!this.subCategories.some(x=>String(this.pick(x,'workSubCategory','subCategoryCode','workSubCategoryCode','workSubCategoryId','subCategoryId','id','code'))===String(this.workSubCategory))))add('campaignSchemeId','Category and subcategory must be mapped to the selected campaign.');
    if(this.currentUserType==='6'&&!/^.{4,10}$/.test(this.otp.trim()))add('otp','OTP for MLA_work_proposal must contain 4–10 characters.');
    if(schemes.some(s=>[9,10].includes(s.schemeCode))&&!this.recommendationPdf)add('recommendationPdf','Recommendation PDF is required for scheme 9 or 10.');
    return out;
  }
  private focusFirstInvalid(field:string):void {
    const aliases:Record<string,string>={WorkApprovalDate:'workApprovalDate',WorkReceiptDate:'workReceiptDate',WorkApprovalNumber:'approvalNumber',Name:'workName',DistrictCode:'districtCode',FinYear:'finYear',WorkCategory:'workCategory',WorkSubCategory:'workSubCategory',AgencyId:'agencyId',SubAgencyId:'subAgencyId',RecommendationPdf:'recommendationPdf',RevenueRecordPdf:'revenueRecordPdf',IsChecklistConfirmed:'isChecklistConfirmed'};
    const key=field.replace(/\[\d+\]/g,'').split('.').pop()||field, name=aliases[key]||key.charAt(0).toLowerCase()+key.slice(1);
    setTimeout(()=>{let el=document.querySelector(`[name="${CSS.escape(name)}"]`) as HTMLElement|null;if(!el&&/^Schemes\./i.test(field))el=document.querySelector('[name^="schemeAmount-"]') as HTMLElement|null;if(!el&&/^ConvergenceSchemes\./i.test(field))el=document.querySelector('[name^="convergenceAmount-"]') as HTMLElement|null;if(!el&&/location/i.test(field))el=document.querySelector('[name="blockCode"], [name="townCode"]') as HTMLElement|null;el?.focus();},0);
  }
  private serverErrors(e:any):Array<{field:string;message:string}>{const errors=e?.error?.errors||e?.errors||{},out:Array<{field:string;message:string}>=[];for(const [field,value] of Object.entries(errors))for(const message of Array.isArray(value)?value:[value])out.push({field,message:String(message)});return out;}
  private validationMessage(e: any): string {
    const status = Number(e?.status || e?.statusCode || 0), errors = this.serverErrors(e);
    if (errors.length) { this.validationErrors = errors; this.focusFirstInvalid(errors[0].field); return e?.error?.message || e?.error?.title || 'The API rejected one or more fields. Review the errors below.'; }
    if (status === 401) return e?.error?.message || 'Authentication or OTP failed or expired. Sign in again or request a new OTP.';
    if (status === 403) return e?.error?.message || 'Access denied for this district or operation.';
    if (status === 404) return e?.error?.message || 'Work or related data was not found. Refresh and try again.';
    if (status === 409) return e?.error?.message || 'The work state has changed. Refresh the record before retrying.';
    if (status === 500) return `${e?.error?.message || 'Unexpected server error.'}${e?.error?.traceId ? ` Trace: ${e.error.traceId}` : ''}`;
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
