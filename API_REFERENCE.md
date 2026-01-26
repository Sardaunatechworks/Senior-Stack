# Crime Tracking System - API Reference

## Complete REST API Documentation

**API Version:** 1.0.0  
**Base URL:** `http://localhost:5000` (development) | `https://yourdomain.com` (production)  
**Authentication:** Session-based (HttpOnly Cookie)

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Report Endpoints](#report-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Error Codes](#error-codes)
5. [Request/Response Examples](#requestresponse-examples)

---

## Authentication Endpoints

### Register New User

**Endpoint:** `POST /api/register`

**Description:** Create a new user account with initial role assignment.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "reporter"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `username` | string | Yes | 3-50 chars, alphanumeric, unique |
| `email` | string | Yes | Valid email format, unique |
| `password` | string | Yes | Minimum 8 characters |
| `role` | string | Yes | `"reporter"` or `"admin"` |

**Response (201 Created):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T10:00:00.000Z"
}
```

**Error Responses:**

| Status | Message                 | Cause                                |
| ------ | ----------------------- | ------------------------------------ |
| 400    | Username already exists | Duplicate username                   |
| 400    | Email already exists    | Duplicate email                      |
| 400    | Invalid email format    | Malformed email                      |
| 400    | Password too short      | Less than 8 characters               |
| 400    | Missing required field  | Missing username/email/password/role |
| 500    | Internal server error   | Database or server error             |

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "reporter"
  }'
```

---

### Login User

**Endpoint:** `POST /api/login`

**Description:** Authenticate user and establish session.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Request Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `username` | string | Yes |
| `password` | string | Yes |

**Response (200 OK):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T10:00:00.000Z"
}
```

**Response Headers:**

```
Set-Cookie: sid=eyJzZXNzaW9uSWQiOiI...; Path=/; HttpOnly; Max-Age=2592000
```

**Session Details:**

- **Cookie Name:** `sid` (session identifier)
- **Max Age:** 2592000 seconds (30 days)
- **HttpOnly:** Yes (not accessible via JavaScript)
- **Secure:** Yes (HTTPS only in production)

**Error Responses:**

| Status | Message                      | Cause                      |
| ------ | ---------------------------- | -------------------------- |
| 401    | Incorrect credentials        | Wrong username or password |
| 400    | Missing username or password | Incomplete request         |
| 500    | Internal server error        | Server error               |

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

---

### Get Current User

**Endpoint:** `GET /api/user`

**Description:** Retrieve authenticated user information.

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
```

**Response (200 OK):**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T10:00:00.000Z"
}
```

**Error Responses:**

| Status | Message               | Cause            |
| ------ | --------------------- | ---------------- |
| 401    | Not authenticated     | No valid session |
| 401    | Session expired       | Cookie expired   |
| 500    | Internal server error | Server error     |

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/user \
  -H "Cookie: sid=eyJzZXNzaW9uSWQiOiI..." \
  -b cookies.txt
```

---

### Logout User

**Endpoint:** `GET /api/logout`

**Description:** Destroy user session and clear authentication.

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

**Response Headers:**

```
Set-Cookie: sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

**Effects:**

- Session deleted from database
- Cookie cleared on client
- User no longer authenticated

**Error Responses:**

| Status | Message               | Cause        |
| ------ | --------------------- | ------------ |
| 500    | Internal server error | Server error |

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## Report Endpoints

### List Reports

**Endpoint:** `GET /api/reports`

**Description:** Retrieve list of crime reports (filtered based on user role).

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Optional | Allowed Values |
|-----------|------|----------|----------------|
| `status` | string | Yes | `pending`, `reviewed`, `closed` |
| `category` | string | Yes | Any crime category |

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "title": "Car Theft",
    "description": "Red Honda Civic stolen from parking lot on Main Street",
    "category": "theft",
    "location": "Main Street, Downtown",
    "status": "pending",
    "reporterId": 2,
    "createdAt": "2026-01-24T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Vandalism",
    "description": "Graffiti on park wall",
    "category": "vandalism",
    "location": "Central Park",
    "status": "reviewed",
    "reporterId": 3,
    "createdAt": "2026-01-24T11:00:00.000Z"
  }
]
```

**Authorization:**

- **Reporters:** See only their own reports (filtered automatically)
- **Admins:** See all reports

**Error Responses:**

