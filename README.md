# CareBridge — Comprehensive Healthcare Support & Doctor Consultation Platform

CareBridge is a modern, secure, and responsive full-stack healthcare management platform connecting **Patients**, **Doctors**, **Guardians**, and **Administrators**. It integrates a normalized PostgreSQL database managed by Prisma ORM, strict role-based access control (RBAC), double-booking prevention, emergency SOS alert tracking with simulated outbox dispatch, and a local Python FastAPI AI/RAG healthcare assistant grounded in approved medical literature.

> [!IMPORTANT]
> **Clinical Safety & Legal Disclaimers**
> - **Informational Only:** CareBridge is an informational tool and does **NOT** diagnose diseases or substitute for in-person physical clinical examinations.
> - **Emergency Protocols:** In acute red-flag scenarios (severe chest pain, difficulty breathing, stroke symptoms, loss of consciousness, uncontrolled bleeding), CareBridge immediately advises contacting emergency services (**911** in US/Canada, **112** in EU/India, **999** in UK).
> - **Prescriptions & Controlled Substances:** Online prescription of controlled substances is explicitly disabled to comply with international telehealth standards.

---

## 1. System Architecture

```
                                  ┌────────────────────────┐
                                  │   React + Vite Client  │
                                  │  (Port 5173 / Tailwind)│
                                  └───────────┬────────────┘
                                              │ REST / WebSocket
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
       ┌────────────────────────────┐                  ┌────────────────────────────┐
       │   Express.js Node API      │                  │  Python FastAPI AI Service │
       │   (Port 5000 / JWT Auth)   │                  │  (Port 8000 / RAG & Safety)│
       └──────────────┬─────────────┘                  └──────────────┬─────────────┘
                      │ Prisma ORM                                    │ Ingest & Embed
                      ▼                                               ▼
       ┌────────────────────────────┐                  ┌────────────────────────────┐
       │     PostgreSQL 18 DB       │                  │   Approved Medical Docs    │
       │   30 Relational Tables     │                  │  (Red Cross, NHS, St John) │
       │  Unique Slot Constraints   │                  └────────────────────────────┘
       └────────────────────────────┘
```

---

## 2. Technology Stack

- **Frontend:**
  - React 18 with Vite
  - Tailwind CSS & Modern Clean Healthcare Design System
  - React Router v6
  - Lucide React Icons
  - Axios HTTP Client
  - Socket.IO Client for real-time messaging
- **Backend:**
  - Node.js & Express.js (ES Modules)
  - Prisma ORM 5.22
  - PostgreSQL 18 Relational Database (100% active persistence layer)
  - JWT Authentication & bcryptjs password hashing
  - Helmet, CORS, and Express Rate Limiter
  - Concurrency collision & double-booking prevention (`@@unique([doctorId, date, timeSlot])`)
- **AI Service:**
  - Python 3.12+ with FastAPI & Uvicorn
  - Retrieval-Augmented Generation (RAG) pipeline
  - Deterministic Safety Guard for red-flag symptoms
  - Transparent fallback when Ollama or local LLM runtime is offline
  - Approved medical knowledge base (Burns, Sprains, CPR, First Aid)
- **Quality & Testing:**
  - Automated test runner covering Auth, Healthcare Workflows, SOS, and AI/RAG (`npm test`)

---

## 3. Demo Accounts & Test Credentials

All accounts are pre-seeded in the database via Prisma:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Administrator | `admin@carebridge.com` | `Admin@123` | Full administrative privileges, audit logs, doctor approvals |
| **Doctor** | Dr. Sarah Jenkins | `dr.sarah@carebridge.com` | `Doctor@123` | Specialization: **Cardiology** (License: `MD-CARD-10928`) |
| **Doctor** | Dr. Marcus Chen | `dr.marcus@carebridge.com` | `Doctor@123` | Specialization: **Dermatology** (License: `MD-DERM-44910`) |
| **Doctor** | Dr. Emily Rodriguez | `dr.emily@carebridge.com` | `Doctor@123` | Specialization: **General Medicine** (License: `MD-GEN-89102`) |
| **Patient** | John Doe | `john.doe@carebridge.com` | `Patient@123` | Active case, hypertension history, emergency contacts |
| **Patient** | Sarah Smith | `sarah.smith@carebridge.com` | `Patient@123` | Linked to guardian David Smith |
| **Patient** | Robert Johnson | `robert.j@carebridge.com` | `Patient@123` | General health profile |
| **Guardian** | Mary Doe | `mary.doe@carebridge.com` | `Family@123` | Authorized caregiver for John Doe |
| **Guardian** | David Smith | `david.smith@carebridge.com` | `Family@123` | Authorized caregiver for Sarah Smith |

---

## 4. Local Setup & Running Instructions

### Prerequisites
1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v15+) running locally (Default port `5432`)
3. **Python** (v3.10+) for the local AI service

