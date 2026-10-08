export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface MessageResponse {
  success: boolean;
  message: string;
  count?: number;
}

export interface PlanModel {
  id?: number;
  finYr?: string;
  workType?: string;
  sectorArea?: string;
  districtCode?: string;
  districtName?: string;
  dlcApprovalDate?: string | null;
  dlcApprovalDate1?: string | null;
  blockApprovalDate?: string | null;
  blockApprovalDate1?: string | null;
  slcApprovalDate?: string | null;
  slcApprovalDate1?: string | null;
  priority?: number | string;
  cmBadpCategoryCode?: string | null;
  jayShreeCode?: number | null;
  blockCode?: string;
  blockName?: string;
  panchayatCode?: string;
  gramPanchayat?: string;
  villageCode?: string;
  village?: string;
  townCode?: string | null;
  town?: string;
  schemeCode?: number;
  schemeName?: string;
  workCategory?: string | number;
  workSubCategory?: string | number;
  subCategory?: string;
  departmentId?: number;
  executiveDept?: string;
  agencyId?: number;
  executiveAgency?: string;
  budgetType?: number;
  budgetTypeId?: number;
  budgetTypeName?: string;
  schemeAmount?: number;
  totalEstimatedCost?: number;
  isConvergence?: boolean;
  convergenceSchemeCode?: string | number | null;
  convergenceAmount?: number | null;
  workName?: string;
  assemblyNo?: number;
  constCode?: string;
  status?: string;
  statusCode?: number;
  remarks?: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
  workCount?: number;
  planCreatedBy?: string;
  sectorAreaName?: string;
  panchayatName?: string;
  villageName?: string;
  townName?: string;
  workCategoryName?: string;
  workSubCategoryName?: string;
  departmentName?: string;
  agencyName?: string;
  priorityName?: string;
  jayshreeCategoryName?: string;
  cmbadpSchemeCategoryName?: string;
  planStatus?: string;
  workTypeName?: string;
  proposedAmount?: number;
  convergenceSchemeName?: string;
  mlaName?: string;
  [key: string]: unknown;
}

export interface PlanFileModel {
  id?: number;
  schemeCode?: number;
  finYr?: string;
  districtCode?: string;
  districtName?: string;
  remarks?: string;
  filePath?: string;
  fileStatus?: string;
  createdBy?: string;
  createdDate?: string;
  [key: string]: unknown;
}

export interface SelectedPlan {
  PlanId?: number;
  planId?: number;
  id?: number;
  SchemeCode?: number;
  schemeCode?: number;
  FinYr?: string;
  finYr?: string;
  DistrictCode?: string;
  districtCode?: string;
  workName?: string;
  [key: string]: unknown;
}

export interface BudgetType {
  id?: number;
  budgetType?: string;
  budgetTypeCode?: string;
  budgetTypeName?: string;
  budgetTypeNameHi?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export type MultipartField = string | number | boolean | null | undefined;

export interface OtpRequestModel {
  schemeCode?: number;
  finYr?: string;
  districtCode?: string;
  mobileNo?: string;
  ssoId?: string;
  actionType?: 'APPROVE' | 'REJECT' | 'FORWARD' | 'REVERT' | string;
}

export interface VerifyOtpRequestModel {
  otp: string;
  schemeCode?: number;
  finYr?: string;
  districtCode?: string;
  mobileNo?: string;
  ssoId?: string;
  transactionId?: string;
}

export interface VerifyOtpResponseModel {
  success: boolean;
  message?: string;
  isVerified?: boolean;
  token?: string;
}

