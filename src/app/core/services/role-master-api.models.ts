export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginTypeDto {
  loginTypeId: number;
  description: string;
}

export interface RoleMenuNodeDto {
  menuId: number;
  parentId: number | null;
  menuNameE: string | null;
  menuNameH: string | null;
  menuNameG: string | null;
  orderNo: number | null;
  isMlaMp: string | null;
  isAssigned: boolean;
  children: RoleMenuNodeDto[];
}

export interface RoleMenuRightsData {
  loginType: LoginTypeDto;
  assignedMenuIds: number[];
  menus: RoleMenuNodeDto[];
}

export interface RoleMenuRightsResponse {
  success: boolean;
  count: number;
  data: RoleMenuRightsData;
}

export interface SaveRoleMenuRightsRequest {
  loginTypeId: number;
  menuIds: number[];
}

export interface SaveRoleMenuRightsResult {
  loginType: LoginTypeDto;
  assignedCount: number;
  assignedMenuIds: number[];
}
