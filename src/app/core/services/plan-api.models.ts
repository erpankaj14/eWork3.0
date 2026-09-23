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
  schemeCode?: number;
  schemeName?: string;
  finYr?: string;
  districtCode?: string;
  districtName?: string;
  workName?: string;
  workType?: string;
  constCode?: string;
  sectorArea?: string;
  workCategory?: string;
  dlcApprovalDate1?: string; // dd/MM/yyyy
  blockApprovalDate1?: string; // dd/MM/yyyy
  slcApprovalDate1?: string; // dd/MM/yyyy
  budgetTypeId?: number;
  budgetTypeName?: string;
  totalEstimatedCost?: number;
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
  budgetTypeCode?: string;
  budgetTypeName?: string;
  budgetTypeNameHi?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export type MultipartField = string | number | boolean | null | undefined;
