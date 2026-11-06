# Proposed Works API – Angular Integration Guide

Base URL:

```text
/api/IwmsWeb
```

All endpoints require the internal JWT:

```http
Authorization: Bearer {token}
```

The token must contain:

```text
TokenType = Internal
UserId
DistrictCode
UserType
```

Do not send `CreatedBy`, `UpdatedBy`, login type, or audit dates. The API gets them from the token.

## 1. Master and location endpoints

| Method | URL | Parameters |
|---|---|---|
| GET | `/api/IwmsWeb/Master/GetFinancialYears` | None |
| GET | `/api/IwmsWeb/Master/GetCampaignSchemes` | None |
| GET | `/api/IwmsWeb/Master/GetWorkCategories` | Optional `campaignSchemeId` |
| GET | `/api/IwmsWeb/Master/GetWorkSubCategories` | Required `sector`; optional `campaignSchemeId` |
| GET | `/api/IwmsWeb/Master/GetDistricts` | None |
| GET | `/api/IwmsWeb/Master/GetBlocks` | Required `districtCode` |
| GET | `/api/IwmsWeb/Master/GetPanchayats` | Required `districtCode`; one or more `blockCodes` |
| GET | `/api/IwmsWeb/Master/GetVillages` | Required `districtCode`, `blockCode`; one or more `panchayatCodes` |
| GET | `/api/IwmsWeb/Master/GetTowns` | Required `districtCode` |
| GET | `/api/IwmsWeb/Master/GetAgencies` | None |
| GET | `/api/IwmsWeb/Master/GetSubAgencies` | Required `agencyId`; optional `districtCode` |
| GET | `/api/IwmsWeb/Master/GetAssemblies` | Optional `districtCode` |
| GET | `/api/IwmsWeb/Master/GetMlaList` | Required `assembly`; optional `districtCode` |
| GET | `/api/IwmsWeb/Master/GetMembersOfParliament` | Optional `parliamentNumber`, `districtCode` |
| GET | `/api/IwmsWeb/Master/GetConvergenceSchemes` | Optional `masterSchemeCode` |
| GET | `/api/IwmsWeb/Master/GetSchemes` | Required `districtCode`, `finYear`, `schemeDepartment`; optional filters below |

Multiple block or panchayat codes can be sent as repeated query parameters:

```text
/api/IwmsWeb/Master/GetPanchayats?districtCode=12&blockCodes=0101&blockCodes=0102
```

or comma separated:

```text
/api/IwmsWeb/Master/GetPanchayats?districtCode=12&blockCodes=0101,0102
```

Scheme request example:

```text
/api/IwmsWeb/Master/GetSchemes?districtCode=12&finYear=2026-27&schemeDepartment=01&shreeOnly=false&previousYearOnly=false&constCode=001&assemblyNo=16
```

`GetSchemes` returns `availableAmount`. Angular should display it, but the API also checks it while saving.

