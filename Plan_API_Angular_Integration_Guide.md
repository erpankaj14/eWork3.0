# Plan API – Angular Integration Guide

## 1. API location and authentication

The Plan API is hosted by the **RdWeb** project.

```text
Base route: {RDWEB_BASE_URL}/api/IwmsWeb
```

Example development configuration:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  rdWebApiBaseUrl: 'https://localhost:<rdweb-port>/api/IwmsWeb'
};
```

Every request requires the JWT issued by `iwms_api`:

```http
Authorization: Bearer <access-token>
```

Required token claims:

| Claim | Use |
|---|---|
| `TokenType = Internal` | Required by the RdWeb `Api` authorization policy |
| `UserId` | Audit fields such as CreatedBy and UpdatedBy |
| `DistrictCode` | District access restriction; `0` represents a state-level user |

The API controller should use:

```csharp
[Authorize(Policy = "Api")]
[IgnoreAntiforgeryToken]
[ApiController]
[Route("api/IwmsWeb")]
```

No antiforgery/XSRF token is required for these bearer-token APIs.

## 2. Endpoint summary

| # | Method | Route | Request format | Purpose |
|---:|---|---|---|---|
| 1 | POST | `/GetWorkListofPlan` | JSON `mdlPlan` | Get plan list using filters |
| 2 | POST | `/SavePlanDetails` | JSON `mdlPlan` | Create or update a plan |
| 3 | GET | `/DownloadPdfPlan` | Query parameters | Download authenticated district's PDF |
| 4 | GET | `/ViewDownloadPdfPlan` | Query parameters | View/download a district plan PDF |
| 5 | GET | `/DownloadPdfPlanState` | Query parameters | Download the state-approved PDF |
| 6 | POST | `/SavePlanFileandForward` | `multipart/form-data` | Upload district PDF and forward to state |
| 7 | POST | `/ApprovePlanandUploadFile` | `multipart/form-data` | State approval of one plan with PDF |
| 8 | POST | `/ApprovePlanandUploadFileMultiple` | `multipart/form-data` | State approval of multiple plans with one PDF |
| 9 | POST | `/RejectPlan` | JSON `mdlPlanFile` | Reject a plan; state user only |
| 10 | POST | `/RevertPlan` | JSON `mdlPlanFile` | Revert a plan |
| 11 | GET | `/BudgetTypeList` | None | Get budget-type master data |
| 12 | POST | `/GetApprovedPlanListOfWork` | JSON `mdlPlan` | Get approved plan/work list |

## 3. Shared Angular types

The API uses the existing RdWeb `mdlPlan`, `mdlPlanFile`, `SelectedPlan`, and
`MstPlanBudgetType` models. Copy the complete properties from those C# models
into the Angular interfaces. The following minimum interface is sufficient for
the API service and can be extended with the remaining model fields.

```typescript
// src/app/core/models/plan-api.models.ts

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
  finYr?: string;
  districtCode?: string;
  dlcApprovalDate1?: string;
  blockApprovalDate1?: string;
  slcApprovalDate1?: string;
  [key: string]: unknown;
}

export interface PlanFileModel {
  schemeCode?: number;
  finYr?: string;
  districtCode?: string;
  [key: string]: unknown;
}

export interface SelectedPlan {
  [key: string]: unknown;
}

export interface BudgetType {
  id?: number;
  [key: string]: unknown;
}

export type MultipartField = string | number | boolean | null | undefined;
```

## 4. JWT interceptor

Register one interceptor so every call automatically sends the token.

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};
```

Register it in the application configuration:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

Use the application's secure token-storage service in place of
`localStorage` when one already exists.

## 5. Angular Plan API service

