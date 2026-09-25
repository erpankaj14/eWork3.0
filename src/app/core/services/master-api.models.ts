export interface BlockDto {
  blockCode: string;
  blockNameE: string;
  blockNameH?: string;
  districtCode?: string;
}

export interface GramPanchayatDto {
  panchayatCode: string;
  panchayatNameE: string;
  panchayatNameH?: string;
  blockCode?: string;
  districtCode?: string;
}

export interface VillageDto {
  villageCode: string;
  villageNameE: string;
  villageNameH?: string;
  panchayatCode?: string;
  blockCode?: string;
  districtCode?: string;
}

export interface WorkCategoryDto {
  categoryCode: string;
  categoryNameE: string;
  categoryNameH?: string;
  sectorCode?: string;
}

export interface WorkSubCategoryDto {
  subCategoryCode: string;
  subCategoryNameE: string;
  subCategoryNameH?: string;
  categoryCode?: string;
  sectorCode?: string;
}

export interface MlaDto {
  assemblyNo: string;
  assemblyNameE: string;
  assemblyNameH?: string;
  mlaNameE: string;
  mlaNameH?: string;
}

export interface AgencyDto {
  agencyId: number | string;
  agencyNameE: string;
  agencyNameH?: string;
  districtCode?: string;
}

export interface DepartmentDto {
  deptId: number | string;
  deptNameE: string;
  deptNameH?: string;
}
