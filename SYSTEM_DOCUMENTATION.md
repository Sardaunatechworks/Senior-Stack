# Crime Tracking System - Comprehensive System Documentation

## MSc Final Year Project

**Project Name:** Senior Stack - Crime Tracking Web Application  
**Author:** Sardauna Tech Works  
**Date:** January 2026  
**Version:** 1.0.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [System Components](#system-components)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [API Documentation](#api-documentation)
8. [Authentication & Security](#authentication--security)
9. [Installation & Setup](#installation--setup)
10. [Deployment Architecture](#deployment-architecture)

---

## Executive Summary

The **Crime Tracking System** is a full-stack web application designed to streamline crime report submission, management, and analysis. The system supports two user roles:

- **Reporters**: Can submit crime reports and view their submissions
- **Admins**: Can view all reports, filter/search, and update report statuses

**Key Features:**

- Role-based access control (RBAC)
- Secure authentication with session management
- Real-time report status tracking
- Email notifications for report submissions
- PostgreSQL database with Drizzle ORM
- Production-grade error handling and validation

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser (React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Auth Page    │  │ Dashboard    │  │  Report Forms    │ │
│  │ (Login/Reg)  │  │ (View/Filter)│  │ (Create/Submit)  │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       │ REST API
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend Server (Node.js)             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Auth Router  │  │ Routes API   │  │ Email Service    │ │
│  │ (Login/Reg)  │  │ (Reports)    │  │ (Notifications)  │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Storage Layer (DatabaseStorage + ORM)              │  │
│  │  - User Management                                  │  │
│  │  - Report CRUD Operations                           │  │
│  │  - Query Processing                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ TCP/SSL
                       │ PostgreSQL Protocol
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL Database (Neon Cloud / Supabase)          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ users table  │  │ reports table │  │ sessions table   │ │
│  │ (Auth Data)  │  │ (Report Data) │  │ (Session Store)  │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Layers

#### 1. **Presentation Layer** (Frontend)

- **Technology:** React 18.3 + Vite + TypeScript
- **UI Components:** Shadcn UI + Tailwind CSS
- **State Management:** React Hooks + Custom Hooks
- **Responsibility:** User interface, form validation, navigation

#### 2. **API Layer** (Routes)

- **Technology:** Express.js
- **Endpoints:** RESTful API endpoints
- **Responsibility:** Request validation, routing, response formatting

#### 3. **Business Logic Layer** (Services)

- **Authentication:** Passport.js with LocalStrategy
- **Authorization:** Role-based access control
- **Email:** Nodemailer for notifications
- **Responsibility:** Core business logic, security rules

#### 4. **Data Access Layer** (Storage)

- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Responsibility:** Data persistence, query execution

---

## Technology Stack

### Frontend

| Component         | Technology      | Version |
| ----------------- | --------------- | ------- |
| Framework         | React           | 18.3.1  |
| Build Tool        | Vite            | 5.1.2   |
| Language          | TypeScript      | 5.3.3   |
| Styling           | Tailwind CSS    | 3.4.1   |
| Component Library | Shadcn UI       | Latest  |
| Form Handling     | React Hook Form | 7.51.4  |
| Validation        | Zod             | 3.22.4  |
| HTTP Client       | Fetch API       | Native  |
| Router            | Wouter          | 2.4.2   |

### Backend

| Component       | Technology        | Version |
| --------------- | ----------------- | ------- |
| Runtime         | Node.js           | 20.x+   |
| Framework       | Express.js        | 4.18.2  |
| Language        | TypeScript        | 5.3.3   |
| ORM             | Drizzle ORM       | Latest  |
| Database Driver | pg                | 8.11.3  |
| Authentication  | Passport.js       | 0.7.0   |
| Session Store   | connect-pg-simple | 10.0.0  |
| Password Hash   | bcryptjs          | 2.4.3   |
| Email           | Nodemailer        | 6.9.10  |
| Validation      | Zod               | 3.22.4  |

### Infrastructure

| Component   | Service               | Details                 |
| ----------- | --------------------- | ----------------------- |
| Database    | Neon / Supabase       | PostgreSQL Serverless   |
| Environment | Environment Variables | .env file configuration |
| Email       | Gmail SMTP            | External email service  |

---

## Database Design

### Entity-Relationship Diagram

```
┌─────────────────────────┐
│        users            │
├─────────────────────────┤
│ PK: id (serial)         │
│ username (text, unique) │
│ email (text, unique)    │
│ password (text)         │
│ role (enum)             │
│ created_at (timestamp)  │
└──────────────┬──────────┘
               │
               │ 1:N
               │
               ↓
┌──────────────────────────────┐
│      reports               │
├──────────────────────────────┤
│ PK: id (serial)            │
│ title (text)               │
│ description (text)         │
│ category (text)            │
│ location (text)            │
│ status (enum)              │
│ created_at (timestamp)     │
│ FK: reporter_id → users.id │
└──────────────────────────────┘
```

### Table Specifications

#### **users Table**

```typescript
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reporter', // 'reporter' | 'admin'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Constraints:**

- `username` must be unique
- `email` must be unique and valid
- `password` is hashed with bcrypt (10 rounds)
- `role` defaults to 'reporter'

**Indexes:**

- Primary key: `id`
- Unique: `username`, `email`

---

#### **reports Table**

```typescript
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', // 'pending' | 'reviewed' | 'closed'
  created_at TIMESTAMP DEFAULT NOW(),
  reporter_id INTEGER NOT NULL REFERENCES users(id)
);
```

**Constraints:**

- `reporter_id` is a foreign key referencing `users.id`
- `status` defaults to 'pending'
- All text fields are required

**Indexes:**

- Primary key: `id`
- Foreign key: `reporter_id`
- Useful indexes: `reporter_id`, `status`, `category`

---

#### **sessions Table** (Auto-created by connect-pg-simple)

```typescript
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
```

Used for server-side session storage with PostgreSQL.

---

## System Components

### 1. Frontend Components

#### **Authentication Flow**

```
AuthPage Component
├── LoginTab
│   ├── useForm (react-hook-form)
│   ├── Validation (Zod schema)
│   └── POST /api/login
│
└── RegisterTab
    ├── useForm (react-hook-form)
    ├── Email field validation
    └── POST /api/register
```

#### **Dashboard Flow**

```
Dashboard Component
├── ReportCard (Display individual reports)
├── CreateReportDialog (New report form)
├── Filters
│   ├── Status filter (admin only)
│   └── Category filter
└── useReports hook (Fetch & manage reports)
```

#### **Custom Hooks**

- `useAuth()`: Manages user authentication state
- `useReports()`: Fetch and manage crime reports
- `useUsers()`: User management (admin)
- `usePasswordReset()`: Password reset flow
- `useToast()`: Toast notifications

---

### 2. Backend Components

#### **Database Connection (db.ts)**

```typescript
// Responsibilities:
- Validate DATABASE_URL environment variable
- Create PostgreSQL connection pool
- Initialize Drizzle ORM
- Validate database connection before startup
- Handle connection errors with detailed diagnostics

// Key Features:
- Fail-fast on invalid configuration
- Production-grade pool settings
- SSL/TLS for Supabase/Neon
- Synchronous validation blocking server startup
```

#### **Authentication (auth.ts)**

```typescript
// Responsibilities:
- Setup Passport.js LocalStrategy
- Configure session management
- Handle password verification
- Serialize/deserialize user

// Flow:
1. User submits username + password
2. Passport.LocalStrategy verifies credentials
3. Password compared with bcrypt hash
4. Session created if match found
5. User data serialized into session
```

#### **Storage Layer (storage.ts)**

```typescript
// DatabaseStorage Class - Implements IStorage Interface
Methods:
- getUser(id: number): User | undefined
- getUserByUsername(username: string): User | undefined
- getAllUsers(): User[]
- createUser(user: InsertUser): User
- updateUserPassword(userId: number, newPassword: string): User
- generateResetToken(userId: number): string
- validateResetToken(token: string): number | null
- getReports(filter?: Filter): Report[]
- getReportsByReporter(reporterId: number): Report[]
- getReport(id: number): Report | undefined
- createReport(report: CreateReportRequest): Report
- updateReportStatus(id: number, status: Status): Report
- deleteReport(id: number): void
```

#### **Routes (routes.ts)**

```
API Endpoints:
├── Authentication
│   ├── POST /api/register
│   ├── POST /api/login
│   ├── GET /api/logout
│   └── GET /api/user
│
├── Reports (Protected)
│   ├── GET /api/reports
│   ├── GET /api/reports/:id
│   ├── POST /api/reports
│   ├── PUT /api/reports/:id/status
│   └── DELETE /api/reports/:id
│
└── Users (Admin Only)
    ├── GET /api/users
    └── PUT /api/users/:id/password
```

#### **Email Service (email.ts)**

```typescript
// Nodemailer Configuration
- Gmail SMTP server
- Environment variables for credentials
- HTML email templates

// Functions:
- sendAdminNotification(report): Sends email to admin on new report
- Error handling and retry logic
```

---

## Data Flow Diagrams

### User Registration Flow

```
┌─────────────┐
│   User      │
│ (Browser)   │
└──────┬──────┘
       │ 1. Fill registration form
       │ (username, email, password, role)
       ↓
┌─────────────────────────┐
│  Frontend (AuthPage)    │
│  - Zod validation       │
│  - Form validation      │
└──────┬──────────────────┘
       │ 2. POST /api/register
       │ JSON: {username, email, password, role}
       ↓
┌──────────────────────────────────┐
│  Backend (routes.ts)             │
│  1. Parse & validate request     │
│  2. Check duplicate username     │
│  3. Hash password (bcryptjs)     │
│  4. Create user in database      │
└──────┬───────────────────────────┘
       │ 3. Query: INSERT INTO users
       ↓
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  1. Store user record           │
│  2. Return created user         │
└──────┬──────────────────────────┘
       │ 4. Response: user object (no password)
       ↓
┌──────────────────────────┐
│  Frontend                │
│  1. Login user in        │
│  2. Redirect to dashboard│
│  3. Show success toast   │
└──────────────────────────┘
```

### Crime Report Submission Flow

```
┌──────────────┐
│    User      │ (Authenticated as Reporter)
│  (Browser)   │
└──────┬───────┘
       │ 1. Fill report form
       │ (title, description, category, location)
       ↓
┌──────────────────────────┐
│  Frontend (Dashboard)    │
│  - Form validation (Zod) │
│  - Check auth status     │
└──────┬───────────────────┘
       │ 2. POST /api/reports
       │ Authenticated session
       ↓
┌─────────────────────────────────┐
│  Backend (routes.ts)            │
│  1. Check authentication        │
│  2. Validate report data        │
│  3. Add reporter_id from user   │
│  4. Set status = 'pending'      │
└──────┬────────────────────────────┘
       │ 3. INSERT INTO reports
       ↓
┌──────────────────────────────────┐
│  PostgreSQL Database             │
│  1. Store report record          │
│  2. Return created report        │
└──────┬─────────────────────────────┘
       │ 4. Async: Send admin notification email
       ↓
┌──────────────────────────┐
│  Email Service           │
│  (Nodemailer + Gmail)    │
│  Send email to admin     │
└──────────────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Frontend Response       │
│  1. Show success toast   │
│  2. Refresh report list  │
│  3. Clear form           │
└──────────────────────────┘
```

### Report Filtering Flow (Admin)

```
┌─────────────────────────┐
│  Admin User             │
│  (Browser - Dashboard)  │
└────────┬────────────────┘
         │ 1. Click filter button
         │ Select: status=pending, category=theft
         ↓
┌────────────────────────────────┐
│  Frontend (Dashboard)          │
│  - Build query params          │
│  - useReports hook             │
└────────┬───────────────────────┘
         │ 2. GET /api/reports?status=pending&category=theft
         │ Authenticated as admin
         ↓
┌──────────────────────────────────┐
│  Backend (routes.ts)             │
│  1. Check admin role             │
│  2. Parse filter params          │
│  3. Build WHERE conditions       │
└──────┬──────────────────────────┘
       │ 3. SELECT FROM reports WHERE status=? AND category=?
       ↓
┌──────────────────────────────┐
│  PostgreSQL Database         │
│  1. Execute filtered query   │
│  2. Return matching reports  │
└──────┬───────────────────────┘
       │ 4. JSON response with filtered reports
       ↓
┌──────────────────────────────┐
│  Frontend                    │
│  1. Update report list UI    │
│  2. Display filtered results │
│  3. Show report count        │
└──────────────────────────────┘
```

### Session Management Flow

```
┌─────────────────────────────────┐
│  1. User Login                  │
├─────────────────────────────────┤
│  - Verify credentials           │
│  - Create session               │
│  - Store in PostgreSQL          │
│  - Set session cookie (30 days) │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  2. Subsequent Requests         │
├─────────────────────────────────┤
│  - Client sends session cookie  │
│  - Express middleware verifies  │
│  - Query session from database  │
│  - Attach user to req object    │
│  - Continue to next middleware  │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  3. User Logout                 │
├─────────────────────────────────┤
│  - Destroy session (Passport)   │
│  - Delete from database         │
│  - Clear cookie on client       │
└─────────────────────────────────┘
```

---

## API Documentation

### Base URL

```
Development: http://localhost:5000
Production: https://yourdomain.com
```

### Authentication Endpoints

#### **1. Register User**

```
POST /api/register
Content-Type: application/json

Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "reporter"  // 'reporter' | 'admin'
}

Response (201 Created):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T10:00:00Z"
}

Error Responses:
- 400: Username already exists
- 400: Invalid email format
- 400: Password too short
- 500: Server error
```

#### **2. Login User**

```
POST /api/login
Content-Type: application/json

Request Body:
{
  "username": "john_doe",
  "password": "SecurePassword123"
}

Response (200 OK):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T10:00:00Z"
}

Headers:
Set-Cookie: sid=abc123xyz...; Path=/; HttpOnly; Max-Age=2592000

Error Responses:
- 401: Invalid credentials
- 500: Server error
```

#### **3. Get Current User**

```
GET /api/user

Headers:
Cookie: sid=abc123xyz...

Response (200 OK):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "reporter",
  "createdAt": "2026-01-24T10:00:00Z"
}