```typescript
// src/app/core/services/plan-api.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiListResponse,
  ApiResponse,
  BudgetType,
  MessageResponse,
  MultipartField,
  PlanFileModel,
  PlanModel,
  SelectedPlan
} from '../models/plan-api.models';

@Injectable({ providedIn: 'root' })
export class PlanApiService {
  private readonly baseUrl = environment.rdWebApiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getWorkListOfPlan(
    filter: PlanModel
  ): Observable<ApiListResponse<PlanModel>> {
    return this.http.post<ApiListResponse<PlanModel>>(
      `${this.baseUrl}/GetWorkListofPlan`,
      filter
    );
  }

  savePlanDetails(
    plan: PlanModel
  ): Observable<ApiResponse<PlanModel>> {
    return this.http.post<ApiResponse<PlanModel>>(
      `${this.baseUrl}/SavePlanDetails`,
      plan
    );
  }

  downloadPdfPlan(
    finYear: string,
    schemeCode: number
  ): Observable<HttpResponse<Blob>> {
    const params = new HttpParams()
      .set('finYear', finYear)
      .set('schemeCode', schemeCode);

    return this.http.get(`${this.baseUrl}/DownloadPdfPlan`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  viewDownloadPdfPlan(
    districtCode: string,
    finYear: string,
    schemeCode: number
  ): Observable<HttpResponse<Blob>> {
    const params = new HttpParams()
      .set('districtCode', districtCode)
      .set('finYear', finYear)
      .set('schemeCode', schemeCode);

    return this.http.get(`${this.baseUrl}/ViewDownloadPdfPlan`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  downloadPdfPlanState(
    districtCode: string,
    finYear: string,
    schemeCode: number
  ): Observable<HttpResponse<Blob>> {
    const params = new HttpParams()
      .set('districtCode', districtCode)
      .set('finYear', finYear)
      .set('schemeCode', schemeCode);

    return this.http.get(`${this.baseUrl}/DownloadPdfPlanState`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  savePlanFileAndForward(
    file: File,
    fields: Record<string, MultipartField>
  ): Observable<ApiResponse<{
    schemeCode: number;
    finYr: string;
    districtCode: string;
  }>> {
    const formData = this.createPlanFormData(file, fields);

    return this.http.post<ApiResponse<{
      schemeCode: number;
      finYr: string;
      districtCode: string;
    }>>(
      `${this.baseUrl}/SavePlanFileandForward`,
      formData
    );
  }

  approvePlanAndUploadFile(
    file: File,
    fields: Record<string, MultipartField>
  ): Observable<ApiResponse<{
    schemeCode: number;
    finYr: string;
    districtCode: string;
  }>> {
    const formData = this.createPlanFormData(file, fields);

    return this.http.post<ApiResponse<{
      schemeCode: number;
      finYr: string;
      districtCode: string;
    }>>(
      `${this.baseUrl}/ApprovePlanandUploadFile`,
      formData
    );
  }

  approvePlanAndUploadFileMultiple(
    file: File,
    selectedPlans: SelectedPlan[]
  ): Observable<MessageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('plans', JSON.stringify(selectedPlans));

    return this.http.post<MessageResponse>(
      `${this.baseUrl}/ApprovePlanandUploadFileMultiple`,
      formData
    );
  }

  rejectPlan(
    model: PlanFileModel
  ): Observable<ApiResponse<PlanFileModel>> {
    return this.http.post<ApiResponse<PlanFileModel>>(
      `${this.baseUrl}/RejectPlan`,
      model
    );
  }

  revertPlan(
    model: PlanFileModel
  ): Observable<ApiResponse<PlanFileModel>> {
    return this.http.post<ApiResponse<PlanFileModel>>(
      `${this.baseUrl}/RevertPlan`,
      model
    );
  }

  getBudgetTypeList(): Observable<ApiListResponse<BudgetType>> {
    return this.http.get<ApiListResponse<BudgetType>>(
      `${this.baseUrl}/BudgetTypeList`
    );
  }

  getApprovedPlanListOfWork(
    filter: PlanModel
  ): Observable<ApiListResponse<PlanModel>> {
    return this.http.post<ApiListResponse<PlanModel>>(
      `${this.baseUrl}/GetApprovedPlanListOfWork`,
      filter
    );
  }

  private createPlanFormData(
    file: File,
    fields: Record<string, MultipartField>
  ): FormData {
    const formData = new FormData();
    formData.append('file', file, file.name);

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    return formData;
  }
}
```

