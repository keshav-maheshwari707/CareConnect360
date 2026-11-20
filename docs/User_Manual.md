# CareConnect360 User Manual & Viva Guide

## 1. Quick Start Guide

### Step 1: Backend Server (Django)
Open a terminal in the root `CareConnect360/` directory:
```bash
# Activate virtual environment
.\.venv\Scripts\activate

# Run migrations (already applied)
python manage.py migrate

# Start Django development server on port 8000
python manage.py runserver 127.0.0.1:8000
```

### Step 2: Frontend Server (React + Vite)
Open a second terminal inside `CareConnect360/frontend/`:
```bash
cd frontend
npm run dev
```
Access the application in your browser at: `http://localhost:5173`

---

## 2. Seed Accounts for Demonstration

| Role | Username | Email | Password |
|---|---|---|---|
| **Admin** | admin | admin@careconnect360.com | AdminPassword123! |
| **Doctor** | doctor1 | doctor@gmail.com | DoctorPass123! |
| **Patient** | rahul | rahul@gmail.com | PatientPass123! |

---

## 3. Step-by-Step Demonstration Workflow

### Workflow 1: Patient Login & Doctor Booking
1. Open `http://localhost:5173/login` and log in with Patient credentials (`rahul@gmail.com`).
2. Navigate to **Find Doctors**. Search for specialization "Cardiology" or "dr".
3. Click **Book Consultation**, select a consultation date/time and describe symptoms.
4. Click **Confirm Booking**. The system records the booking, generates a Jitsi consultation room, and creates a billing invoice.

### Workflow 2: Doctor Acceptance & Video Call
1. In another browser or Incognito window, log in as Doctor (`doctor@gmail.com`).
2. Review the incoming request under **Appointments & Schedule**.
3. Click **Accept**.
4. Both Patient and Doctor can now click **Join Room / Join Call** to enter the live encrypted Jitsi video consultation window.

### Workflow 3: Issuing Digital Prescription
1. From the Doctor workspace, click **New Prescription**.
2. Select the patient session, fill in the diagnosis (e.g. *Hypertension Stage 1*), and add medicines with dosages, schedules, and duration.
3. Click **Save & Issue Prescription**.
4. Log back in as the Patient, go to **My Prescriptions**, and click **View & Print Prescription** to review and print/save to PDF.

### Workflow 4: Direct Messaging & Billing
1. Navigate to **Messages** to communicate in real-time between patient and doctor.
2. From the Patient dashboard, go to **Billing & Invoices**, click **Pay Now**, select UPI/Card simulated gateway, and confirm payment. The invoice updates to **PAID**.
