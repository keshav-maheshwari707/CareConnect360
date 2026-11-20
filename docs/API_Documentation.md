# CareConnect360 API Documentation

Base URL: `http://127.0.0.1:8000/api`

### 1. Accounts & Authentication Endpoints
- `POST /accounts/register/patient/`
  - Body: `{ "username", "email", "password", "phone_number" }`
  - Response: `201 Created`
- `POST /accounts/register/doctor/`
  - Body: `{ "username", "email", "password", "phone_number", "specialization", "qualification", "license_number", "experience_years", "consultation_fee" }`
  - Response: `201 Created`
- `POST /accounts/login/`
  - Body: `{ "email", "password" }`
  - Response: `{ "access", "refresh", "user": { "id", "username", "email", "role" } }`
- `POST /accounts/token/refresh/`
  - Body: `{ "refresh" }`
  - Response: `{ "access" }`
- `GET /accounts/me/` (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Response: Current user object with associated doctor/patient profile.
- `PUT /accounts/me/` (Protected)
  - Updates profile fields (DOB, address, bio, fees, specialization).
- `GET /accounts/doctors/?search=<term>`
  - Returns list of verified doctors and consultation fees.

### 2. Appointments & Consultation Endpoints
- `GET /appointments/` (Protected)
  - Lists appointments for authenticated patient/doctor.
- `POST /appointments/` (Protected - Patient only)
  - Body: `{ "doctor": <id>, "appointment_date": "YYYY-MM-DD", "appointment_time": "HH:MM:SS", "symptoms": "..." }`
  - Creates appointment, generates Jitsi room and pending invoice.
- `PATCH /appointments/<id>/status/` (Protected)
  - Doctor: `{ "status": "ACCEPTED" | "REJECTED" | "COMPLETED" }`
  - Patient: `{ "status": "CANCELLED" }`
- `POST /appointments/<id>/join/` (Protected)
  - Validates that caller is assigned doctor or patient.
  - Returns: `{ "room_name": "CareConnect360-...", "user_display_name": "..." }`

### 3. Prescriptions Endpoints
- `GET /prescriptions/` (Protected)
  - Lists prescriptions for authenticated user.
- `POST /prescriptions/` (Protected - Doctor only)
  - Body:
    ```json
    {
      "appointment": 1,
      "patient": 2,
      "diagnosis": "Hypertension",
      "general_advice": "Rest and low salt diet",
      "medicines": [
        {
          "medicine_name": "Amlodipine",
          "dosage": "5mg",
          "frequency": "Once daily",
          "duration": "30 days",
          "instructions": "Morning after breakfast"
        }
      ]
    }
    ```
- `GET /prescriptions/<id>/` (Protected)
  - Detailed single prescription view with medicine schedules.

### 4. Communication Endpoints
- `GET /communication/conversations/` (Protected)
  - Returns active chat threads.
- `POST /communication/conversations/` (Protected)
  - Body: `{ "user_id": <id> }`
- `GET /communication/conversations/<id>/` (Protected)
  - Fetches message log and marks incoming messages as read.
- `POST /communication/conversations/<id>/` (Protected)
  - Body: `{ "content": "Hello Doctor" }`

### 5. Billing & Payments Endpoints
- `GET /billing/invoices/` (Protected)
  - Lists invoices for patient or doctor.
- `GET /billing/invoices/<id>/` (Protected)
  - In-depth invoice details.
- `POST /billing/invoices/<id>/pay/` (Protected - Patient only)
  - Body: `{ "payment_method": "UPI" | "CARD" | "NETBANKING" | "SIMULATED" }`
  - Marks invoice as PAID and generates transaction ID record.
- `GET /billing/payments/` (Protected)
  - Payment audit trail.
