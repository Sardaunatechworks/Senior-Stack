# Crime Tracking Web Application

A simple, secure, cloud-hosted crime tracking system.

## Technology Stack
- **Frontend**: React (Vite) + Tailwind CSS + Shadcn UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Replit Built-in) + Drizzle ORM
- **Authentication**: Session-based (Passport.js) + bcrypt

## Features
- **Authentication**:
  - Secure Login/Register
  - Role-based Access Control (Admin vs Reporter)
- **Reporter Role**:
  - Submit crime reports (Title, Description, Category)
  - View own submitted reports
- **Admin Role**:
  - View all reports
  - Filter reports by status or category
  - Update report status (Pending -> Reviewed -> Closed)
  - Delete reports
- **Security**:
  - Password hashing with bcrypt
  - Protected API routes
  - HTTP-only sessions

## Setup & Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   The database is automatically provisioned on Replit.
   Push the schema:
   ```bash
   npm run db:push
   ```

3. **Start the Application**:
   ```bash
   npm run dev
   ```

## Default Credentials (Seed Data)

The system comes with pre-seeded accounts for testing:

- **Admin**:
  - Username: `admin`
  - Password: `admin123`

- **Reporter**:
  - Username: `reporter`
  - Password: `reporter123`

## Deployment

To deploy this application:
1. Click the **Deploy** button in Replit.
2. Choose **Autoscale** or **Reserved VM**.
3. Follow the deployment steps (Replit handles the build and hosting automatically).