Error Responses:
- 401: Not authenticated
```

#### **4. Logout User**

```
GET /api/logout

Response (200 OK):
{ "message": "Logged out successfully" }

Headers:
Set-Cookie: sid=; Path=/; Expires=Thu, 01 Jan 1970

Effect:
- Session destroyed in database
- Cookie cleared on client
```

---

### Report Endpoints

#### **1. List Reports**

```
GET /api/reports
GET /api/reports?status=pending&category=theft

Query Parameters:
- status: 'pending' | 'reviewed' | 'closed' (optional)
- category: string (optional)

Headers:
Cookie: sid=abc123xyz... (required)

Response (200 OK):
[
  {
    "id": 1,
    "title": "Car Theft",
    "description": "Red Honda Civic stolen...",
    "category": "theft",
    "location": "Main Street",
    "status": "pending",
    "reporterId": 2,
    "createdAt": "2026-01-24T10:00:00Z"
  },
  ...
]

Authorization:
- Admin: Can see all reports
- Reporter: Can only see their own reports

Error Responses:
- 401: Not authenticated
- 403: Insufficient permissions
```

#### **2. Get Report Details**

```
GET /api/reports/:id

Headers:
Cookie: sid=abc123xyz... (required)

Response (200 OK):
{
  "id": 1,
  "title": "Car Theft",
  "description": "Red Honda Civic stolen from parking lot",
  "category": "theft",
  "location": "Main Street",
  "status": "pending",
  "reporterId": 2,
  "createdAt": "2026-01-24T10:00:00Z"
}

