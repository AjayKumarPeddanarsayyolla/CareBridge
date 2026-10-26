# CareBridge — Role Navigation & Layout Architecture Matrix

**Purpose:** Eliminate shared navigation leakage and ensure distinct, role-tailored layout containers across the application.

---

## 1. Layout Types & Responsibilities

| Layout Name | Target Audience | Header Elements | Footer Type |
| :--- | :--- | :--- | :--- |
| **`PublicLayout`** | Unauthenticated visitors & public information | Logo, Home, Find Doctors, First Aid, How It Works, About, Login, Register | **Public Marketing Footer** (Full links, emergency disclaimers, platform information) |
| **`PatientLayout`** | Authenticated `PATIENT` | Logo, Dashboard, Find Doctors, Appointments, Medical Records, Health Concerns, Family Access, AI Assistant, Notification Center, Profile Dropdown | **Minimal Patient Footer** (Compact status, quick emergency dial, privacy link) |
| **`DoctorLayout`** | Authenticated `DOCTOR` | Logo, Dashboard, Appointments, Patient Cases, Availability, Profile, Notifications, Account Settings | **Clinical Operations Footer** (Duty status indicator, support hotline, session timer) |
| **`GuardianLayout`** | Authenticated `GUARDIAN` / `FAMILY_MEMBER` | Logo, Dashboard, Linked Patients, Appointments, Emergency Alerts, Notifications, Profile | **Guardian Support Footer** (Consent status info, emergency assistance hotline) |
| **`AdminLayout`** | Authenticated `ADMIN` | Logo, Dashboard, User Management, Doctor Verification, First Aid CMS, Audit Logs, System Health | **Operational Audit Footer** (Version string, database connectivity indicator, audit count) |
| **`MinimalLayout`** | Checkout, Payment, Focused Auth | Logo, Secure Checkout Badge, Back Link / Cancel | **Secure Transaction Footer** (Encryption badges, PCI/RBI compliance disclaimers) |

---

## 2. Route to Layout Mapping

### A. Public Routes (`PublicLayout`)
- `/` — Public Home
- `/about` — About CareBridge
- `/how-it-works` — Platform Workflow
- `/doctors` — Public Doctor Directory
- `/doctors/:id` — Public Doctor Profile & Fee Schedule
- `/first-aid` — First-Aid Medical Directory
- `/first-aid/:slugOrId` — Clinical Guide Details
- `/emergency` — Emergency Regional Hotlines & Protocols

### B. Patient Routes (`PatientLayout`)
- `/patient` — Patient Dashboard
- `/patient/profile` — Medical Baseline & Demographics
- `/patient/submit-concern` — Guided Triage & Specialty Matching
- `/patient/cases` — Health Concern History
- `/patient/cases/:id` — Case Consultation & Doctor Notes
- `/patient/appointments` — Appointment Schedule & Booking Hub
- `/patient/family` — Guardian Access & Consent Management
- `/patient/reports` — Diagnostic Lab Reports & Documents

### C. Doctor Routes (`DoctorLayout`)
- `/doctor` — Doctor Dashboard (Today's queue, upcoming consultations)
- `/doctor/appointments` — Appointment Calendar & Approvals
- `/doctor/cases/:id` — Case Review & Prescription Writing
- `/doctor/profile` — Clinical Credentials, Specialization, Fee Setting
- `/doctor/schedule` — Availability Hours & Slot Management

### D. Guardian Routes (`GuardianLayout`)
- `/family` / `/guardian` — Guardian Dashboard (Linked dependents)
- `/family/appointments` — Permitted Dependent Appointments
- `/family/alerts` — Emergency SOS Notification Logs
- `/family/consent` — Active Consent Scopes & Permissions

### E. Administrator Routes (`AdminLayout`)
- `/admin` — System Overview & Telehealth Metrics
- `/admin/doctors/pending` — Doctor License Verification Queue
- `/admin/users` — User Account Suspension / Reactivation
- `/admin/first-aid` — First-Aid Article CMS
- `/admin/audit-logs` — Platform Security & Audit Trail

### F. Minimal / Focused Routes (`MinimalLayout`)
- `/login` — User Authentication
- `/register` — Account Registration
- `/checkout/:appointmentId` — Dedicated Payment Checkout & Gateway Processing

---

## 3. Role Normalization Rules

- Database Enum: `PATIENT`, `DOCTOR`, `GUARDIAN`, `ADMIN`.
- Backward Compatibility: `FAMILY_MEMBER` is normalized to `GUARDIAN` at the frontend context layer (`useAuth`).
- Public Guard: If an authenticated user visits `/login` or `/register`, they are redirected automatically to their role's respective dashboard.
- Private Guard: If an unauthenticated user attempts to visit `/patient`, `/doctor`, etc., they are redirected to `/login?redirect=...`.
