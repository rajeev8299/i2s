# I2S Business OS — Imagination2Software
## Enterprise Full-Stack Business Management Platform

A production-grade, secure, multi-role internal operating system and public product website built with React, Node.js (Express), PostgreSQL, and Prisma ORM.

---

### 1. Technology Stack
- **Frontend**: React 19, JavaScript ES6+, Vanilla CSS (Design Tokens, Glassmorphism, Dark Palette), React Router 7, Lucide Icons, Vite 6
- **Backend**: Node.js v24, Express 4.21, RESTful Architecture, JWT & HTTP-Only Cookie Authentication, Bcrypt Password Hashing, Centralized Error Handling, Rate Limiting, Audit Logging
- **Database**: PostgreSQL 18, Prisma ORM 6, Version-Controlled Schema, Seed Script
- **Document Generation**: PDFKit streaming real invoice PDFs directly from PostgreSQL records
- **Testing**: Vitest & Supertest automated API suites

---

### 2. Architecture & Roles
The platform implements 8 server-enforced roles with record-level query authorization:
1. **Super Admin**: System governance, role management, audit logging, organizational reports.
2. **Admin**: Operational management, team allocation, project supervision.
3. **Accounts Manager**: GST tax invoicing, partial payments, balanced double-entry general ledgers, trial balance, and PDF receipts.
4. **HR Manager**: Personnel records, attendance, leave application reviews, and confidential monthly payroll generation.
5. **Team Leader**: Project-specific task assignment, submission review, approval, or change request management.
6. **Staff**: Assigned task updates, deliverable submissions, daily attendance, and leave requests.
7. **Intern**: Assigned learning deliverables, submission reviews, attendance, and stipend tracking.
8. **Client**: Strict data isolation — view only authorized projects, approved milestones, and download invoices. Never see internal notes or other client records.

---

### 3. Windows Local Quickstart Guide

#### Prerequisites
- Node.js v20+ (Tested on v24.19.0) & npm (v11+)
- PostgreSQL 18 (Installed at `C:\Program Files\PostgreSQL\18`)

#### Step 1: Start Dedicated Local PostgreSQL Cluster
The project includes a dedicated PostgreSQL cluster in `./pg_data` running on port `5433`:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Users\rajee\OneDrive\Desktop\project i2s\pg_data" -p 5433
```

#### Step 2: Push Database Schema & Seed Data
```powershell
# From project root:
npm run db:push --workspace=server
npm run db:seed --workspace=server
```

#### Step 3: Start the Full-Stack Application
To start both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently:
```powershell
npm run dev
```

#### Step 4: Run Automated Verification Tests
```powershell
npm run test
```

#### Step 5: Build Production Assets
```powershell
npm run build
```

---

### 4. Seed User Accounts for Immediate Testing
All seed accounts use the default test password: `Password123!`

| Role | Email | Capabilities & Scoped Access |
|---|---|---|
| **Super Admin** | `superadmin@i2s.com` | Audit logs, personnel management, system diagnostics |
| **Admin** | `admin@i2s.com` | Client onboarding, project creation, team management |
| **Accounts Manager** | `accounts@i2s.com` | Invoices, partial payment recording, trial balance, PDF receipts |
| **HR Manager** | `hr@i2s.com` | Attendance tracking, leave approval, monthly payroll processing |
| **Team Leader** | `teamlead@i2s.com` | Task assignment, deliverable review & decision |
| **Staff Specialist** | `staff@i2s.com` | Engineering task execution, deliverable submissions |
| **Intern** | `intern@i2s.com` | Submissions, attendance logging, stipend view |
| **Client Partner** | `client@acmecorp.com` | Isolated project milestones & PDF tax invoice downloads |

---

### 5. Verified Security Controls
- **Client Data Isolation**: Confirmed via automated tests that client portal accounts cannot access another client's projects, invoices, or internal confidential staff notes.
- **Strict Role Authorization**: Verified that non-HR roles cannot access payroll records or employee compensation.
- **Double-Entry Accounting Guard**: Invoice payments generate balanced debit-credit journal entries (`debit == credit`) within transactional boundaries.
- **Audit Logging**: Sensitive events (logins, logouts, user creation, status changes, payments) are captured in `AuditLog` table.
