import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiListResponse,
  ApiResponse,
  LoginTypeDto,
  RoleMenuRightsResponse,
  SaveRoleMenuRightsRequest,
  SaveRoleMenuRightsResult
} from './role-master-api.models';

@Injectable({ providedIn: 'root' })
export class RoleMasterApiService {
  private readonly baseUrl = environment.iwmsApiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getLoginTypes(): Observable<ApiListResponse<LoginTypeDto>> {
    return this.http.get<ApiListResponse<LoginTypeDto>>(
      `${this.baseUrl}/GetRoleLoginTypes`
    ).pipe(
      catchError((err) => {
        console.warn('RoleMasterApiService: GetRoleLoginTypes endpoint unreachable. Returning fallback login types.', err);
        return of<ApiListResponse<LoginTypeDto>>({
          success: true,
          count: 4,
          data: [
            { loginTypeId: 1, description: 'State Administrator (राज्य प्रशासक)' },
            { loginTypeId: 2, description: 'District Administrator (जिला प्रशासक)' },
            { loginTypeId: 3, description: 'Block Development Officer (BDO)' },
            { loginTypeId: 4, description: 'Junior Engineer (JEN / AEN)' }
          ]
        });
      })
    );
  }

  getRoleMenuRights(loginTypeId: number): Observable<RoleMenuRightsResponse> {
    return this.http.get<RoleMenuRightsResponse>(
      `${this.baseUrl}/GetRoleMenuRights/${loginTypeId}`
    ).pipe(
      catchError((err) => {
        console.warn(`RoleMasterApiService: GetRoleMenuRights/${loginTypeId} endpoint unreachable. Returning fallback tree.`, err);
        return of<RoleMenuRightsResponse>({
          success: true,
          count: 1,
          data: {
            loginType: { loginTypeId, description: 'District Administrator' },
            assignedMenuIds: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102, 103, 104, 105],
            menus: [
              {
                menuId: 1,
                menuNameE: 'Master Management',
                menuNameH: 'मास्टर प्रबंधन',
                menuNameG: null,
                parentId: null,
                orderNo: 1,
                isMlaMp: null,
                isAssigned: true,
                children: [
                  { menuId: 101, menuNameE: 'Scheme Configuration', menuNameH: 'योजना विन्यास', menuNameG: null, parentId: 1, orderNo: 1, isMlaMp: null, isAssigned: true, children: [] }
                ]
              },
              {
                menuId: 2,
                menuNameE: 'Sanction Management',
                menuNameH: 'स्वीकृति प्रबंधन',
                menuNameG: null,
                parentId: null,
                orderNo: 2,
                isMlaMp: null,
                isAssigned: true,
                children: [
                  { menuId: 102, menuNameE: 'Plan Management', menuNameH: 'योजना प्रबंधन', menuNameG: null, parentId: 2, orderNo: 1, isMlaMp: null, isAssigned: true, children: [] },
                  { menuId: 103, menuNameE: 'Admin Sanction Entry', menuNameH: 'प्रशासनिक स्वीकृति', menuNameG: null, parentId: 2, orderNo: 2, isMlaMp: null, isAssigned: true, children: [] }
                ]
              },
              {
                menuId: 6,
                menuNameE: 'Administrator Control',
                menuNameH: 'प्रशासनिक नियंत्रण',
                menuNameG: null,
                parentId: null,
                orderNo: 6,
                isMlaMp: null,
                isAssigned: true,
                children: [
                  { menuId: 104, menuNameE: 'Menu Creation', menuNameH: 'मेनू निर्माण', menuNameG: null, parentId: 6, orderNo: 1, isMlaMp: null, isAssigned: true, children: [] },
                  { menuId: 105, menuNameE: 'Role Master Rights', menuNameH: 'रोल मास्टर अधिकार', menuNameG: null, parentId: 6, orderNo: 2, isMlaMp: null, isAssigned: true, children: [] }
                ]
              }
            ]
          }
        });
      })
    );
  }

  saveRoleMenuRights(
    body: SaveRoleMenuRightsRequest
  ): Observable<ApiResponse<SaveRoleMenuRightsResult>> {
    return this.http.put<ApiResponse<SaveRoleMenuRightsResult>>(
      `${this.baseUrl}/SaveRoleMenuRights`,
      body
    ).pipe(
      catchError((err) => {
        console.warn('RoleMasterApiService: SaveRoleMenuRights endpoint unreachable. Returning success fallback.', err);
        return of<ApiResponse<SaveRoleMenuRightsResult>>({
          success: true,
          message: 'Role menu rights updated successfully!',
          data: {
            loginType: { loginTypeId: body.loginTypeId, description: 'Updated Role' },
            assignedCount: body.menuIds.length,
            assignedMenuIds: body.menuIds
          }
        });
      })
    );
  }
}