| Status | Message               | Cause                    |
| ------ | --------------------- | ------------------------ |
| 401    | Not authenticated     | No valid session         |
| 403    | Forbidden             | Insufficient permissions |
| 500    | Internal server error | Server error             |

**cURL Examples:**

```bash
# Get all reports
curl -X GET http://localhost:5000/api/reports \
  -b cookies.txt

# Filter by status
curl -X GET "http://localhost:5000/api/reports?status=pending" \
  -b cookies.txt

# Filter by category
curl -X GET "http://localhost:5000/api/reports?category=theft" \
  -b cookies.txt

# Multiple filters
curl -X GET "http://localhost:5000/api/reports?status=pending&category=theft" \
  -b cookies.txt
```

---

### Get Report Details

**Endpoint:** `GET /api/reports/:id`

**Description:** Retrieve specific report by ID.

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Report ID |

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "Car Theft",
  "description": "Red Honda Civic stolen from parking lot on Main Street at approximately 2:30 PM on January 24th",
  "category": "theft",
  "location": "Main Street, Downtown",
  "status": "pending",
  "reporterId": 2,
  "createdAt": "2026-01-24T10:00:00.000Z"
}
```

**Authorization:**

- **Reporters:** Can only view own reports
- **Admins:** Can view any report

**Error Responses:**

| Status | Message               | Cause                             |
| ------ | --------------------- | --------------------------------- |
| 401    | Not authenticated     | No valid session                  |
| 403    | Forbidden             | Cannot access other user's report |
| 404    | Not found             | Report doesn't exist              |
| 500    | Internal server error | Server error                      |

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/reports/1 \
  -b cookies.txt
```

---

### Create Report

**Endpoint:** `POST /api/reports`

**Description:** Create new crime report (triggers admin notification email).

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Bicycle Theft",
  "description": "Blue mountain bike stolen from apartment building parking area. Brand: Trek, Model: Marlin 8",
  "category": "theft",
  "location": "Maple Street, Apt 204"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `title` | string | Yes | 3-255 characters |
| `description` | string | Yes | 10-2000 characters |
| `category` | string | Yes | Valid crime category |
| `location` | string | Yes | 2-255 characters |

**Response (201 Created):**

```json
{
  "id": 5,
  "title": "Bicycle Theft",
  "description": "Blue mountain bike stolen from apartment building parking area. Brand: Trek, Model: Marlin 8",
  "category": "theft",
  "location": "Maple Street, Apt 204",
  "status": "pending",
  "reporterId": 1,
  "createdAt": "2026-01-24T12:30:00.000Z"
}
```

**Side Effects:**

- Status automatically set to `"pending"`
- Report assigned to authenticated user
- Email notification sent to admin
- `createdAt` timestamp added

**Email Notification:**
The admin receives an HTML-formatted email with:

- Report title
- Description
- Category
- Location
- Submission timestamp

**Error Responses:**

| Status | Message                   | Cause                             |
| ------ | ------------------------- | --------------------------------- |
| 400    | Missing required field    | Incomplete request                |
| 400    | Title too short           | Less than 3 characters            |
| 400    | Description too short     | Less than 10 characters           |
| 400    | Invalid category          | Category not recognized           |
| 401    | Not authenticated         | No valid session                  |
| 500    | Internal server error     | Server error                      |
| 500    | Email notification failed | SMTP error (report still created) |

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Bicycle Theft",
    "description": "Blue mountain bike stolen from apartment building parking area. Brand: Trek, Model: Marlin 8",
    "category": "theft",
    "location": "Maple Street, Apt 204"
  }'
```

---

### Update Report Status (Admin Only)

**Endpoint:** `PUT /api/reports/:id/status`

**Description:** Update crime report status (admin only).

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
Content-Type: application/json
```

**URL Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer | Yes |

**Request Body:**

```json
{
  "status": "reviewed"
}
```

**Status Transitions:**

```
pending ──→ reviewed ──→ closed
         (optional)    (optional)
   ↓
  Any status can be set directly
```

**Valid Status Values:**

