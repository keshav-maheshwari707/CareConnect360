# CareConnect360: Production Deployment Plan
**Targets:**
- Frontend: Vercel (React + Vite)
- Backend: Render (Django + DRF + Gunicorn + WhiteNoise)
- Database: Managed Hosted MySQL (TiDB Serverless, Aiven, PlanetScale, or Railway MySQL)

---

## 1. Architectural Inspection Findings

| Component | Current State | Production Requirement | Action Required |
|---|---|---|---|
| **Django Settings (`config/settings.py`)** | `DEBUG = True`, hardcoded `SECRET_KEY`, `ALLOWED_HOSTS = []` | `DEBUG = False`, `SECRET_KEY` from env, dynamic `ALLOWED_HOSTS` | Read `DEBUG`, `SECRET_KEY`, and `ALLOWED_HOSTS` from environment with safe local fallbacks |
| **WSGI Server** | Django dev server (`runserver`) | Production WSGI HTTP server | Add `gunicorn` to production dependencies |
| **Static Files** | Standard Django static without static root or WhiteNoise | Render/Vercel static assets serving | Add `whitenoise`, configure `STATIC_ROOT` and `STATICFILES_STORAGE` in Django |
| **Database** | MySQL on `127.0.0.1:3306` via `python-dotenv` | Remote hosted MySQL compatible with Django (`mysqlclient`) | Support both individual DB variables (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_SSL`) and optional `DATABASE_URL` (with `dj-database-url` or direct URL parsing) |
| **CORS & CSRF** | Hardcoded `http://localhost:5173` | Vercel production domain + preview domains + localhost | Read allowed CORS and CSRF origins from comma-separated env vars |
| **Python Dependencies** | No `requirements.txt` file in root directory | Render requires `requirements.txt` | Generate `requirements.txt` containing all runtime packages (`django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `mysqlclient`, `gunicorn`, `whitenoise`, `python-dotenv`, etc.) |
| **Frontend API Base URL** | Hardcoded `'http://127.0.0.1:8000/api'` in `api.js` | Dynamically configured via Vite environment variable | Use `import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'` |
| **Frontend SPA Routing** | Standard Vite setup | Vercel SPA requires routing rewrite for client-side routing (`/patient/*`, `/doctor/*`) | Add `frontend/vercel.json` with route rewrite to `/index.html` |
| **Local Development** | Working with local MySQL and dev server | Unbroken local development | Maintain local default fallbacks in both backend settings and frontend |

---

## 2. Proposed Changes & Preparation Details

### 2.1 Backend Changes
1. **`requirements.txt` (New in root)**
   - Add core dependencies: `Django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `mysqlclient`, `python-dotenv`, `sqlparse`, `asgiref`.
   - Add production servers & utilities: `gunicorn`, `whitenoise`.
2. **`config/settings.py` (Enhancement without breaking existing code)**
   - `SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-secret-key')`
   - `DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1')`
   - `ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]`
   - Add `whitenoise.middleware.WhiteNoiseMiddleware` right below `SecurityMiddleware`.
   - Configure `STATIC_ROOT = BASE_DIR / 'staticfiles'` and `STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'`.
   - Configure CORS & CSRF:
     ```python
     cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')
     CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
     csrf_trusted = os.getenv('CSRF_TRUSTED_ORIGINS', '')
     if csrf_trusted:
         CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_trusted.split(',') if origin.strip()]
     ```
   - Database configuration:
     Keep MySQL engine (`django.db.backends.mysql`), read `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and add optional SSL option for cloud providers (e.g. `{'ssl': {'ca': ...}}` or `{'ssl': {}}` if required).
3. **Render Build & Start Scripts**
   - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
   - Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - Add a `render.yaml` or step-by-step Render dashboard setup guide.

### 2.2 Frontend Changes
1. **`frontend/src/services/api.js`**
   - Update `API_BASE_URL` to:
     ```javascript
     const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
     ```
   - Keep existing token interceptors and response handlers unchanged.
2. **`frontend/.env.example`**
   - Add `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`
3. **`frontend/vercel.json` (New)**
   - Add SPA rewrites so direct navigation to `/patient/appointments` or `/doctor/create-prescription` does not yield a 404 on Vercel:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```

---

## 3. Database Migration Strategy (Hosted MySQL)
- Free & low-cost reliable cloud MySQL providers supporting standard MySQL 8.0:
  - **TiDB Cloud Serverless** (MySQL 8.0 compatible, free 5GB, native SSL support).
  - **Aiven for MySQL** (Free tier or trial, dedicated managed MySQL).
  - **Railway MySQL** (Standard MySQL 8.0 instance).
- Pre-migration safety:
  - Local export script provided in `database/backup_local_db.sql` before connecting to any remote host.
  - Apply migrations against the remote DB via `python manage.py migrate`.
  - Create the production admin account via Django management command or Render shell.

---

## 4. Execution Steps & Sign-off Points

1. **Step 1 (Approval Needed):** Review this plan and approve proceeding to Phase 2 (Production Preparation).
2. **Step 2:** Create `requirements.txt`, update `config/settings.py` for production-safety, update `frontend/src/services/api.js`, and add `frontend/vercel.json`.
3. **Step 3:** Test local build and local execution with `DEBUG=True` to ensure zero regression.
4. **Step 4:** Provide step-by-step instructions for hosting MySQL, deploying Render backend, and deploying Vercel frontend.
