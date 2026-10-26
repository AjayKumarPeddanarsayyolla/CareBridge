# CareBridge — Full-Stack Quality & Architectural Audit

**Date:** October 2026  
**Auditor:** Senior Full-Stack Architect & Healthcare Product Specialist  
**Application:** CareBridge Telehealth & Family Support Platform  

---

## 1. Executive Summary

This audit assesses the current state of CareBridge across user experience, layout hierarchy, appointment booking, payment infrastructure, database integrity, and automated test coverage. While the backend has been migrated to PostgreSQL with Prisma and the local AI RAG service operates reliably, several critical product and architectural gaps were identified that prevent CareBridge from functioning as an enterprise-grade healthcare management platform.

---

## 2. Key Audit Findings

### A. Navigation & Layout Architecture (High Severity)
- **Monolithic Navbar & Footer:** A single shared `Navbar.jsx` and `Footer.jsx` were mounted globally at the top and bottom of `App.jsx`.
- **Public Header Leakage:** Doctors, administrators, patients, and guardians viewing their internal clinical dashboards saw the public marketing header ("Doctors", "First Aid", "How It Works") and marketing footer.
- **Inadequate Role Separation:** Navigational links were hidden using scattered inline conditions (`user?.role === 'PATIENT'`), creating visual clutter and inconsistent mobile behavior.
- **Missing Dedicated Layouts:** No formal layout wrappers existed for `PublicLayout`, `PatientLayout`, `DoctorLayout`, `GuardianLayout`, `AdminLayout`, or `MinimalLayout` (for checkout/auth).

### B. Appointment Booking & Payment Workflow (High Severity)
- **Hardcoded Frontend Time Slots:** `AppointmentsPage.jsx` hardcoded time slots (`09:00 - 09:30`, etc.) instead of reading live doctor schedule availability from backend availability tables.
- **Zero Payment Infrastructure:** The appointment booking endpoint immediately created `REQUESTED` appointments with no financial transaction, fee calculation, payment order, or checkout workflow.
- **Missing Payment Schema:** The Prisma schema lacked models for `PaymentOrder`, `PaymentAttempt`, `PaymentEvent`, and refund tracking.
- **No Provider Abstraction:** Neither local simulated payments nor Razorpay test-mode integration was implemented.

### C. Design System & Accessibility (Medium Severity)
- **Visual Inconsistency:** Several views lacked unified spacing tokens, consistent card elevation, and standard healthcare color tokens.
- **Touch Target & Mobile Viewports:** Some table structures in doctor and admin views caused horizontal scrolling on narrow viewports (<375px).
- **Badge & Status Variations:** Appointment and case status badges used disparate styling across patient and doctor views.

### D. Data Consistency & Concurrency (Medium Severity)
- **Doctor Availability vs. Booking State:** When booking appointments, doctor availability windows need to be reflected in slot generation, and held slots during checkout require deterministic state transitions (`PENDING_PAYMENT` -> `CONFIRMED` or `EXPIRED`).

---

## 3. Remediation Roadmap

1. **Design System:** Formalize healthcare design tokens (Deep Teal `#0D9488`, Slate surfaces, status alerts) and create reusable components (`docs/design-system.md`).
2. **Layout Engine:** Implement route-specific layouts (`PublicLayout`, `PatientLayout`, `DoctorLayout`, `GuardianLayout`, `AdminLayout`, `MinimalLayout`) with distinct headers and footers (`docs/role-navigation-matrix.md`).
3. **Database Schema:** Extend `schema.prisma` with `PaymentOrder`, `PaymentAttempt`, `PaymentEvent`, and `RefundRecord` linked to `Appointment` and `User`.
4. **Payment Engine:** Implement provider-independent payment service supporting:
   - Local Deterministic Simulation (Success, Failure, Pending, Duplicate Callback)
   - Razorpay Test Gateway with HMAC-SHA256 signature verification
5. **Guided 6-Step Booking:** Rebuild patient booking workflow with dynamic backend availability and dedicated checkout interface.
6. **Automated Verification:** Create end-to-end test suites verifying navigation isolation, booking concurrency, payment states, and security.