## 2. Proposed work endpoints

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/IwmsWeb/ProposedWorks/GetList` | Paginated work list |
| GET | `/api/IwmsWeb/ProposedWorks/GetById?workId=...` | Work with locations and schemes |
| POST | `/api/IwmsWeb/ProposedWorks/Create` | Create work using `multipart/form-data` |
| PUT | `/api/IwmsWeb/ProposedWorks/Update?workId=...` | Update unsanctioned work |
| DELETE | `/api/IwmsWeb/ProposedWorks/Delete?workId=...` | Soft-delete unsanctioned work |
| GET | `/api/IwmsWeb/ProposedWorks/GetAdminSanction?workId=...` | Existing administrative-sanction allocation |
| POST | `/api/IwmsWeb/ProposedWorks/SaveAdminSanction?workId=...` | Save administrative-sanction allocation |
| GET | `/api/IwmsWeb/ProposedWorks/DownloadRecommendation?workId=...` | Authorized PDF download |
| GET | `/api/IwmsWeb/ProposedWorks/DownloadRevenueRecord?workId=...` | Authorized PDF download |

Because `workId` contains `/`, always send it as a query parameter through Angular `HttpParams`.

List parameters:

```text
districtCode  optional; API still enforces token access
finYear       optional, e.g. 2026-27
search        optional work ID/name/recommendation number
page          default 1
pageSize      default 25, maximum 100
```

## 3. Create/update request

`Create` and `Update` use `multipart/form-data` so JSON and PDFs can be saved together.

Form fields:

| Field | Required | Description |
|---|---:|---|
| `Data` | Yes | JSON string shown below |
| `RecommendationPdf` | For scheme 9 or 10 | Valid PDF, maximum 3 MB |
| `RevenueRecordPdf` | No | Valid PDF, maximum 3 MB |

Example `Data` JSON for rural village work:

```json
{
  "districtCode": "12",
  "finYear": "2026-27",
  "sector": "R",
  "workType": "N",
  "schemeDepartment": "01",
  "workCategory": "01",
  "workSubCategory": 25,
  "workName": "Construction of community hall",
  "workApprovalNumber": "MLA/2026/101",
  "workApprovalDate": "2026-10-15",
  "workReceiptDate": "2026-10-20",
  "agencyId": 5,
  "subAgencyId": 12,
  "expectedTimeMonths": 6,
  "workTo": "V",
  "beneficiaryGroup": "G",
  "beneficiarySc": true,
  "beneficiarySt": false,
  "beneficiaryObc": false,
  "beneficiaryGeneral": true,
  "beneficiarySbc": false,
  "beneficiaryOther": false,
  "beneficiaryMinority": false,
  "beneficiaryBpl": true,
  "beneficiaryApl": false,
  "beneficiaryState": false,
  "isHandicapped": "N",
  "sex": null,
  "assemblyNumber": 16,
  "constituencyCode": "001",
  "mlaName": "Sh. MLA Name",
  "parliamentCode": null,
  "parliamentNumber": null,
  "parliamentHouse": null,
  "mpName": null,
  "recommendedBy": "Hon. MLA",
  "remarks": "Priority work",
  "campaignSchemeId": null,
  "isShreeScheme": false,
  "priority": 1,
  "isConvergence": true,
  "isAnnualWorkPlan": true,
  "isChecklistConfirmed": true,
  "signatoryName": "Authorized Officer",
  "signatoryDesignation": "Executive Engineer",
  "sourcePlanId": null,
  "mlaRecommendationId": null,
  "otp": null,
  "locations": [
    {
      "blockCode": "0101",
      "panchayatCode": "0001",
      "villageCode": "00000001",
      "townCode": null,
      "wardCode": null
    }
  ],
  "schemes": [
    {
      "schemeCode": 9,
      "amount": 10.5,
      "ownFundRelease": 0,
      "publicContribution": 0
    }
  ],
  "convergenceSchemes": [
    {
      "convergenceSchemeCode": 15,
      "amount": 2.5
    }
  ]
}
```

For `UserType = 6`, `otp` is required. It must have been generated for event `MLA_work_proposal`; the API accepts only the latest OTP created during the previous 10 minutes and consumes it after a successful match.

Location rules:

| Sector | `workTo` | Required location fields |
|---|---|---|
| Rural | `B` | `blockCode` |
| Rural | `P` | `blockCode`, `panchayatCode` |
| Rural | `V` | `blockCode`, `panchayatCode`, `villageCode` |
| Urban | `T` | `townCode`; `wardCode` optional |

Scheme amounts are expressed using the same unit as the existing e-Work scheme/fund tables and must be greater than `0` and not more than `9999`.

## 4. Angular service example

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProposedWorksApiService {
  private readonly baseUrl = '/api/IwmsWeb';

  constructor(private http: HttpClient) {}

  getBlocks(districtCode: string) {
    return this.http.get(`${this.baseUrl}/Master/GetBlocks`, {
      params: { districtCode }
    });
  }

  getPanchayats(districtCode: string, blockCodes: string[]) {
    let params = new HttpParams().set('districtCode', districtCode);
    blockCodes.forEach(code => params = params.append('blockCodes', code));
    return this.http.get(`${this.baseUrl}/Master/GetPanchayats`, { params });
  }

  create(
    request: unknown,
    recommendationPdf?: File,
    revenueRecordPdf?: File
  ) {
    const form = new FormData();
    form.append('Data', JSON.stringify(request));

    if (recommendationPdf) {
      form.append('RecommendationPdf', recommendationPdf);
    }
    if (revenueRecordPdf) {
      form.append('RevenueRecordPdf', revenueRecordPdf);
    }

    return this.http.post(
      `${this.baseUrl}/ProposedWorks/Create`,
      form
    );
  }

  update(
    workId: string,
    request: unknown,
    recommendationPdf?: File,
    revenueRecordPdf?: File
  ) {
    const form = new FormData();
    form.append('Data', JSON.stringify(request));
    if (recommendationPdf) form.append('RecommendationPdf', recommendationPdf);
    if (revenueRecordPdf) form.append('RevenueRecordPdf', revenueRecordPdf);

    const params = new HttpParams().set('workId', workId);
    return this.http.put(
      `${this.baseUrl}/ProposedWorks/Update`,
      form,
      { params }
    );
  }

  getById(workId: string) {
    const params = new HttpParams().set('workId', workId);
    return this.http.get(
      `${this.baseUrl}/ProposedWorks/GetById`,
      { params }
    );
  }

  delete(workId: string) {
    const params = new HttpParams().set('workId', workId);
    return this.http.delete(
      `${this.baseUrl}/ProposedWorks/Delete`,
      { params }
    );
  }
}
```

Do not manually set `Content-Type` for `FormData`; the browser must add the multipart boundary.

The existing JWT interceptor should add the bearer token.

## 5. Administrative-sanction request

```http
POST /api/IwmsWeb/ProposedWorks/SaveAdminSanction?workId=2026-27%2F12345
Content-Type: application/json
```

```json
{
  "planStatus": "Y",
  "agencyId": 5,
  "subAgencyId": 12,
  "expectedTimeMonths": 6,
  "referenceNumber": 101,
  "landTitleClear": true,
  "materialType": "N",
  "schemes": [
    {
      "schemeCode": 9,
      "amount": 10.5,
      "ownFundRelease": 0,
      "publicContribution": 0
    }
  ],
  "convergenceSchemes": [
    {
      "convergenceSchemeCode": 15,
      "amount": 2.5
    }
  ]
}
```

Material types:

```text
N = Nirman material
K = Kraya material
```

Angular cannot declare a GRN verified. For an e-payment-enabled scheme with public contribution, the API checks `GrnDetails` itself.

## 6. Success and validation responses

Success:

```json
{
  "success": true,
  "message": "Proposed work created successfully.",
  "data": {
    "proposalId": 12345,
    "workId": "2026-27/12345"
  }
}
```

Validation failure:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "WorkReceiptDate": [
      "Receipt date cannot be earlier than approval date."
    ],
    "Schemes[9].Amount": [
      "Amount cannot exceed the available fund (10.5)."
    ]
  }
}
```

Recommended Angular handling:

- `400`: display field validation errors;
- `401`: token missing/expired;
- `403`: district/role not permitted;
- `404`: work or file not found;
- `409`: duplicate/conflicting data or sanction already started;
- `500`: show a generic message and log the server trace ID.