Do not manually set `Content-Type: multipart/form-data`. The browser must add
the multipart boundary automatically.

## 6. Method usage examples

### Load a district plan list

```typescript
this.planApi.getWorkListOfPlan({
  schemeCode: 5,
  finYr: '2026-27'
}).subscribe(response => {
  this.plans = response.data;
});
```

A district user's `DistrictCode` is taken from the token. A state user
(`DistrictCode = 0`) can send a specific `districtCode` in the request.

### Create a plan

For a district plan, both date strings are required:

```typescript
this.planApi.savePlanDetails({
  id: 0,
  schemeCode: 5,
  finYr: '2026-27',
  dlcApprovalDate1: '16/09/2026',
  blockApprovalDate1: '16/09/2026'
}).subscribe(response => {
  console.log(response.message);
});
```

For a state plan, `slcApprovalDate1` is required. For an update, send `id > 0`.
The API overwrites audit fields and district ownership using token claims.

### Forward a district plan with a PDF

```typescript
this.planApi.savePlanFileAndForward(this.selectedPdf, {
  SchemeCode: 5,
  FinYr: '2026-27'
}).subscribe(response => {
  console.log(response.message);
});
```

### Approve one plan at state level

```typescript
this.planApi.approvePlanAndUploadFile(this.selectedPdf, {
  SchemeCode: 5,
  FinYr: '2026-27',
  DistrictCode: '101'
}).subscribe(response => {
  console.log(response.message);
});
```

### Approve multiple plans at state level

```typescript
this.planApi.approvePlanAndUploadFileMultiple(
  this.selectedPdf,
  this.selectedPlans
).subscribe(response => {
  console.log(response.message, response.count);
});
```

The PDF must be at most 5 MB and must be a valid PDF. The multipart field
names must be exactly `file` and `plans` for the multiple-plan method.

### Download and open a PDF

```typescript
this.planApi.downloadPdfPlan('2026-27', 5)
  .subscribe(response => {
    const blob = response.body;

    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  });
```

## 7. Access restrictions

| Operation | Access rule |
|---|---|
| List/create/update | Authenticated internal user; district is controlled by token |
| Download own district PDF | Authenticated district user |
| View a specified district PDF | Same district or state-level user |
| Download state PDF | Same district or state-level user |
| Forward district PDF | Authenticated user; ownership comes from token |
| Approve one or multiple plans | State-level user (`DistrictCode = 0`) |
| Reject plan | State-level user (`DistrictCode = 0`) |
| Revert plan | Authenticated internal user |
| Budget type list | Authenticated internal user |
| Approved plan/work list | Authenticated internal user |

## 8. HTTP error handling

| Status | Meaning |
|---:|---|
| `400` | Invalid request, missing required date, invalid PDF or missing SSO ID |
| `401` | Token missing/expired/invalid or required claim missing |
| `403` | Wrong district, non-state user attempting a state operation, or wrong TokenType |
| `404` | Requested PDF or plan was not found |
| `413` | Uploaded request exceeds the configured request-size limit |
| `500` | Server configuration or unexpected server error |

Example component error handling:

```typescript
import { HttpErrorResponse } from '@angular/common/http';

function getApiErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (error.status === 403) {
    return 'You are not authorized to perform this operation.';
  }

  return error.error?.message ?? 'Unable to complete the request.';
}
```

## 9. Frontend checklist

- Set `rdWebApiBaseUrl` to the RdWeb host, not the `iwms_api` host.
- Register the JWT interceptor once.
- Do not send `CreatedBy`, `UpdatedBy`, or district ownership as trusted values.
- Send dates in `dd/MM/yyyy` format because the current API parses them using `fr-FR` culture.
- Use `responseType: 'blob'` for PDF endpoints.
- Use `FormData` for file-upload endpoints.
- Do not manually set the multipart `Content-Type` header.
- Display the API's `message` value for business results and validation failures.
- Replace the minimum TypeScript interfaces with the complete C# model fields before final UI binding.