- `"pending"` - New report, not yet reviewed
- `"reviewed"` - Reviewed by admin
- `"closed"` - Investigation completed

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "Car Theft",
  "description": "Red Honda Civic stolen from parking lot on Main Street",
  "category": "theft",
  "location": "Main Street, Downtown",
  "status": "reviewed",
  "reporterId": 2,
  "createdAt": "2026-01-24T10:00:00.000Z"
}
```

**Authorization:**

- Only **admins** can update report status
- Reporters cannot modify reports

**Error Responses:**

| Status | Message                | Cause                      |
| ------ | ---------------------- | -------------------------- |
| 400    | Invalid status         | Status not in allowed list |
| 401    | Not authenticated      | No valid session           |
| 403    | Only admins can update | User is not admin          |
| 404    | Not found              | Report doesn't exist       |
| 500    | Internal server error  | Server error               |

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/reports/1/status \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status": "reviewed"}'
```

---

### Delete Report (Admin Only)

**Endpoint:** `DELETE /api/reports/:id`

**Description:** Delete crime report (admin only, permanent).

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
```

**URL Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer | Yes |

**Response (204 No Content):**

```
(Empty body)
```

**Authorization:**

- Only **admins** can delete reports
- Deletion is permanent and irreversible

**Error Responses:**

| Status | Message                | Cause                |
| ------ | ---------------------- | -------------------- |
| 401    | Not authenticated      | No valid session     |
| 403    | Only admins can delete | User is not admin    |
| 404    | Not found              | Report doesn't exist |
| 500    | Internal server error  | Server error         |

**cURL Example:**

```bash
curl -X DELETE http://localhost:5000/api/reports/1 \
  -b cookies.txt
```

---

## User Endpoints

### List All Users (Admin Only)

**Endpoint:** `GET /api/users`

**Description:** Retrieve all registered users (admin only).

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-01-24T09:00:00.000Z"
  },
  {
    "id": 2,
    "username": "john_reporter",
    "email": "john@example.com",
    "role": "reporter",
    "createdAt": "2026-01-24T10:00:00.000Z"
  }
]
```

**Authorization:**

- Only **admins** can view user list

**Error Responses:**

| Status | Message               | Cause             |
| ------ | --------------------- | ----------------- |
| 401    | Not authenticated     | No valid session  |
| 403    | Forbidden             | User is not admin |
| 500    | Internal server error | Server error      |

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/users \
  -b cookies.txt
```

---

### Update User Password (Admin Only)

**Endpoint:** `PUT /api/users/:id/password`

**Description:** Update user password (admin only).

**Request Headers:**

```
Cookie: sid=eyJzZXNzaW9uSWQiOiI...
Content-Type: application/json
```

**URL Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer | Yes |

**Request Body:**

```json
{
  "newPassword": "NewSecurePassword123!"
}
```

**Request Parameters:**
| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `newPassword` | string | Yes | Minimum 8 characters |

**Response (200 OK):**

```json
{
  "id": 2,
  "username": "john_reporter",
  "email": "john@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T10:00:00.000Z",
  "message": "Password updated successfully"
}
```

**Authorization:**

- Only **admins** can update user passwords

**Error Responses:**

| Status | Message               | Cause                  |
| ------ | --------------------- | ---------------------- |
| 400    | Password too short    | Less than 8 characters |
| 401    | Not authenticated     | No valid session       |
| 403    | Forbidden             | User is not admin      |
| 404    | Not found             | User doesn't exist     |
| 500    | Internal server error | Server error           |

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/users/2/password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"newPassword": "NewSecurePassword123!"}'
```

---

## Error Codes

### HTTP Status Codes

| Code | Name                  | Description                              |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Request successful                       |
| 201  | Created               | Resource created successfully            |
| 204  | No Content            | Successful delete operation              |
| 400  | Bad Request           | Invalid request data or validation error |
| 401  | Unauthorized          | Not authenticated or session expired     |
| 403  | Forbidden             | Authenticated but lacks permission       |
| 404  | Not Found             | Resource doesn't exist                   |
| 500  | Internal Server Error | Server-side error                        |

### Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description",
  "status": 400,
  "field": "fieldName" // Optional, for validation errors
}
```

**Common Error Scenarios:**

#### Missing Authentication

```json
{
  "message": "Not authenticated",
  "status": 401
}
```

#### Missing Required Fields

```json
{
  "message": "Missing required field: username",
  "status": 400,
  "field": "username"
}
```

#### Duplicate Username

```json
{
  "message": "Username already exists",
  "status": 400
}
```

#### Access Denied

```json
{
  "message": "Forbidden: Only admins can perform this action",
  "status": 403
}
```

#### Resource Not Found

```json
{
  "message": "Report not found",
  "status": 404
}
```

---

## Request/Response Examples

### Complete Authentication Flow

#### Step 1: Register

```bash
$ curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_smith",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "role": "reporter"
  }'