### Step 1: Configure Environment Variables

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/carebridge?schema=public"
JWT_SECRET=super_secret_jwt_key_carebridge_development_2026
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
```

### Step 2: Database Migration & Seeding
From the `server/` directory:
```bash
cd server
npm install

# Push schema directly to PostgreSQL
npx prisma db push

# Populate synthetic demonstration data
npm run seed
```

### Step 3: Start the Backend Server
```bash
cd server
npm start
# Server listens on http://localhost:5000
```

### Step 4: Start the Local AI Service
In a separate terminal:
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# AI service listens on http://127.0.0.1:8000
```

### Step 5: Start the React Frontend
In a third terminal:
```bash
cd client
npm install
npm run dev
# Vite runs on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## 5. Automated Testing

Run the complete test suite verifying Auth, Healthcare Workflows, Concurrency, SOS, and AI:

```bash
cd server
npm test
```

Expected output:
```
====================================================
  CAREBRIDGE MASTER AUTOMATED TEST RUNNER
  Testing Auth, Workflows, Concurrency, SOS, and AI
====================================================
>>> Executing Test Suite: auth_security.test.js
  ✔ [PASS] Health endpoint returns 200 OK
  ✔ [PASS] Patient login succeeds with JWT and PATIENT role
  ✔ [PASS] Doctor login succeeds with JWT and DOCTOR role
  ✔ [PASS] Guardian login succeeds with JWT and GUARDIAN role
  ✔ [PASS] Admin login succeeds with JWT and ADMIN role
  ...
>>> Executing Test Suite: healthcare_workflows.test.js
  ✔ [PASS] Case created with rule-based triage: matched Cardiology
  ✔ [PASS] Initial appointment booked successfully for slot 10:00 - 10:30
  ✔ [PASS] Double booking correctly prevented with status 400 (Conflict)
  ...
>>> Executing Test Suite: emergency_sos.test.js
  ✔ [PASS] Emergency warnings returned 4 international hotline regions
  ✔ [PASS] Emergency SOS created with status ACTIVE
  ✔ [PASS] Outbox delivery logged with status: SIMULATED on channel: SIMULATED_SMS
  ...
>>> Executing Test Suite: ai_rag.test.js
  ✔ [PASS] Emergency symptoms immediately triggered safety directive
  ✔ [PASS] Sprain query correctly retrieved R.I.C.E. protocol from knowledge base
  ✔ [PASS] Out-of-domain query safely returned evidence_sufficient: false
====================================================
🎉 ALL TEST SUITES PASSED CLEANLY (41/41 Assertions)
====================================================
```

---

## 6. Key Features & Implementation Highlights

### 🛡️ Security & Role-Based Access Control
- Server-side role validation on every route; no relying on frontend guards alone.
- Admin privilege escalation block: registration endpoint prevents assigning `ADMIN` role.
- Secure password hashing using `bcryptjs` (salt rounds: 12).
- Sensitive fields excluded in database queries.

### 📅 Appointment Concurrency & Double-Booking Prevention
- PostgreSQL-level constraint `@@unique([doctorId, date, timeSlot])` prevents race conditions.
- Server validates doctor availability before scheduling.

### 🚨 Persistent Emergency SOS System
- Patient-initiated emergency alert persisted in PostgreSQL.
- Automatically finds authorized guardians and designated emergency contacts.
- Creates `NotificationDelivery` entries in outbox with explicit `SIMULATED` status.
- Real-time acknowledgment tracking and resolution by authorized actors.

### 🤖 Grounded Local AI & RAG Assistant
- Python FastAPI microservice querying approved clinical guidance.
- Deterministic emergency detector overrides non-clinical responses for red-flag queries.
- Transparent fallback when local LLM (Ollama) is offline, never faking AI responses.
- Displays explicit source citations (e.g. *International Red Cross*, *NHS*).

---

## 7. Documentation Index

Detailed architectural blueprints are maintained under the [`docs/`](file:///c:/Users/comra/OneDrive/Desktop/CareBridge/docs/) folder:
- [Current State Analysis](file:///c:/Users/comra/OneDrive/Desktop/CareBridge/docs/current-state.md)
- [System Architecture](file:///c:/Users/comra/OneDrive/Desktop/CareBridge/docs/architecture.md)
- [Database Design & Schema](file:///c:/Users/comra/OneDrive/Desktop/CareBridge/docs/database-design.md)
- [Security Model & Privacy Guidelines](file:///c:/Users/comra/OneDrive/Desktop/CareBridge/docs/security-model.md)
- [Implementation Plan & Verification](file:///c:/Users/comra/OneDrive/Desktop/CareBridge/docs/implementation-plan.md)

---

## 8. Free-Tier Cloud Deployment Guide

CareBridge can be deployed on free or low-cost cloud tiers:
- **Database:** Supabase or Neon (free PostgreSQL with pgvector support).
- **Backend API:** Render or Railway free/hobby tier.
- **Frontend Client:** Vercel, Netlify, or Cloudflare Pages.
- **AI Service:** Render Web Service or local host tunnel (due to CPU/RAM requirements for LLM inference).