Error Responses:
- 401: Not authenticated
- 404: Report not found
- 403: Cannot access other user's report
```

#### **3. Create Report**

```
POST /api/reports
Content-Type: application/json

Headers:
Cookie: sid=abc123xyz... (required)

Request Body:
{
  "title": "Vandalism at Park",
  "description": "Graffiti sprayed on park benches",
  "category": "vandalism",
  "location": "Central Park"
}

Response (201 Created):
{
  "id": 5,
  "title": "Vandalism at Park",
  "description": "Graffiti sprayed on park benches",
  "category": "vandalism",
  "location": "Central Park",
  "status": "pending",
  "reporterId": 1,
  "createdAt": "2026-01-24T10:30:00Z"
}

Side Effects:
- Email notification sent to admin
- Report status auto-set to 'pending'

Error Responses:
- 400: Missing required fields
- 401: Not authenticated
- 500: Server error
```

#### **4. Update Report Status (Admin Only)**

```
PUT /api/reports/:id/status
Content-Type: application/json

Headers:
Cookie: sid=abc123xyz... (required)

Request Body:
{
  "status": "reviewed"  // 'pending' | 'reviewed' | 'closed'
}

Response (200 OK):
{
  "id": 1,
  "title": "Car Theft",
  "description": "...",
  "category": "theft",
  "location": "Main Street",
  "status": "reviewed",
  "reporterId": 2,
  "createdAt": "2026-01-24T10:00:00Z"
}

