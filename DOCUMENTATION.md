# Crime Tracking Web Application - Complete System Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Authentication & Security](#authentication--security)
7. [Frontend Components](#frontend-components)
8. [Frontend Hooks](#frontend-hooks)
9. [Setup & Installation](#setup--installation)
10. [Deployment](#deployment)
11. [Features & Workflows](#features--workflows)
12. [Development Guide](#development-guide)

---

## Project Overview

**Crime Tracking Web Application** is a secure, cloud-hosted system designed to facilitate crime reporting and incident management. The application supports multiple user roles (Reporter and Admin) with role-based access control to manage incident reports efficiently.

### Key Objectives

- Enable citizens to securely report crimes and incidents
- Provide administrators with tools to review, filter, and manage reports
- Maintain audit trails with timestamps and reporter information
- Ensure data security through authentication and role-based authorization
- Support mobile and desktop access with a responsive UI

### Use Cases

- **Reporters**: Submit crime/incident reports with location and details
- **Admins**: Review all reports, update status, filter by category/status, manage users
- **System**: Track report lifecycle (Pending → Reviewed → Closed)

---

## Technology Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (v4.21.2)
- **Database**: PostgreSQL with Drizzle ORM (v0.39.3)
- **Authentication**: Passport.js + Bcrypt password hashing
- **Session Management**: express-session with PostgreSQL store
- **Build Tool**: tsx for TypeScript execution

### Frontend

- **Library**: React 18.3.1 with TypeScript
- **Build Tool**: Vite (with Replit plugins)
- **Styling**: Tailwind CSS 4.1 with PostCSS
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **State Management**: TanStack React Query (v5.60.5)
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter (lightweight client-side router)
- **Date Handling**: date-fns
- **Icons**: Lucide React + React Icons
- **Animations**: Framer Motion

### Development Tools

- **Type Checking**: TypeScript
- **Package Manager**: npm
- **Database Migration**: Drizzle Kit

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Pages: AuthPage, Dashboard, NotFound                 │  │
│  │ Components: CreateReportDialog, CreateUserDialog     │  │
│  │ UI Library: Shadcn/ui                                │  │
│  │ State: React Query + React Hook Form                 │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP/REST API
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   Backend (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Auth Routes: /api/register, /api/login, /api/logout │  │
│  │ Reports API: /api/reports (CRUD + filtering)        │  │
│  │ Users API: /api/users (admin only)                   │  │
│  │ Middleware: Authentication, Session, Error Handler   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              Database Layer (PostgreSQL + Drizzle)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tables: users, reports                               │  │
│  │ Features: Transactions, Relationships, Timestamps    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
senior-stack/
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities (queryClient, utils)
│   │   └── App.tsx      # Root component
│   └── public/
├── backend/             # Express backend application
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route handlers
│   ├── auth.ts          # Authentication setup
│   ├── db.ts            # Database connection
│   └── storage.ts       # Storage abstraction layer
├── shared/              # Shared code (schemas, routes, types)
│   ├── schema.ts        # Database schemas (Drizzle)
│   └── routes.ts        # API route definitions
├── script/              # Build scripts
└── Configuration files (tsconfig, vite, tailwind, drizzle)
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reporter' CHECK (role IN ('reporter', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**

- `id`: Unique identifier (auto-increment)
- `username`: Email/username (unique, required)
- `password`: Bcrypt-hashed password
- `role`: User role ('reporter' or 'admin')
- `created_at`: Account creation timestamp

**Indexes:**

- PRIMARY KEY on `id`
- UNIQUE INDEX on `username`

### Reports Table

```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reporter_id INTEGER NOT NULL REFERENCES users(id)
);
```

**Fields:**

- `id`: Unique identifier (auto-increment)
- `title`: Report title/summary
- `description`: Detailed incident description
- `category`: Category type (e.g., "Theft", "Vandalism", "Assault")
- `location`: Incident location (address or coordinates)
- `status`: Report status ('pending', 'reviewed', 'closed')
- `created_at`: Report submission timestamp
- `reporter_id`: Foreign key reference to submitting user

**Indexes:**

- PRIMARY KEY on `id`
- FOREIGN KEY on `reporter_id`

### Categories

Predefined crime categories:

- Theft
- Vandalism
- Assault
- Suspicious Activity
- Noise Complaint
- Other

---

## API Documentation

### Base URL

```
http://localhost:5173/api  (Development)
https://yourdomain.com/api (Production)
```

### Authentication Endpoints

#### Register User

```
POST /api/register
Content-Type: application/json

Request:
{
  "username": "user@example.com",
  "password": "password123",
  "role": "reporter" | "admin" (optional, defaults to "reporter")
}

Response (201 Created):
{
  "id": 1,
  "username": "user@example.com",
  "role": "reporter",
  "createdAt": "2026-01-03T10:00:00Z"
}

Error (400 Bad Request):
{
  "message": "Username already exists"
}
```

#### Login

```
POST /api/login
Content-Type: application/json

Request:
{
  "username": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "id": 1,
  "username": "user@example.com",
  "role": "reporter",
  "createdAt": "2026-01-03T10:00:00Z"
}

Error (401 Unauthorized):
{
  "message": "Invalid credentials"
}
```

#### Logout

```
POST /api/logout

Response (200 OK):
(empty response)

Notes:
- Clears session cookie
- No authentication required
```

#### Get Current User

```
GET /api/user

Response (200 OK):
{
  "id": 1,
  "username": "user@example.com",
  "role": "reporter",
  "createdAt": "2026-01-03T10:00:00Z"
}

Error (401 Unauthorized):
(empty response)
```

### Reports API

#### List Reports

```
GET /api/reports[?status=pending&category=Theft]

Authentication: Required
Query Parameters:
  - status: "pending" | "reviewed" | "closed" (optional)
  - category: Category name (optional)

Response (200 OK):
[
  {
    "id": 1,
    "title": "Vandalism in Park",
    "description": "Graffiti on the bench near the north entrance.",
    "category": "Vandalism",
    "location": "North Entrance",
    "status": "pending",
    "reporterId": 1,
    "createdAt": "2026-01-03T10:00:00Z"
  }
]

Notes:
- Reporters see only their own reports
- Admins can see all reports and use filters
```

#### Get Report by ID

```
GET /api/reports/:id

Authentication: Required

Response (200 OK):
{
  "id": 1,
  "title": "Vandalism in Park",
  "description": "Graffiti on the bench near the north entrance.",
  "category": "Vandalism",
  "location": "North Entrance",
  "status": "pending",
  "reporterId": 1,
  "createdAt": "2026-01-03T10:00:00Z"
}

Error (404 Not Found):
{
  "message": "Report not found"
}

Error (403 Forbidden):
{
  "message": "You don't have permission to view this report"
}
```

#### Create Report

```
POST /api/reports
Content-Type: application/json

Authentication: Required (Reporter or Admin)

Request:
{
  "title": "Theft at Store",
  "description": "Someone stole items from the display.",
  "category": "Theft",
  "location": "123 Main St"
}

Response (201 Created):
{
  "id": 2,
  "title": "Theft at Store",
  "description": "Someone stole items from the display.",
  "category": "Theft",
  "location": "123 Main St",
  "status": "pending",
  "reporterId": 1,
  "createdAt": "2026-01-03T10:00:00Z"
}

Error (400 Bad Request):
{
  "message": "Validation failed",
  "field": "title"
}
```

#### Update Report Status

```
PATCH /api/reports/:id
Content-Type: application/json

Authentication: Required (Admin only)

Request:
{
  "status": "reviewed" | "closed"
}

Response (200 OK):
{
  "id": 1,
  "title": "Vandalism in Park",
  "description": "Graffiti on the bench near the north entrance.",
  "category": "Vandalism",
  "location": "North Entrance",
  "status": "reviewed",
  "reporterId": 1,
  "createdAt": "2026-01-03T10:00:00Z"
}

Error (403 Forbidden):
{
  "message": "Only admins can update report status"
}
```

#### Delete Report

```
DELETE /api/reports/:id

Authentication: Required (Admin only)

Response (200 OK):
{
  "message": "Report deleted"
}

Error (403 Forbidden):
{
  "message": "Only admins can delete reports"
}
```

### Users API (Admin Only)

#### List All Users

```
GET /api/users

Authentication: Required (Admin only)

Response (200 OK):
[
  {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "createdAt": "2026-01-03T10:00:00Z"
  },
  {
    "id": 2,
    "username": "reporter",
    "role": "reporter",
    "createdAt": "2026-01-03T10:00:00Z"
  }
]

Error (403 Forbidden):
{
  "message": "Only admins can view users"
}
```

#### Create User (Admin)

```
POST /api/users
Content-Type: application/json

Authentication: Required (Admin only)

Request:
{
  "username": "newuser@example.com",
  "password": "password123",
  "role": "reporter" | "admin"
}

Response (201 Created):
{
  "id": 3,
  "username": "newuser@example.com",
  "role": "reporter",
  "createdAt": "2026-01-03T10:00:00Z"
}
```

---

## Authentication & Security

### Session-Based Authentication

The system uses **HTTP-only session cookies** for authentication.

**Flow:**

1. User registers/logs in → Server creates session → Server sets `x-session-id` cookie
2. Subsequent requests include cookie automatically
3. Server validates session before processing requests
4. On logout → Session destroyed, cookie cleared

### Password Security

- Passwords are hashed using **bcrypt** with salt rounds = 10
- Raw passwords never stored in database
- Comparison uses `bcrypt.compare()` to prevent timing attacks

### Authorization

**Role-Based Access Control (RBAC):**

- **Reporter**: Can create reports, view own reports only
- **Admin**: Can view all reports, update status, delete reports, manage users

**Middleware Check:**

```typescript
if (!req.isAuthenticated()) return res.sendStatus(401);
if (req.user.role !== "admin") return res.sendStatus(403);
```

### Security Best Practices Implemented

✅ Password hashing with bcrypt
✅ HTTP-only session cookies
✅ CSRF protection via session tokens
✅ SQL injection prevention via ORM (Drizzle)
✅ Input validation via Zod schemas
✅ Role-based access control
✅ Protected API routes

### Seed Accounts (Development)

```
Admin Account:
  Username: admin
  Password: admin123

Reporter Account:
  Username: reporter
  Password: reporter123
```

**⚠️ WARNING**: Change these credentials in production!

---

## Frontend Components

### Page Components

#### AuthPage (`client/src/pages/AuthPage.tsx`)

Login/Registration page with tab switching.

**Features:**

- Login form with email + password
- Register form with role selection
- Form validation with error display
- Tab navigation between modes
- Session auto-login on success

**State:**

- Active tab (login/register)
- Form loading state
- Error messages

#### Dashboard (`client/src/pages/Dashboard.tsx`)

Main application dashboard for reporters and admins.

**Reporter View:**

- List of own submitted reports
- Create new report button
- Search and filter reports
- View report details and status

**Admin View:**

- Tabs for Reports and Users
- List of all reports with filters
- Bulk actions (status update, delete)
- User management interface
- Advanced filtering (status, category, search)

**Features:**

- Real-time report list updates
- Filtering by status and category
- Search by title/description
- Loading skeletons
- Responsive layout

#### NotFound (`client/src/pages/not-found.tsx`)

404 error page for unmapped routes.

### Dialog Components

#### CreateReportDialog (`client/src/components/CreateReportDialog.tsx`)

Modal dialog for submitting new crime reports.

**Form Fields:**

- Title (required, text input)
- Description (required, textarea)
- Category (required, dropdown select)
- Location (required, text input with geolocation button)

**Features:**

- Geolocation integration (reverse geocoding via Nominatim)
- Confirmation dialog before submission
- Real-time location fetching
- Error handling for location services
- Automatic form reset on success
- Toast notifications

**Validation:**

- All fields required
- Min/max length constraints
- Category must be predefined

#### CreateUserDialog (`client/src/components/CreateUserDialog.tsx`)

Modal for admins to create new user accounts.

**Form Fields:**

- Username (required, email format)
- Password (required, min 6 chars)
- Role (required, select: reporter/admin)

**Features:**

- Role selection for new users
- Form validation
- Loading state during submission
- Toast notifications on success

### Reusable UI Components

#### ReportCard (`client/src/components/ReportCard.tsx`)

Displays a single report with status badge and actions.

**Content:**

- Title (heading)
- Description (preview)
- Category badge
- Location
- Status indicator (color-coded)
- Created date
- Reporter name (admin view)

**Actions:**

- View details
- Update status (admin)
- Delete (admin)
- Responsive layout

#### Layout (`client/src/components/Layout.tsx`)

Application wrapper with header and navigation.

**Features:**

- Header with logo/title
- User info display
- Logout button
- Theme toggle (light/dark)
- Navigation breadcrumbs
- Responsive sidebar

#### ThemeProvider (`client/src/components/ThemeProvider.tsx`)

Light/dark mode context provider using `next-themes`.

**Features:**

- Theme persistence in localStorage
- System preference detection
- CSS class-based theming with Tailwind

### Shadcn/ui Components Used

- Dialog (modals)
- Form (form wrapper with React Hook Form)
- Input (text inputs)
- Textarea (multiline text)
- Select (dropdown menus)
- Button (actions)
- Badge (status indicators)
- Table (data display)
- Tabs (tab navigation)
- Card (content containers)
- Skeleton (loading placeholders)
- Toast (notifications)
- Alert Dialog (confirmations)

---

## Frontend Hooks

### useAuth (`client/src/hooks/use-auth.ts`)

Manages user authentication state and session.

```typescript
const { user, isLoading, login, logout, register } = useAuth();

// Returns:
// - user: Current user object or null
// - isLoading: Loading state
// - login(username, password): Login function
// - logout(): Logout function
// - register(username, password, role): Register function
```

**Implementation Details:**

- Uses React Query for persistent session fetching
- Automatically checks `/api/user` on mount
- Manages login/logout API calls
- Stores session in cookies

### useReports (`client/src/hooks/use-reports.ts`)

Manages report data fetching and mutation.

```typescript
const {
  data: reports,
  isLoading,
  error,
  createReport,
  updateReportStatus,
  deleteReport,
} = useReports();

// Mutations return promises with status handling
```

**Features:**

- Fetch reports with filters
- Create new reports
- Update report status
- Delete reports
- Real-time refetch on mutations
- Error handling

### useUsers (`client/src/hooks/use-users.ts`)

Admin hook for user management.

```typescript
const { users, isLoading, createUser } = useUsers();

// Admin-only hook for viewing and creating users
```

### usePasswordReset (`client/src/hooks/use-password-reset.ts`)

Password reset workflow (request reset token + confirm reset).

```typescript
const { requestReset, resetPassword, isLoading } = usePasswordReset();
```

### useMobile (`client/src/hooks/use-mobile.tsx`)

Detects mobile viewport size.

```typescript
const isMobile = useMobile();
// Returns true if viewport < 768px (md breakpoint)
```

### useToast (`client/src/hooks/use-toast.ts`)

Display toast notifications.

```typescript
const { toast } = useToast();

toast({
  title: "Success",
  description: "Report submitted",
  variant: "default",
});
```

---

## Setup & Installation

### Prerequisites

- Node.js (v16+)
- PostgreSQL (or Replit built-in database)
- npm

### Installation Steps

**1. Clone Repository**

```bash
git clone <repository-url>
cd Senior-Stack
```

**2. Install Dependencies**

```bash
npm install
```

**3. Environment Variables**
Create `.env` file in project root:

```env
# Database (Replit uses built-in, or provide PostgreSQL URL)
DATABASE_URL=postgresql://user:password@localhost/crime_tracking

# Session Secret (change in production!)
SESSION_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

**4. Database Setup**

```bash
# Run Drizzle migrations
pnpm run db:push

 This creates tables: users, reports
# And seeds default accounts (admin/reporter)
```

**5. Start Development Server**

```bash
npm run dev

# Starts on http://localhost:5173
# Backend runs on http://localhost:3000 (proxied)
```

### Development Commands

```bash
npm run dev          # Start dev server (frontend + backend)
npm run build        # Production build
npm start            # Run production build
npm run check        # TypeScript type checking
npm run db:push      # Apply database migrations
```

---

## Deployment

### Replit Deployment

The application is configured for **Replit hosting**.

**Features:**

- Built-in PostgreSQL database
- Automatic environment setup
- Git integration for deployments

**Deployment Steps:**

1. Push code to GitHub
2. Connect repo to Replit
3. Set environment variables in Replit Secrets
4. Run `npm run db:push` to setup database
5. Start application with `npm run dev`

### Production Build

```bash
npm run build        # Creates dist/ folder
npm start            # Runs production bundle
```

**Build Output:**

- `dist/index.cjs`: Bundled server code
- `dist/public/`: Frontend static assets

### Environment Variables (Production)

```env
DATABASE_URL=postgresql://...     # Production database
SESSION_SECRET=<strong-secret>    # Change this!
NODE_ENV=production
```

### Security Checklist

- [ ] Change default admin/reporter passwords
- [ ] Use strong SESSION_SECRET
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure CORS if needed
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging

---

## Features & Workflows

### User Registration Workflow

```
1. User fills registration form
   ↓
2. Frontend sends POST /api/register
   ↓
3. Server validates input (Zod schema)
   ↓
4. Check if username exists
   ↓
5. Hash password with bcrypt
   ↓
6. Create user in database
   ↓
7. Set session cookie
   ↓
8. Redirect to dashboard
```

### Report Submission Workflow

```
1. User clicks "New Report" button
   ↓
2. CreateReportDialog opens
   ↓
3. User fills form:
   - Title, Description, Category, Location
   ↓
4. User can click "Use My Location" for geolocation
   ↓
5. User submits form
   ↓
6. Confirmation dialog appears
   ↓
7. User confirms submission
   ↓
8. POST /api/reports sent to server
   ↓
9. Server validates and creates report
   ↓
10. Status set to "pending"
    ↓
11. Toast notification shown
    ↓
12. Dashboard refreshes with new report
```

### Report Status Update (Admin)

```
1. Admin views report in dashboard
   ↓
2. Clicks status dropdown
   ↓
3. Selects new status (reviewed/closed)
   ↓
4. PATCH /api/reports/:id sent
   ↓
5. Server updates status
   ↓
6. Dashboard refreshes
   ↓
7. Toast confirmation shown
```

### Filter & Search

```
Reporters:
- See only their own reports
- Can search by title/description
- Can filter by status or category

Admins:
- See all reports
- Can search across all reports
- Can filter by status, category, date range
- Can use advanced filtering combinations
```

---

## Development Guide

### Adding a New API Endpoint

**1. Define Schema in `shared/schema.ts`:**

```typescript
import { createInsertSchema } from "drizzle-zod";

export const insertNewSchema = createInsertSchema(newTable).pick({
  // fields to include
});
```

**2. Define Route in `shared/routes.ts`:**

```typescript
export const api = {
  newFeature: {
    list: {
      method: "GET" as const,
      path: "/api/new-feature",
      responses: { 200: z.array(someSchema) },
    },
  },
};
```

**3. Implement Handler in `server/routes.ts`:**

```typescript
app.get(api.newFeature.list.path, async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  // Implementation
  res.json(data);
});
```

**4. Create Hook in `client/src/hooks/use-new-feature.ts`:**

```typescript
export function useNewFeature() {
  return useQuery({
    queryKey: ["new-feature"],
    queryFn: async () => {
      const res = await fetch("/api/new-feature");
      return res.json();
    },
  });
}
```

**5. Use Hook in Component:**

```typescript
const { data } = useNewFeature();
```

### Adding a New UI Component

**1. Use Shadcn CLI (if available):**

```bash
npx shadcn-ui add component-name
```

**2. Or manually create in `client/src/components/ui/:`**

```typescript
// Import Radix UI primitive
import * as Component from "@radix-ui/react-component";

export const MyComponent = React.forwardRef<...>(...);
```

### Styling Guidelines

**Tailwind CSS:**

- Use utility classes for styling
- Responsive design with `md:`, `lg:` prefixes
- Dark mode with `.dark` selector

**Example:**

```tsx
<div className="p-4 md:p-6 bg-white dark:bg-slate-950">Content</div>
```

### Error Handling

**Backend Errors:**

```typescript
// Validation error
res.status(400).json({ message: "Invalid input" });

// Authentication error
res.status(401).json({ message: "Unauthorized" });

// Authorization error
res.status(403).json({ message: "Forbidden" });

// Not found
res.status(404).json({ message: "Not found" });

// Server error
res.status(500).json({ message: "Internal server error" });
```

**Frontend Error Handling:**

```typescript
const { mutate, isPending, error } = useMutation({
  mutationFn: async (data) => {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    return res.json();
  },
  onError: (error) => {
    toast({ title: "Error", description: error.message });
  },
});
```

### Testing

**Unit Tests:** Create `.test.ts` files alongside components
**E2E Tests:** Use Playwright or Cypress for browser testing

Currently, testing framework is not configured. To add:

```bash
npm install --save-dev vitest @testing-library/react
```

### Code Organization

**Components:**

- One component per file
- Props interface at top
- Styled with Tailwind classes
- Export default

**Hooks:**

- Named export with `use` prefix
- Return destructurable object
- Clear comments for complex logic

**Utils:**

- Pure functions
- No side effects
- Well-typed with TypeScript

---

## Troubleshooting

### Database Connection Issues

**Error:** `ENOTFOUND: getaddrinfo ENOTFOUND`

**Solution:**

- Verify DATABASE_URL environment variable
- Check PostgreSQL is running
- For Replit: Ensure database is provisioned in Secrets

### Session Not Persisting

**Error:** Logged in but redirected to auth page

**Solution:**

- Clear browser cookies
- Verify SESSION_SECRET is set
- Check `credentials: "include"` in fetch calls

### Dropdown Z-Index Issues

**Fixed in:** `client/src/components/ui/select.tsx`

**Changes:**

- `SelectContent` uses `position: absolute` and `z-[10000]`
- `bg-white` background for solid visibility
- Properly breaks out of dialog stacking context

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5173`

**Solution:**

```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5173
kill -9 <PID>
```

---

## Performance Optimization

### Frontend Optimizations

1. **Code Splitting:** Vite automatically splits routes
2. **Image Optimization:** Use modern formats (WebP)
3. **Lazy Loading:** React.lazy for routes
4. **Caching:** React Query cache strategies
5. **Memoization:** useMemo for expensive computations

### Backend Optimizations

1. **Database Indexing:** Indexes on frequent queries
2. **Connection Pooling:** PostgreSQL connection pool
3. **Response Compression:** Gzip enabled by default
4. **Caching:** HTTP cache headers

---

## Future Enhancements

1. **Email Notifications:** Alert reporters on status changes
2. **File Attachments:** Upload images/evidence with reports
3. **Real-time Updates:** WebSocket for live dashboard
4. **Advanced Analytics:** Dashboard with crime statistics
5. **Mobile App:** React Native version
6. **API Rate Limiting:** Prevent abuse
7. **Two-Factor Authentication:** Enhanced security
8. **Audit Logging:** Track all system actions
9. **Report Export:** CSV/PDF reports
10. **Map Integration:** Visualize incidents on map

---

## Support & Resources

- **Documentation:** This file
- **Issues:** GitHub Issues (if applicable)
- **Email:** contact@example.com (update as needed)

---

**Last Updated:** January 3, 2026
**Version:** 1.0.0
**License:** MIT