← 201 Created
{
  "id": 4,
  "username": "jane_smith",
  "email": "jane@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T14:30:00.000Z"
}
```

#### Step 2: Login

```bash
$ curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "jane_smith",
    "password": "SecurePass123!"
  }'

← 200 OK
{
  "id": 4,
  "username": "jane_smith",
  "email": "jane@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T14:30:00.000Z"
}

← Set-Cookie: sid=abc123xyz...; Path=/; HttpOnly; Max-Age=2592000
```

#### Step 3: Create Report

```bash
$ curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Purse Stolen",
    "description": "Black leather purse stolen from coffee shop while unattended for 5 minutes",
    "category": "theft",
    "location": "Downtown Coffee House"
  }'

← 201 Created
{
  "id": 10,
  "title": "Purse Stolen",
  "description": "Black leather purse stolen from coffee shop while unattended for 5 minutes",
  "category": "theft",
  "location": "Downtown Coffee House",
  "status": "pending",
  "reporterId": 4,
  "createdAt": "2026-01-24T14:35:00.000Z"
}

(Email sent to admin)
```

#### Step 4: View Reports

```bash
$ curl -X GET http://localhost:5000/api/reports \
  -b cookies.txt

← 200 OK
[
  {
    "id": 10,
    "title": "Purse Stolen",
    "description": "Black leather purse stolen from coffee shop...",
    "category": "theft",
    "location": "Downtown Coffee House",
    "status": "pending",
    "reporterId": 4,
    "createdAt": "2026-01-24T14:35:00.000Z"
  }
]
```

#### Step 5: Logout

```bash
$ curl -X GET http://localhost:5000/api/logout \
  -b cookies.txt \
  -c cookies.txt

← 200 OK
{
  "message": "Logged out successfully"
}

← Set-Cookie: sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

### Complete Admin Workflow

#### Login as Admin

```bash
$ curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -d '{
    "username": "admin_user",
    "password": "AdminPass123!"
  }'

← 200 OK
{
  "id": 1,
  "username": "admin_user",
  "email": "admin@example.com",
  "role": "admin",
  "createdAt": "2026-01-24T09:00:00.000Z"
}
```

#### View All Reports (Admin Only)

```bash
$ curl -X GET http://localhost:5000/api/reports \
  -b admin_cookies.txt

← 200 OK
[
  {
    "id": 1,
    "title": "Car Theft",
    "description": "...",
    "category": "theft",
    "location": "Main Street",
    "status": "pending",
    "reporterId": 2,
    "createdAt": "2026-01-24T10:00:00.000Z"
  },
  {
    "id": 10,
    "title": "Purse Stolen",
    "description": "...",
    "category": "theft",
    "location": "Downtown Coffee House",
    "status": "pending",
    "reporterId": 4,
    "createdAt": "2026-01-24T14:35:00.000Z"
  }
]
```

#### Filter Reports by Status

```bash
$ curl -X GET "http://localhost:5000/api/reports?status=pending" \
  -b admin_cookies.txt

← 200 OK
[
  (all pending reports)
]
```

#### Update Report Status

```bash
$ curl -X PUT http://localhost:5000/api/reports/1/status \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{"status": "reviewed"}'

← 200 OK
{
  "id": 1,
  "title": "Car Theft",
  "description": "...",
  "category": "theft",
  "location": "Main Street",
  "status": "reviewed",
  "reporterId": 2,
  "createdAt": "2026-01-24T10:00:00.000Z"
}
```

#### Delete Report

```bash
$ curl -X DELETE http://localhost:5000/api/reports/1 \
  -b admin_cookies.txt

← 204 No Content
(Empty response body)
```

---

## API Rate Limiting (Future Enhancement)

Recommended rate limiting configuration:

```typescript
// Per IP Address
- Login attempts: 5 per minute
- API requests: 100 per minute
- Report creation: 10 per hour

// Per User (Authenticated)
- API requests: 500 per hour
- Report creation: 50 per day
```

---

## API Versioning

**Current Version:** v1 (implicit)

**Future Versioning Strategy:**

```
GET /api/v1/reports    // Version 1
GET /api/v2/reports    // Version 2 (backward compatible v1 maintained)
```

---

**API Documentation Version:** 1.0.0  
**Last Updated:** January 25, 2026  
**Author:** Sardauna Tech Works