Authorization:
- Only admins can update status

Error Responses:
- 401: Not authenticated
- 403: Only admins can update status
- 404: Report not found
- 400: Invalid status value
```

#### **5. Delete Report (Admin Only)**

```
DELETE /api/reports/:id

Headers:
Cookie: sid=abc123xyz... (required)

Response (204 No Content):
(Empty body)

Authorization:
- Only admins can delete reports

Error Responses:
- 401: Not authenticated
- 403: Only admins can delete
- 404: Report not found
```

---

## Authentication & Security

### Authentication Flow

#### **Session-Based Authentication**

```
Request → Express Middleware → Passport.js → LocalStrategy
                                   ↓
                            Database Lookup
                                   ↓
                            Password Compare
                                   ↓
                            Create Session
                                   ↓
                            PostgreSQL Store
                                   ↓
                            Set Cookie (HttpOnly)
```

### Password Security

#### **Hashing Strategy**

```typescript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);
// 10 = salt rounds (time cost factor)
// Result: $2b$10$N9qo8uLOickgx2ZMRZoMye... (60 characters)

// Login
const match = await bcrypt.compare(inputPassword, storedHash);
// Returns: boolean
```

**Security Properties:**

- **Algorithm:** bcrypt (adaptive)
- **Salt Rounds:** 10 (provides ~100ms hashing time)
- **Collision-resistant:** Uses Blowfish algorithm
- **GPU-resistant:** Designed to be slow and memory-intensive

---

### Session Management

#### **Configuration**

```typescript
Session Store: PostgreSQL (connect-pg-simple)
Cookie: HttpOnly, Secure, SameSite
Max Age: 30 days
Resave: false (only save on modifications)
SaveUninitialized: false (don't save empty sessions)
```

#### **Session Storage**

```
┌──────────────────────────────────┐
│  Session Table (PostgreSQL)      │
├──────────────────────────────────┤
│ sid: unique session identifier   │
│ sess: JSON user + metadata       │
│ expire: timestamp                │
│ (auto-cleanup of expired)        │
└──────────────────────────────────┘
```

---

### Authorization (RBAC)

#### **Role-Based Access Control**

```typescript
Roles:
1. REPORTER
   - Can register account
   - Can submit own reports
   - Can view own reports only
   - Cannot modify/delete reports
   - Cannot access admin functions

2. ADMIN
   - Can access all reports
   - Can filter/search reports
   - Can update report status
   - Can delete reports
   - Can manage users
```

#### **Middleware Protection**

```typescript
// Protected Route Example
app.get("/api/reports", (req, res) => {
  // Check 1: Authentication
  if (!req.isAuthenticated()) return res.sendStatus(401);

  // Check 2: Authorization
  if (req.user!.role === "admin") {
    // Show all reports
  } else {
    // Show own reports only
  }
});
```

---

### Data Validation

#### **Frontend Validation (Zod Schemas)**

```typescript
// Example: Report Schema
const reportSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(2000),
  category: z.enum(["theft", "vandalism", "assault", "other"]),
  location: z.string().min(2).max(255),
});
```

#### **Backend Validation**

```typescript
// Server-side re-validation
app.post("/api/reports", (req, res) => {
  // Never trust client validation
  const parsed = reportSchema.parse(req.body); // Throws if invalid
  // ... proceed with safe data
});
```

---

### HTTPS/SSL Configuration

#### **For Neon Database**

```typescript
ssl: {
  rejectUnauthorized: false; // Required for cloud DB
}
```

#### **For Production**

```typescript
ssl: {
  rejectUnauthorized: true,  // Strict validation
  ca: [certifcate],         // CA certificate
}
```

---

## Installation & Setup

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 12+ (or use Neon/Supabase)
- npm or yarn

### Step-by-Step Installation

#### **1. Clone Repository**

```bash
git clone https://github.com/Sardaunatechworks/Senior-Stack.git
cd Senior-Stack
```

#### **2. Install Dependencies**

```bash
npm install
```

#### **3. Environment Configuration**

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Session Secret
SESSION_SECRET=your_random_secret_key_here

# Email Configuration
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin_email@gmail.com

# Optional
NODE_ENV=development
PORT=5000
```

