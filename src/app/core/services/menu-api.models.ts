export type MenuLevelName =
  | 'MainMenu'
  | 'ParentMenu'
  | 'SubMenu'
  | 'MlaMenu';

export enum MenuLevelCode {
  Unknown = 0,
  MainMenu = 1,
  ParentMenu = 2,
  SubMenu = 3,
  MlaMenu = 4
}

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface ParentMenuDto {
  menuId: number;
  menuNameE: string | null;
  menuNameG: string | null;
  menuNameH: string | null;
  navigateUrl: string | null;
  parentId: number | null;
  orderNo: number | null;
  menuType: string | null;
  imgUrl: string | null;
  isMlaMp: string | null;
  isMvc: boolean | null;
  mvcPath: string | null;
  isEstimate: boolean | null;
  imgColor: string | null;
  menuFlag: number | null;
}

export interface MenuFlagDto {
  id: number;
  menuFlagName: string;
}

export interface MenuListItemDto {
  menuId: number;
  parentId: number | null;
  parentMenuName: string | null;
  menuNameE: string | null;
  menuNameH: string | null;
  menuNameG: string | null;
  navigateUrl: string | null;
  mvcPath: string | null;
  isMvc: boolean;
  isEstimate: boolean;
  menuFlag: number | null;
  menuFlagName: string | null;
  imgUrl: string | null;
  imgColor: string | null;
  orderNo: number | null;
  isMlaMp: string | null;
}

export interface MenuDetailsDto {
  menuId: number;
  menuType: MenuLevelName | MenuLevelCode;
  mainMenuId: number | null;
  parentMenuId: number | null;
  menuNameE: string;
  menuNameH: string | null;
  menuNameG: string | null;
  navigatePage: string;
  isMvc: boolean;
  isEstimate: boolean;
  menuFlag: number | null;
  imgUrl: string | null;
  imgColor: string | null;
  orderNo: number | null;
}

export interface SaveMenuRequest {
  menuType: MenuLevelName;
  mainMenuId: number | null;
  parentMenuId: number | null;
  menuNameE: string;
  menuNameH: string | null;
  menuNameG: string | null;
  navigatePage: string;
  isMvc: boolean;
  isEstimate: boolean;
  menuFlag: number | null;
  imgUrl: string | null;
  imgColor: string | null;
}

export interface UpdateMenuOrderRequest {
  parentId: number | null;
  menuIds: number[];
}

export interface MenuIdResult { menuId: number; }
export interface DeleteResult { deletedCount: number; }
export interface OrderResult { updatedCount: number; }

export function toMenuLevelName(
  value: MenuLevelName | MenuLevelCode
): MenuLevelName {
  if (typeof value === 'string') return value;

  const map: Record<number, MenuLevelName> = {
    1: 'MainMenu',
    2: 'ParentMenu',
    3: 'SubMenu',
    4: 'MlaMenu'
  };

  return map[value] ?? 'MainMenu';
}
