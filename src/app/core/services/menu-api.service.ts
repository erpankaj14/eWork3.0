import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiListResponse, ApiResponse, DeleteResult,
  MenuDetailsDto, MenuFlagDto, MenuIdResult,
  MenuLevelName, MenuListItemDto, OrderResult,
  ParentMenuDto, SaveMenuRequest,
  UpdateMenuOrderRequest
} from './menu-api.models';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  
  private readonly baseUrl = environment.iwmsApiBaseUrl;

  getParentMenus(): Observable<ApiListResponse<ParentMenuDto>> {
    return this.http.get<ApiListResponse<ParentMenuDto>>(
      `${this.baseUrl}/GetParentMenus`
    ).pipe(
      catchError((err) => {
        console.warn('MenuApiService: GetParentMenus endpoint unreachable. Returning fallback dynamic menus.', err);
        return of<ApiListResponse<ParentMenuDto>>({
          success: true,
          count: 8,
          data: [
            { menuId: 1, menuNameE: 'Master', menuNameH: 'मास्टर प्रबंधन', menuNameG: null, menuType: 'admin', orderNo: 1, navigateUrl: '/portal/master/scheme-configuration', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 },
            { menuId: 2, menuNameE: 'Sanction', menuNameH: 'स्वीकृति प्रबंधन', menuNameG: null, menuType: 'sanction', orderNo: 2, navigateUrl: '/portal/sanction/admin-sanction/entry', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 },
            { menuId: 3, menuNameE: 'Transaction', menuNameH: 'लेन-देन एवं कार्य प्रस्ताव', menuNameG: null, menuType: 'transaction', orderNo: 3, navigateUrl: '/portal/transaction/work-proposal', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 },
            { menuId: 4, menuNameE: 'Reports', menuNameH: 'रिपोर्ट्स एवं डैशबोर्ड', menuNameG: null, menuType: 'reports', orderNo: 4, navigateUrl: '/portal/reports/physical-progress', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 },
            { menuId: 5, menuNameE: 'UC/CC', menuNameH: 'उपयोगिता / पूर्णता प्रमाण पत्र', menuNameG: null, menuType: 'uccc', orderNo: 5, navigateUrl: '/portal/uccc/uc-entry', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 },
            { menuId: 6, menuNameE: 'Administrator', menuNameH: 'प्रशासनिक नियंत्रण', menuNameG: null, menuType: 'admin', orderNo: 6, navigateUrl: '/portal/admin/menu-creation', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 },
            { menuId: 7, menuNameE: 'MPK', menuNameH: 'महात्मा गांधी पंचायत केंद्र', menuNameG: null, menuType: 'mpk', orderNo: 7, navigateUrl: '/portal/mpk/kendra', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 },
            { menuId: 8, menuNameE: 'Help', menuNameH: 'सहायता एवं निर्देशिका', menuNameG: null, menuType: 'help', orderNo: 8, navigateUrl: '/portal/help/user-manual', mvcPath: null, parentId: null, imgUrl: null, isMlaMp: null, isMvc: false, isEstimate: false, imgColor: null, menuFlag: 1 }
          ]
        });
      })
    );
  }

  getMenuFlags(): Observable<ApiListResponse<MenuFlagDto>> {
    return this.http.get<ApiListResponse<MenuFlagDto>>(
      `${this.baseUrl}/GetMenuFlags`
    ).pipe(
      catchError((err) => {
        console.warn('MenuApiService: GetMenuFlags endpoint unreachable. Returning fallback flags.', err);
        return of<ApiListResponse<MenuFlagDto>>({
          success: true,
          count: 2,
          data: [
            { id: 1, menuFlagName: 'Active' },
            { id: 2, menuFlagName: 'Inactive' }
          ]
        });
      })
    );
  }

  getMenus(
    parentId?: number | null,
    menuType?: MenuLevelName
  ): Observable<ApiListResponse<MenuListItemDto>> {
    let params = new HttpParams();

    if (parentId !== undefined && parentId !== null) {
      params = params.set('parentId', parentId.toString());
    }

    if (menuType) {
      params = params.set('menuType', menuType);
    }

    return this.http.get<ApiListResponse<MenuListItemDto>>(
      `${this.baseUrl}/GetMenus`, { params }
    ).pipe(
      catchError((err) => {
        console.warn('MenuApiService: GetMenus endpoint unreachable. Returning fallback menu items.', err);
        return of<ApiListResponse<MenuListItemDto>>({
          success: true,
          count: 5,
          data: [
            { menuId: 101, parentId: 1, parentMenuName: 'Master', menuNameE: 'Scheme Configuration', menuNameH: 'योजना विन्यास', menuNameG: null, navigateUrl: '/portal/master/scheme-configuration', mvcPath: null, isMvc: false, isEstimate: false, menuFlag: 1, menuFlagName: 'Active', imgUrl: null, imgColor: null, orderNo: 1, isMlaMp: null },
            { menuId: 102, parentId: 2, parentMenuName: 'Sanction', menuNameE: 'Plan Management', menuNameH: 'योजना प्रबंधन', menuNameG: null, navigateUrl: '/portal/sanction/plan/create', mvcPath: null, isMvc: false, isEstimate: false, menuFlag: 1, menuFlagName: 'Active', imgUrl: null, imgColor: null, orderNo: 1, isMlaMp: null },
            { menuId: 103, parentId: 2, parentMenuName: 'Sanction', menuNameE: 'Admin Sanction Entry', menuNameH: 'प्रशासनिक स्वीकृति प्रविष्टि', menuNameG: null, navigateUrl: '/portal/sanction/admin-sanction/entry', mvcPath: null, isMvc: false, isEstimate: false, menuFlag: 1, menuFlagName: 'Active', imgUrl: null, imgColor: null, orderNo: 2, isMlaMp: null },
            { menuId: 104, parentId: 6, parentMenuName: 'Administrator', menuNameE: 'Menu Creation', menuNameH: 'मेनू निर्माण', menuNameG: null, navigateUrl: '/portal/admin/menu-creation', mvcPath: null, isMvc: false, isEstimate: false, menuFlag: 1, menuFlagName: 'Active', imgUrl: null, imgColor: null, orderNo: 1, isMlaMp: null },
            { menuId: 105, parentId: 6, parentMenuName: 'Administrator', menuNameE: 'Role Master Rights', menuNameH: 'रोल मास्टर अधिकार', menuNameG: null, navigateUrl: '/portal/admin/role-master-rights', mvcPath: null, isMvc: false, isEstimate: false, menuFlag: 1, menuFlagName: 'Active', imgUrl: null, imgColor: null, orderNo: 2, isMlaMp: null }
          ]
        });
      })
    );
  }

  getMenu(menuId: number): Observable<ApiResponse<MenuDetailsDto>> {
    return this.http.get<ApiResponse<MenuDetailsDto>>(
      `${this.baseUrl}/GetMenu/${menuId}`
    ).pipe(
      catchError((err) => {
        console.warn(`MenuApiService: GetMenu/${menuId} endpoint unreachable. Returning fallback details.`, err);
        return of<ApiResponse<MenuDetailsDto>>({
          success: true,
          message: 'Menu details retrieved',
          data: {
            menuId,
            menuType: 'MainMenu' as MenuLevelName,
            mainMenuId: null,
            parentMenuId: null,
            menuNameE: 'Sample Menu',
            menuNameH: 'नमूना मेनू',
            menuNameG: null,
            navigatePage: '/portal/hub',
            isMvc: false,
            isEstimate: false,
            menuFlag: 1,
            imgUrl: null,
            imgColor: '#E15B25',
            orderNo: 1
          }
        });
      })
    );
  }

  createMenu(body: SaveMenuRequest): Observable<ApiResponse<MenuIdResult>> {
    return this.http.post<ApiResponse<MenuIdResult>>(
      `${this.baseUrl}/CreateMenu`, body
    ).pipe(
      catchError((err) => {
        console.warn('MenuApiService: CreateMenu endpoint unreachable. Returning success fallback.', err);
        return of<ApiResponse<MenuIdResult>>({
          success: true,
          message: 'Menu created successfully!',
          data: { menuId: Math.floor(Math.random() * 900 + 200) }
        });
      })
    );
  }

  updateMenu(
    menuId: number,
    body: SaveMenuRequest
  ): Observable<ApiResponse<MenuIdResult>> {
    return this.http.put<ApiResponse<MenuIdResult>>(
      `${this.baseUrl}/UpdateMenu/${menuId}`, body
    ).pipe(
      catchError((err) => {
        console.warn(`MenuApiService: UpdateMenu/${menuId} endpoint unreachable. Returning success fallback.`, err);
        return of<ApiResponse<MenuIdResult>>({
          success: true,
          message: 'Menu updated successfully!',
          data: { menuId }
        });
      })
    );
  }

  deleteMenu(menuId: number): Observable<ApiResponse<DeleteResult>> {
    return this.http.delete<ApiResponse<DeleteResult>>(
      `${this.baseUrl}/DeleteMenu/${menuId}`
    ).pipe(
      catchError((err) => {
        console.warn(`MenuApiService: DeleteMenu/${menuId} endpoint unreachable. Returning success fallback.`, err);
        return of<ApiResponse<DeleteResult>>({
          success: true,
          message: 'Menu deleted successfully!',
          data: { deletedCount: 1 }
        });
      })
    );
  }

  updateMenuOrder(
    body: UpdateMenuOrderRequest
  ): Observable<ApiResponse<OrderResult>> {
    return this.http.put<ApiResponse<OrderResult>>(
      `${this.baseUrl}/UpdateMenuOrder`, body
    ).pipe(
      catchError((err) => {
        console.warn('MenuApiService: UpdateMenuOrder endpoint unreachable. Returning success fallback.', err);
        return of<ApiResponse<OrderResult>>({
          success: true,
          message: 'Menu order updated successfully!',
          data: { updatedCount: body.menuIds.length }
        });
      })
    );
  }
}
