# CareConnect360: Production Deployment Guide
**Architecture:** Django Backend (Render) + React Frontend (Vercel) + Hosted MySQL

> [!CAUTION]
> **Data Privacy & Compliance Warning**: Telemedicine applications handling real Protected Health Information (PHI) must comply with healthcare data privacy laws (e.g., HIPAA, GDPR, or DISHA/Digital Data Protection Act). For academic, demonstration, and evaluation deployments, **use ONLY fictional/synthetic test patient data**. Do not upload or process real medical records until a formal BAA (Business Associate Agreement), audit logging, and certified cloud infrastructure are in place.

---

## 1. Hosted MySQL Database Setup

### Recommended Provider: TiDB Cloud Serverless (MySQL 8.0 Protocol Compatible)
- **Compatibility**: Supports MySQL 8.0 wire-protocol and client communication; directly compatible with Django's `mysqlclient==2.3.2`.
- **Cost**: **Free Forever** tier (no credit card required upon initial signup).
- **Free Tier Limits**:
  - Storage: Up to 5 GiB row storage.
  - Compute: 50 Million Request Units (RU) per month.
- **Alternative**: **Aiven for MySQL** (Free credit trial available; managed native MySQL instance with dedicated resources).

### Step-by-Step Cloud MySQL Provisioning:
1. Register and sign in at [https://tidbcloud.com/](https://tidbcloud.com/).
2. Click **Create Cluster** and select **Serverless**.
3. Choose a cloud region close to your target audience (e.g., AWS / GCP Singapore or Mumbai).
4. After cluster creation, note the exact connection parameters:
   - **Host:** e.g., `gateway01.<region>.prod.aws.tidbcloud.com`
   - **Port:** `4000` (or `3306`)
   - **User:** `<cluster_prefix>.root`
   - **Password:** `<cluster_password>`
   - **Database Name:** `careconnect360_db`
5. In the TiDB Cloud web console (SQL Editor), verify or create the application database:
   ```sql
   CREATE DATABASE IF NOT EXISTS careconnect360_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## 2. Safely Importing Existing Data into Cloud MySQL

Your local database backup exists in `backups/careconnect360_db_backup.sql`.

> [!WARNING]
> **MySQL-to-Cloud Compatibility Note (GTID & Privileges)**:
> Backups created from local MySQL servers with GTID enabled include `SET @@GLOBAL.GTID_PURGED` and `SET @@SESSION.SQL_LOG_BIN`. Cloud and shared serverless MySQL providers (like TiDB Serverless or managed cloud databases) typically restrict `SUPER` or `SYSTEM_VARIABLES_ADMIN` privileges. Importing GTID statements directly without checking may cause errors such as `ERROR 1227 (42000): Access denied`.

### Step 2.1: Pre-Import Testing on a Sandbox Database
Before touching `careconnect360_db`, test importing into a temporary sandbox database:
```sql
CREATE DATABASE IF NOT EXISTS test_import_db;
```

### Step 2.2: Safe Import Command (Bypassing Server GTID Directives)
Import using the client flag to disable binary logging commands, or pipe through a filter omitting GTID directives:
```bash
# Option A: Direct import with SSL required
mysql -h <CLOUD_HOST> -P <CLOUD_PORT> -u <CLOUD_USER> -p --ssl-mode=REQUIRED careconnect360_db < backups/careconnect360_db_backup.sql

# Option B: If GTID privilege error (ERROR 1227) is encountered, run the migration-first approach:
# 1. Let Django generate all tables cleanly on the cloud DB via 'python manage.py migrate'
# 2. Or dump data only using: mysqldump --no-create-info --set-gtid-purged=OFF
```

*(Your local MySQL database at 127.0.0.1 remains untouched and safe at all times.)*

---

## 3. Render Backend Deployment (Django + Gunicorn)

### 3.1 Platform Characteristics & Free Tier Limitations
> [!IMPORTANT]
> **Understanding Render Free Tier for Telemedicine**:
> - **Spin-down on Inactivity**: Free Web Services spin down after 15 minutes of inactivity. The first request after idle can take **50–90 seconds** to start ("cold start"). This is acceptable for viva, evaluation, and academic demonstration, but **not suitable for a real-time production clinical emergency service**.
> - **Ephemeral Filesystem**: Render instances do not have persistent local disks across restarts. Static files are collected safely into WhiteNoise storage during build, but **any runtime user uploads to `media/` will be lost when the instance restarts**. For persistent user file uploads, a cloud object store (such as AWS S3 or Cloudinary) is required.

### 3.2 Service Configuration
1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository: `https://github.com/keshav-maheshwari707/CareConnect360`.
3. Fill in the service parameters:
   - **Name:** `careconnect360-backend`
   - **Region:** Choose the region closest to your database (e.g., Singapore or Frankfurt).
   - **Branch:** `main`
   - **Root Directory:** *(leave blank — repository root)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
     *(Note: For the very first deployment, do NOT append `python manage.py migrate` until you have verified database connectivity. Once connected, run migrations either from the Render Shell or by updating the build command with approval).*
   - **Start Command:**
     ```bash
     gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - **Instance Type:** Free (or Starter for non-sleeping production).

### 3.3 Backend Environment Variables on Render
Configure these exact keys under the **Environment** tab:

| Variable Name | Exact Value / Guidance |
|---|---|
| `SECRET_KEY` | *(A unique, random string of 50+ characters)* |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `careconnect360-backend.onrender.com` |
| `DB_NAME` | `careconnect360_db` |
| `DB_USER` | `<cloud_database_username>` |
| `DB_PASSWORD` | `<cloud_database_password>` |
| `DB_HOST` | `<cloud_database_hostname>` |
| `DB_PORT` | `4000` (or `3306`) |
| `DB_SSL_MODE` | `REQUIRED` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` *(Initial value; add Vercel URL in Step 5)* |
| `CSRF_TRUSTED_ORIGINS` | `https://careconnect360-backend.onrender.com` *(Initial value; add Vercel URL in Step 5)* |

---

## 4. Vercel Frontend Deployment (React + Vite)

### 4.1 Project Import on Vercel
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard) and click **Add New...** $\rightarrow$ **Project**.
2. Import the `CareConnect360` repository.
3. Configure build and output parameters:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and set to `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 4.2 Exact Environment Variable Format
In the **Environment Variables** section before deploying:
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://careconnect360-backend.onrender.com/api`