#### **4. Database Migration**

```bash
npm run db:push
```

This creates all tables in the database:

- `users` table
- `reports` table
- `sessions` table (auto-created by connect-pg-simple)

#### **5. Start Development Server**

```bash
npm run dev
```

Output:

```
📦 Database module loaded. Waiting for connection validation...
📡 Validating Supabase connection...
✅ Supabase connected successfully at: 2026-01-24T13:39:34.788Z
📦 Using database storage
5:39:41 AM [express] serving on port 5000
```

#### **6. Access Application**

```
Frontend: http://localhost:5000
API: http://localhost:5000/api
```

---

### Environment Variables Reference

| Variable         | Required | Description                                             |
| ---------------- | -------- | ------------------------------------------------------- |
| `DATABASE_URL`   | Yes      | PostgreSQL connection string                            |
| `SESSION_SECRET` | No       | Secret for signing sessions (auto-generated if missing) |
| `SMTP_EMAIL`     | No       | Gmail address for sending emails                        |
| `SMTP_PASSWORD`  | No       | Gmail app password                                      |
| `ADMIN_EMAIL`    | No       | Admin email for notifications                           |
| `NODE_ENV`       | No       | 'development' or 'production'                           |
| `PORT`           | No       | Server port (default: 5000)                             |

---

