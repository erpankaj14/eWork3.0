import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private get baseUrl(): string {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiHost = isLocalhost ? '/iwmsapi' : 'http://10.130.3.10/iwmsapi';
    return `${apiHost}/api/IwmsWeb`;
  }

  constructor(private readonly http: HttpClient) {}

  getLoginTypes(): Observable<ApiListResponse<LoginTypeDto>> {
    return this.http.get<ApiListResponse<LoginTypeDto>>(
      `${this.baseUrl}/GetRoleLoginTypes`
    );
  }

  getRoleMenuRights(loginTypeId: number): Observable<RoleMenuRightsResponse> {
    return this.http.get<RoleMenuRightsResponse>(
      `${this.baseUrl}/GetRoleMenuRights/${loginTypeId}`
    );
  }

  saveRoleMenuRights(
    body: SaveRoleMenuRightsRequest
  ): Observable<ApiResponse<SaveRoleMenuRightsResult>> {
    return this.http.put<ApiResponse<SaveRoleMenuRightsResult>>(
      `${this.baseUrl}/SaveRoleMenuRights`,
      body
    );
  }
}
