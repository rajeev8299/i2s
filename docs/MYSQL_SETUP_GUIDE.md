# Imagination2Software (I2S) — MySQL Setup & Migration Runbook

This guide provides step-by-step instructions to configure, run, and maintain the **MySQL database** for the I2S Business Management Website on Windows, Linux, or Cloud hosting.

---

## 1. Prerequisites

- **MySQL Server**: MySQL 8.0+ or MySQL 5.7+ installed and running.
- **Node.js**: v18.0.0 or higher.
- **Package Manager**: npm.

---

## 2. Windows MySQL Local Setup

### Step 1: Create the MySQL Database
Open PowerShell or Command Prompt with access to MySQL CLI:
```powershell
mysql -u root -p
```
Run the following SQL commands to create the database and a dedicated user:
```sql
CREATE DATABASE IF NOT EXISTS i2s_business_os 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Optional: Create a dedicated least-privilege user
CREATE USER IF NOT EXISTS 'i2s_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON i2s_business_os.* TO 'i2s_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

---

## 3. Server Configuration

Navigate to the `server/` directory:
```powershell
cd "c:\Users\rajee\OneDrive\Desktop\project i2s\server"
```

Configure your `.env` file (or duplicate from `.env.example`):
```env
PORT=5000
NODE_ENV=development

# MySQL Connection String Format:
# mysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>
DATABASE_URL="mysql://root:Rajeev@123@localhost:3306/i2s_business_os"

JWT_SECRET="i2s_enterprise_jwt_super_secret_key_change_in_production_2026"
COOKIE_SECRET="i2s_enterprise_cookie_secret_safe_key_2026"
COMPANY_NAME="Imagination2Software"
COMPANY_EMAIL="contact@imagination2software.com"
DEFAULT_CURRENCY="INR"
```

---

## 4. Deploy Schema & Seed Data

### Option A: Via Prisma CLI
Push the normalized schema directly to MySQL:
```powershell
npx prisma db push --schema=prisma/schema.mysql.prisma
```
Seed initial data (8 standard accounts, departments, ledger accounts, and service catalogs):
```powershell
node prisma/seed.js
```

### Option B: Via Native SQL Script
If you prefer direct SQL import, execute the provided DDL dump:
```powershell
mysql -u root -p i2s_business_os < prisma/mysql_schema.sql
```

---

## 5. Development Test Credentials

All seeded accounts share the default development password: `Password123!`

| Role | Email |
| :--- | :--- |
| **Super Admin** | `superadmin@i2s.com` |
| **Admin** | `admin@i2s.com` |
| **Accounts Manager** | `accounts@i2s.com` |
| **HR Manager** | `hr@i2s.com` |
| **Team Leader** | `teamlead@i2s.com` |
| **Staff Specialist** | `staff@i2s.com` |
| **Intern** | `intern@i2s.com` |
| **Client** | `client@acmecorp.com` |

---

## 6. Backup, Restore & Rollback

### Create a Database Backup:
```powershell
mysqldump -u root -p --single-transaction --quick --lock-tables=false i2s_business_os > backup_i2s_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

### Restore from Backup:
```powershell
mysql -u root -p i2s_business_os < backup_file.sql
```

### Switching Back to PostgreSQL (Dual-Dialect Support):
The project maintains dual-dialect capability. To switch back to PostgreSQL, update `DATABASE_URL` in `server/.env` to your PostgreSQL connection string and use `prisma/schema.prisma`.