## Deployment Architecture

### Deployment Options

#### **Option 1: Vercel (Recommended for MSc)**

```
┌──────────────────────┐
│   GitHub Repository  │
│ (Sardaunatechworks)  │
└──────────┬───────────┘
           │ (Push trigger)
           ↓
┌──────────────────────┐
│   Vercel Pipeline    │
│ ├─ Build            │
│ ├─ Test             │
│ └─ Deploy           │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Vercel Hosting     │
│ (Frontend + API)     │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   Neon Database      │
│ (PostgreSQL Cloud)   │
└──────────────────────┘
```

#### **Option 2: Heroku**

```
┌──────────────────────┐
│   GitHub Repository  │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   Heroku Build Packs │
│ ├─ Node.js          │
│ └─ npm build        │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Heroku Dyno        │
│ (Application Server) │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│   Heroku Postgres    │
│ (or Neon)           │
└──────────────────────┘
```

#### **Option 3: Docker + Cloud Run**

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Production Deployment Checklist

- [ ] Database backups enabled
- [ ] HTTPS/SSL certificates configured
- [ ] Environment variables secured
- [ ] Email service verified
- [ ] Error logging setup (Sentry/LogRocket)
- [ ] Performance monitoring (Datadog/New Relic)
- [ ] Rate limiting configured
- [ ] CORS policies set correctly
- [ ] Security headers configured
- [ ] Database indexes optimized

---

## Testing & Quality Assurance

### Manual Testing Checklist

#### **Authentication**

- [ ] User can register with valid credentials
- [ ] Duplicate username rejected
- [ ] Invalid email rejected
- [ ] Password must meet minimum length
- [ ] User can login with correct credentials
- [ ] Wrong password shows error
- [ ] Session persists across requests
- [ ] Logout clears session

#### **Report Management**

