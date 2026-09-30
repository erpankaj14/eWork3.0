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
  dlcApprovalDate1?: string | null;
  blockApprovalDate1?: string | null;
  slcApprovalDate1?: string | null;
  priority?: number | string;
  cmBadpCategoryCode?: string | null;
  jayShreeCode?: string | null;
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
  id?: number;
  schemeCode?: number;
  finYr?: string;
  districtCode?: string;
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