> [!NOTE]
> **URL Format Verification**:
> In `frontend/src/services/api.js`, the code uses:
> ```javascript
> const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
> const api = axios.create({ baseURL: API_BASE_URL });
> ```
> All frontend endpoints make calls relative to this base (e.g. `/accounts/login/`, `/appointments/`). Therefore, `VITE_API_BASE_URL` **MUST include the `/api` path suffix and MUST NOT have a trailing slash**.
> Example: `https://careconnect360-backend.onrender.com/api`

Click **Deploy**.

---

## 5. Synchronizing CORS & CSRF Between Vercel and Render

After Vercel assigns your production frontend URL (e.g., `https://careconnect360.vercel.app`):

1. Open the **Render Dashboard** $\rightarrow$ **careconnect360-backend** $\rightarrow$ **Environment Variables**.
2. **`CORS_ALLOWED_ORIGINS`**:
   Format: Comma-separated protocol + domain **without trailing slashes**.
   ```
   https://careconnect360.vercel.app,http://localhost:5173
   ```
3. **`CSRF_TRUSTED_ORIGINS`**:
   Format: Comma-separated protocol + domain **without trailing slashes**.
   ```
   https://careconnect360.vercel.app,https://careconnect360-backend.onrender.com
   ```
4. **`ALLOWED_HOSTS`**:
   Format: Comma-separated hostnames **without `https://` and without port**.
   ```
   careconnect360-backend.onrender.com,localhost,127.0.0.1
   ```
5. Click **Save Changes**. Render will automatically redeploy the backend with the new origins.

---

## 6. First-Time Database Migration on Render

To ensure database safety on the very first cloud deployment:
1. Wait until the Render service is deployed and reporting `Live`.
2. Open the **Shell** tab in the Render Dashboard.
3. Run:
   ```bash
   python manage.py showmigrations
   ```
   Verify that all apps (`accounts`, `appointments`, `prescriptions`, `communication`, `billing`) show unapplied migrations `[ ]`.
4. Run:
   ```bash
   python manage.py migrate
   ```
5. Create a production administrator:
   ```bash
   python manage.py createsuperuser
   ```
6. If you are importing from backup instead of starting fresh, verify that `backups/careconnect360_db_backup.sql` has been imported and run `python manage.py showmigrations` to confirm all migrations match `[X]`.

---

## 7. Post-Deployment Verification & Testing Checklist

Execute this structured end-to-end test sequence on your live URLs:

### A. Infrastructure & Health Verification
- [ ] **Public Health Check**: Visit `https://careconnect360-backend.onrender.com/api/accounts/doctors/` in a browser or via `curl`. It should return `HTTP 200` with JSON data (or empty array `[]`), confirming Django, Gunicorn, and MySQL are connected.
- [ ] **Authenticated Health Check**: Make an authenticated GET request to `/api/accounts/test-auth/` using a valid JWT Bearer token.
- [ ] **Django Admin & WhiteNoise Assets**: Visit `https://careconnect360-backend.onrender.com/admin/`. Confirm the login form renders with full CSS styling (verifies WhiteNoise and `collectstatic`).

### B. Functional Clinical Workflows
- [ ] **Patient Registration & Login**: Navigate to `https://careconnect360.vercel.app/register/patient`. Register a new test account, verify redirect to login, and check that JWT tokens are stored in `localStorage`.
- [ ] **Doctor Discovery & Profile**: Browse the doctor catalog under `/patient/find-doctors`. Test search filtering by specialization.
- [ ] **Appointment Booking**: Select a doctor, select date/time, provide symptoms, and book. Verify appointment status is `PENDING` and an invoice is generated.
- [ ] **Doctor Decision**: In an incognito window, log in as the doctor. Under `/doctor/appointments`, click **Accept**.
- [ ] **Video Consultation**: Both patient and doctor click **Join Call** / **Join Room** (`/consultation/:appointmentId`). Verify the Jitsi Meet video interface loads inside the browser and connection is established.
- [ ] **E-Prescription Workflow**: From doctor workspace, issue a digital prescription with diagnosis and multi-item medicines. As patient, open `/patient/prescriptions` and click **View & Print Prescription** to test print formatting.
- [ ] **Two-Way Messaging**: Exchange messages in real-time between patient and doctor chat.
- [ ] **Simulated Payment Processing**: In patient billing, click **Pay Now** and execute payment. Verify invoice status transitions to `PAID`.
- [ ] **SPA Direct URL Routing**: Refresh the page while visiting an inner route (e.g. `/patient/appointments` or `/doctor/create-prescription`). Confirm `vercel.json` rewrite prevents 404 errors.