- [ ] Reporter can create report
- [ ] Report status defaults to 'pending'
- [ ] Reporter sees only own reports
- [ ] Admin sees all reports
- [ ] Filter by status works
- [ ] Filter by category works
- [ ] Admin can update report status
- [ ] Only admin can delete reports

#### **Security**

- [ ] Unauthenticated users blocked
- [ ] Reporters can't access admin functions
- [ ] Passwords are hashed (not stored in plain text)
- [ ] Sessions expire after 30 days
- [ ] HTTPS enforced in production

---

## Performance Considerations

### Database Optimization

```sql
-- Recommended Indexes
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sessions_expire ON session(expire);
```

### Query Optimization

```typescript
// Bad: N+1 query problem
const reports = await db.select().from(reports);
for (const report of reports) {
  const user = await storage.getUser(report.reporterId); // Multiple queries
}

// Good: Join query
const reports = await db
  .select()
  .from(reports)
  .innerJoin(users, eq(reports.reporterId, users.id));
```

### Caching Strategies

```typescript
// Example: Cache user by ID
const userCache = new Map();

async function getUser(id) {
  if (userCache.has(id)) {
    return userCache.get(id);
  }
  const user = await db.query(...);
  userCache.set(id, user);
  return user;
}
```

---

## Error Handling & Logging

### Error Handling Strategy

```typescript
// 1. Validation Errors (400)
try {
  const data = schema.parse(req.body);
} catch (e) {
  res.status(400).json({ errors: e.errors });
}

// 2. Authentication Errors (401)
if (!req.isAuthenticated()) {
  res.status(401).json({ message: "Not authenticated" });
}

// 3. Authorization Errors (403)
if (req.user.role !== "admin") {
  res.status(403).json({ message: "Forbidden" });
}

// 4. Not Found Errors (404)
if (!report) {
  res.status(404).json({ message: "Report not found" });
}

// 5. Server Errors (500)
try {
  // ...
} catch (err) {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
```

### Logging Configuration

```typescript
// Development
console.log("info message");
console.error("error message");

// Production (use structured logging)
import winston from "winston";
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

---

## Troubleshooting Guide

### Common Issues

#### **1. Database Connection Failed**

```
Error: getaddrinfo ENOTFOUND db.njdvvxxghfkbfzfajvxm.supabase.co

Causes:
- DATABASE_URL not set
- Invalid hostname
- Network firewall blocking

Solution:
- Check .env file
- Verify DATABASE_URL syntax
- Check network connectivity
- Try VPN if blocked by ISP
```

#### **2. Password Login Fails**

```
Error: Incorrect credentials

Causes:
- User not found
- Password mismatch
- Case-sensitive username

Solution:
- Verify username exists
- Check password (case-sensitive)
- Use "Forgot Password" if available
```

#### **3. Session Not Persisting**

```
Error: User logged out unexpectedly

Causes:
- Cookie not set
- Session table corrupted
- Max age exceeded

Solution:
- Check cookie settings in auth.ts
- Verify session table exists
- Clear browser cookies and retry
```

#### **4. Email Notifications Not Sending**

```
Error: Failed to send email

Causes:
- SMTP credentials invalid
- Gmail app password wrong
- Less secure app access disabled

Solution:
- Verify SMTP_EMAIL and SMTP_PASSWORD
- Use Gmail app-specific password
- Enable 2FA on Gmail
```

---

## Conclusion

This comprehensive documentation provides a complete overview of the Crime Tracking System architecture, implementation, and deployment. The system demonstrates:

✅ **Full-stack development** (React + Node.js + PostgreSQL)  
✅ **Secure authentication** (bcrypt + session management)  
✅ **Role-based access control** (admin vs reporter)  
✅ **Production-grade code** (validation, error handling, logging)  
✅ **Cloud-ready deployment** (Vercel, Neon, Supabase)

---

**For Questions or Support:**

- Email: sardaunatech.hub@gmail.com
- GitHub: https://github.com/Sardaunatechworks/Senior-Stack

---

**Document Version:** 1.0.0  
**Last Updated:** January 25, 2026  
**Author:** Sardauna Tech Works
