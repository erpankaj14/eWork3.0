import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    );
  }

  getMenuFlags(): Observable<ApiListResponse<MenuFlagDto>> {
    return this.http.get<ApiListResponse<MenuFlagDto>>(
      `${this.baseUrl}/GetMenuFlags`
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
    );
  }

  getMenu(menuId: number): Observable<ApiResponse<MenuDetailsDto>> {
    return this.http.get<ApiResponse<MenuDetailsDto>>(
      `${this.baseUrl}/GetMenu/${menuId}`
    );
  }

  createMenu(body: SaveMenuRequest): Observable<ApiResponse<MenuIdResult>> {
    return this.http.post<ApiResponse<MenuIdResult>>(
      `${this.baseUrl}/CreateMenu`, body
    );
  }

  updateMenu(
    menuId: number,
    body: SaveMenuRequest
  ): Observable<ApiResponse<MenuIdResult>> {
    return this.http.put<ApiResponse<MenuIdResult>>(
      `${this.baseUrl}/UpdateMenu/${menuId}`, body
    );
  }

  deleteMenu(menuId: number): Observable<ApiResponse<DeleteResult>> {
    return this.http.delete<ApiResponse<DeleteResult>>(
      `${this.baseUrl}/DeleteMenu/${menuId}`
    );
  }

  updateMenuOrder(
    body: UpdateMenuOrderRequest
  ): Observable<ApiResponse<OrderResult>> {
    return this.http.put<ApiResponse<OrderResult>>(
      `${this.baseUrl}/UpdateMenuOrder`, body
    );
  }
}
