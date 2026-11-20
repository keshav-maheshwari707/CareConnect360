# CareConnect360 – VirtualCare Telemedicine Platform
### MCA Major Project Overview

## 1. Executive Summary
CareConnect360 is a full-stack, enterprise-grade virtual care and telemedicine web application developed for patients, board-certified medical doctors, and healthcare platform administrators. It addresses the geographical and scheduling friction associated with traditional outpatient care by delivering secure, on-demand video consultations, electronic prescription workflows, direct clinical messaging, and automated consultation fee management.

## 2. Key Objectives
- **Accessibility:** Democratize access to specialized healthcare across rural and urban centers.
- **Data Integrity & Confidentiality:** Strictly enforce role-based access control (RBAC) ensuring patient health records remain confidential.
- **Real-Time Video Consultations:** Secure, low-latency video rooms leveraging WebRTC and Jitsi Meet without requiring external desktop software installations.
- **Paperless Workflow:** End-to-end digital lifecycle from appointment booking to consultation, diagnosis, digital e-prescription issuance, and instant payment receipts.

## 3. Technology Stack & Architectural Highlights
- **Backend:** Python, Django 6.x, Django REST Framework, Simple JWT (JSON Web Tokens).
- **Frontend:** React 19 / Vite, Bootstrap 5, Lucide React icons, Axios, React Router v7.
- **Database:** MySQL 8.0 relational database with strict foreign keys and transactional guarantees.
- **Testing:** Pytest, pytest-django, Django Test Suite.
