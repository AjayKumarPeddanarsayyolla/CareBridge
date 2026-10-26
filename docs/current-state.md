# CareBridge — Current State Assessment & Codebase Audit

**Date:** October 2026  
**Auditor:** Senior Full-Stack Architect & Security Specialist  
**Status:** Milestone 1 Completed

---

## 1. Executive Summary

An exhaustive audit of the initial **CareBridge** codebase extracted from `CareBridge.zip` was conducted. The project was initially structured as a traditional MERN-stack prototype (MongoDB, Express, React, Node.js). 

While the existing prototype provided foundational UI views for patients, doctors, and basic family access, it relied strictly on MongoDB/Mongoose, lacked transactional guarantees, lacked double-booking prevention, had no durable Emergency SOS workflow, lacked a local AI/RAG backend, and possessed security vulnerabilities in authorization and data isolation.

This audit establishes the baseline and defines the required migrations to achieve the production-grade PostgreSQL + Prisma + FastAPI architecture specified in the CareBridge Master Specification.

---

## 2. Directory Structure & Inventory

```
CareBridge/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable common UI (Navbar, Footer, EmergencyBanner, ChatbotWidget)
│   │   ├── context/            # AuthContext, NotificationContext, SocketContext
│   │   ├── pages/
│   │   │   ├── admin/          # AdminDashboard, AuditLogs, DoctorVerification, UserManagement
│   │   │   ├── doctor/         # DoctorAppointments, DoctorCaseDetails, DoctorDashboard, DoctorProfile
│   │   │   ├── family/         # FamilyDashboard
│   │   │   ├── patient/        # AppointmentsPage, CaseDetails, FamilyAccess, MedicalReports, MyCases, etc.
│   │   │   └── public/         # Home, About, DoctorsDirectory, FirstAidDirectory, EmergencyInfo, Login, Register
│   │   └── services/           # Axios API services
├── server/                     # Node.js + Express backend
│   ├── config/                 # db.js (MongoDB), jwt.js, upload.js
│   ├── controllers/            # 12 Mongoose-based controllers
│   ├── middleware/             # authMiddleware, roleMiddleware, rateLimiter, errorMiddleware
│   ├── models/                 # 15 Mongoose Schema models
│   ├── routes/                 # Express API routes
│   ├── services/               # doctorMatchingService, socketService, triageService
│   ├── tests/                  # api.test.js (basic script-based tests)
│   └── utils/                  # seedData.js (MongoDB-specific seeder)
└── docs/                       # Architectural and technical documentation (New)
```

---

## 3. Discovered Vulnerabilities & Architecture Gaps

| Area | Discovered State | Required State (Target Specification) | Risk / Severity |
| :--- | :--- | :--- | :--- |
| **Database Persistence** | Strictly MongoDB with Mongoose ODM in `server/config/db.js` and all models. | PostgreSQL 18 with Prisma ORM, migrations, ACID transactions, and relational constraints. | **CRITICAL** (Hard requirement) |
| **Concurrency & Double Booking** | Appointments booked with uncoordinated `Appointment.create()` in `appointmentController.js`. Prone to race-condition collisions. | PostgreSQL database-level unique constraints and transactional serialization for slot reservation. | **HIGH** |
| **Emergency SOS** | `emergencyController.js` only returns a static list of hotlines (`EmergencyWarning`). No SOS trigger, persistent alert, outbox, recipient notifications, or acknowledgment. | Persistent `EmergencyAlert` model, outbox pattern, recipient delivery statuses (`QUEUED`, `SIMULATED`, `SENT`, `FAILED`, `ACKNOWLEDGED`), audit events, and simulation indicator. | **HIGH** |
| **AI Assistant** | Only a client-side mock chatbot (`ChatbotWidget.jsx`) providing hardcoded replies with no backend AI service. | Python FastAPI service with local LLM (Ollama/sentence-transformers) + RAG document ingestion + fallback handler. | **HIGH** |
| **Guardian & Consent** | Basic `FamilyRelationship` with static booleans; no invitation workflow, no token expiration, no consent revocation audit. Role named `FAMILY_MEMBER`. | `GUARDIAN` role, expiring `GuardianInvitation`, granular `GuardianPermission` (appointments, records, prescriptions, SOS), audit trails. | **HIGH** |
| **Medical Records & Prescriptions** | Multer uploads saved with arbitrary paths; no discrete Prescription model; consultation notes stored inside loose strings. | Dedicated `MedicalRecord`, `Prescription`, and `ConsultationNote` entities with strict ownership and authorized streaming. | **MEDIUM** |
| **Authentication & Tokens** | JWT stored in client memory/localStorage. No refresh token rotation or server-side session invalidation. | Secure HTTP cookies or hardened bearer token with session expiration handling and rate-limited endpoints. | **MEDIUM** |
| **Role Alignment** | Uses `FAMILY_MEMBER`. | Master prompt specifies four standardized roles: `PATIENT`, `DOCTOR`, `GUARDIAN`, `ADMIN`. | **MEDIUM** |

---

## 4. Retained & Adaptable Components

1. **Frontend Layout & Design System:**
   - Existing Tailwind styling and responsive layout in React.
   - Comprehensive page routes across Public, Patient, Doctor, Guardian, and Admin sections.
2. **Clinical Triage Logic:**
   - Symptom-to-specialization mapping rules in `server/services/triageService.js` and `doctorMatchingService.js` are clinically sound and will be adapted to query PostgreSQL.
3. **First-Aid Reference Content:**
   - High-quality clinical guides for burns, choking, fractures, and stroke signs will be retained and migrated to PostgreSQL `FirstAidGuide` and RAG knowledge base.
4. **Real-time WebSockets:**
   - `socketService.js` Socket.IO architecture will be preserved as an enhancement for real-time notifications while maintaining database persistence.

---

## 5. Next Steps for Milestone 2

- Initialize Prisma in `server/prisma/schema.prisma`.
- Map the comprehensive relational schema to PostgreSQL.
- Execute initial migrations against local PostgreSQL database `carebridge`.
- Implement a Prisma-based seed script (`server/prisma/seed.js`) generating rich synthetic clinical demo data.
