# Software Requirements Specification (SRS)
## CareConnect360 – VirtualCare Telemedicine Platform

### 1. Introduction
This document defines the functional and non-functional requirements for the CareConnect360 platform, developed as an MCA Major Project.

### 2. User Roles & Actors
1. **Patient:**
   - Register and manage personal health profile.
   - Search doctor catalog by specialization and fees.
   - Book telemedicine appointments and provide presenting symptoms.
   - Join WebRTC video consultation rooms.
   - View, download, and print electronic prescriptions.
   - Send follow-up messages to consulting physicians.
   - Review pending consultation invoices and execute simulated payments.
2. **Doctor:**
   - Maintain professional qualifications, license verification number, experience, and fees.
   - Review appointment requests: Accept, Reject, or mark as Completed.
   - Host encrypted video consultations via Jitsi Meet.
   - Create standardized e-prescriptions with multi-item medicine schedules.
   - Communicate directly with booked patients.
   - Track consultation fees and revenue history.
3. **Administrator:**
   - Supervise users, appointments, audit logs, and payments via Django Admin portal.

### 3. Functional Requirements
- **FR1 (Authentication):** Dual registration endpoints with JWT tokens (Access and Refresh). Custom password validation requiring minimum 8 characters and special characters.
- **FR2 (Appointments):** Automated slot selection, date/time assignment, and state machine transitions (PENDING -> ACCEPTED/REJECTED -> COMPLETED/CANCELLED).
- **FR3 (Video Rooms):** Automated generation of unique Jitsi room identifiers upon appointment creation. Dynamic token/room access check verifying that only the assigned patient, doctor, or admin can enter.
- **FR4 (Prescriptions):** Atomically persisted electronic prescriptions containing diagnosis, medicine names, dosages, frequencies, treatment durations, instructions, and lifestyle advice.
- **FR5 (Communication):** Bidirectional patient-doctor conversation thread with read receipt tracking and automatic polling refresh.
- **FR6 (Billing):** Automated invoice generation linked to doctor consultation fees upon booking. Simulated multi-method checkout (UPI, Cards, NetBanking).

### 4. Non-Functional Requirements
- **Security:** Passwords encrypted using PBKDF2 with SHA-256; JWT Bearer tokens for all protected API endpoints; CORS restricted to frontend domain.
- **Performance:** Optimized MySQL queries with `select_related` and `prefetch_related` avoiding N+1 queries.
- **Usability:** Responsive healthcare design with Bootstrap 5.
