# CareConnect360 – VirtualCare Telemedicine Platform
> **MCA Major Project Submission**  
> An enterprise-grade, full-stack virtual healthcare platform empowering patients to book appointments, participate in live encrypted video consultations, receive standardized digital prescriptions, message attending physicians, and manage medical billing.

---

## 🏥 Architecture Overview
- **Backend:** Python / Django 6.1.3 + Django REST Framework + Simple JWT (Stateless Bearer Tokens)
- **Frontend:** React 19 + Vite 8 + Bootstrap 5 + Lucide React + Axios + React Router v7
- **Database:** MySQL 8.0 (`careconnect360_db`)
- **Video Conferencing Gateway:** Jitsi Meet WebRTC (Embedded Web Client)
- **Testing Engine:** Pytest & pytest-django

---

## 🚀 Quick Setup & Execution

### 1. Prerequisites
- Python 3.10+
- MySQL 8.0 server running locally on `127.0.0.1:3306`
- Node.js 18+ & npm

### 2. Environment Configuration
Verify or adjust `.env` in the root directory:
```env
DB_NAME=careconnect360_db
DB_USER=root
DB_PASSWORD=root1234
DB_HOST=127.0.0.1
DB_PORT=3306
```

### 3. Backend Setup
```bash
# 1. Activate Virtual Environment
.\.venv\Scripts\activate

# 2. Apply Database Migrations
python manage.py migrate

# 3. Run Automated Tests
pytest

# 4. Start Django Backend Server
python manage.py runserver 127.0.0.1:8000
```
Backend API will be accessible at: `http://127.0.0.1:8000/api/`  
Django Administration: `http://127.0.0.1:8000/admin/`

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Client application will run at: `http://localhost:5173/`

---

## 👥 Seed Demonstration Credentials

| Role | Username | Email | Password |
|---|---|---|---|
| **Admin** | admin | `admin@careconnect360.com` | `AdminPassword123!` |
| **Doctor** | doctor1 | `doctor@gmail.com` | `TestPassword123!` |
| **Patient** | rahul | `rahul@gmail.com` | `TestPassword123!` |

*(You can also register any new patient or doctor directly via the UI)*

---

## 📂 Project Structure
```
CareConnect360/
├── accounts/               # Custom User (Doctor, Patient, Admin) & Profiles
├── appointments/           # Appointment Booking, Scheduling & Jitsi Video Rooms
├── prescriptions/          # Multi-item Digital Prescriptions & Printable Views
├── communication/          # Real-time Patient-Doctor Message Threads
├── billing/                # Automated Invoices & Multi-option Payment Processing
├── config/                 # Project Settings, Routing, and Middleware
├── database/
│   ├── schema.sql          # MySQL Database Schema DDL
│   └── seed_data.sql       # Seed Dataset
├── docs/                   # Academic Major Project Documentation
│   ├── Project_Overview.md
│   ├── SRS.md
│   ├── System_Architecture.md
│   ├── ER_Diagram.md
│   ├── API_Documentation.md
│   ├── Test_Report.md
│   └── User_Manual.md
├── frontend/               # React + Vite Client Application
├── manage.py
├── pytest.ini
├── BUILD_STATUS.md
└── .env
```

---

## 🧪 Comprehensive Verification Checklist
- [x] Patient Registration & JWT Login
- [x] Doctor Registration & Profile Validation
- [x] Doctor Directory Filtering & Search
- [x] Patient Appointment Booking with Symptoms
- [x] Doctor Request Approval / Rejection
- [x] Encrypted Jitsi Video Consultation Room Join
- [x] Digital Prescription Creation with Medicines & Frequency
- [x] Patient Prescription View & Print to PDF
- [x] Two-way Doctor-Patient Messaging with polling
- [x] Auto-generated Invoices & Simulated UPI/Card Checkout
- [x] Backend Role-based Access Restrictions (Pytest 100% Pass)
