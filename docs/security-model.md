# CareBridge — Comprehensive Security & Privacy Model

**Classification:** Clinical Systems Security Standard  
**Compliance Scope:** Privacy-by-Design, RBAC, ABAC, and Consent Governance

---

## 1. Threat Model & Security Principles

Healthcare applications manage Protected Health Information (PHI) and critical life-safety signals. CareBridge enforces a zero-trust, defense-in-depth model built on five core tenets:

1. **Principle of Least Privilege:** Users only access records explicitly necessary for their role and clinical or consent relationship.
2. **Explicit Patient Sovereignty:** No guardian, family member, or third party receives access to patient records without explicit, revocable patient consent.
3. **Server-Side Authorization Boundary:** Frontend UI controls are treated as untrusted hints. Every API endpoint enforces role and ownership checks server-side.
4. **Separation of Emergency Notification from Clinical Records:** Triggering an SOS alert notifies verified emergency contacts and guardians of patient distress and coordinates assistance *without* leaking private diagnostic or prescription history.
5. **No Medical Data Leakage in Logs:** HTTP access logs, debugging consoles, and error payloads strictly sanitize passwords, JWT tokens, and clinical notes.

---

## 2. Authentication & Credential Security

- **Password Hashing:** Passwords hashed with `bcrypt` (work factor 10+) with transition path to Argon2id.
- **Authentication Tokens:** JSON Web Tokens (JWT) signed with HMAC-SHA256 using server-side secrets (`JWT_SECRET`).
- **Session & Token Expiry:** Short-lived tokens with explicit timestamp validation.
- **Brute-Force & Denial-of-Service Defense:**
  - Strict rate limiting via `express-rate-limit` on `/api/auth/login` and `/api/auth/register` (max 10 requests per 15 minutes per IP).
  - General API rate limiting (max 500 requests per 15 minutes).
- **Public Administrator Protection:** Public registration can NEVER create an `ADMIN` account. Any attempt to register with `role: "ADMIN"` is rejected by server-side schema validation. Administrator provisioning occurs solely through dedicated seeding or CLI operations.

---

## 3. Authorization & Access Control

CareBridge combines **Role-Based Access Control (RBAC)** with **Attribute-Based Access Control (ABAC)**:

| Role | Permitted Actions | Prohibited Actions |
| :--- | :--- | :--- |
| **PATIENT** | View own profile, manage own appointments, submit clinical concerns, upload/view own medical records, invite guardians, configure granular permissions, trigger Emergency SOS. | Access another patient's medical records; access doctor consultation queue; access administrative logs. |
| **DOCTOR** | View assigned cases, manage personal schedule/availability, approve/reschedule appointments, create consultation notes & prescriptions for assigned patients. | Browse unassigned patients' medical records; elevate permissions; modify guardian grants. |
| **GUARDIAN** | View patient appointments, medical records, or prescriptions *only if explicitly granted* by the patient; receive Emergency SOS alerts. | Access records where patient consent was denied or revoked; access administrative settings; book unauthorized consultations. |
| **ADMIN** | Review doctor credentials, verify or suspend accounts, monitor system health, inspect audit logs and notification deliveries. | Unrestricted browsing of private clinical records without a legitimate audit purpose. |

### ABAC Ownership Verification Pattern
Before executing any state-modifying or data-retrieval operation on sensitive resources (such as medical reports, cases, appointments, or prescriptions), the backend service verifies:
```js
const isOwner = resource.patientId === req.user.id;
const isAssignedDoctor = resource.doctorId === req.user.id;
const isAuthorizedGuardian = await verifyGuardianPermission(req.user.id, resource.patientId, requiredPermission);

if (!isOwner && !isAssignedDoctor && !isAuthorizedGuardian && req.user.role !== 'ADMIN') {
  return res.status(403).json({ success: false, message: 'Access denied: unauthorized resource access.' });
}
```

---

## 4. Guardian Consent & Delegation Framework

1. **Expiring Cryptographic Invitation:** Patients generate an invitation with a unique, unguessable UUID token valid for 48 hours.
2. **Granular Permissions:**
   - `canViewAppointments`
   - `canBookAppointments`
   - `canViewMedicalRecords`
   - `canUploadRecords`
   - `canViewPrescriptions`
   - `canReceiveSOSAlerts`
3. **Immediate Revocation:** Patients can toggle individual permissions or revoke the entire relationship at any moment. Revocation takes effect immediately at the database layer.
4. **Audit History:** Every invitation creation, acceptance, permission change, and access attempt is committed to `AuditLog`.

---

## 5. Medical Records & Secure File Handling

- **Storage Outside Web Root:** Clinical files are stored outside the public HTTP static folder (`uploads/medical_reports/`).
- **Authenticated Streaming:** Files are never exposed via public static URLs. Endpoints require Bearer authentication and verify ownership before streaming files via `res.sendFile()`.
- **Validation:**
  - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`.
  - Maximum upload size: 10MB.
  - Sanitized filenames generated using unique UUIDs to prevent directory traversal (`../`).

---

## 6. Emergency SOS Privacy Controls

- **Intentional Activation:** UI requires confirmation or long-press to prevent accidental alarms.
- **Isolated Payload:** Recipients receive patient location, alert timestamp, and pre-configured emergency contact details. No diagnostic notes or prescription histories are bundled with the alert.
- **Recipient Acknowledgment:** Recipients authenticate to acknowledge delivery, providing real-time feedback to the patient.
- **Simulation Transparency:** In local development, SMS/Email broadcasts are visibly logged and persisted as `SIMULATED` to avoid false assurance.

---

## 7. Audit & Security Event Logging

Every security-sensitive event is persisted in PostgreSQL:
- `AuditLog`: Action name, acting user ID, target resource, timestamp, client IP, user agent.
- `SecurityEvent`: Authentication failures, privilege escalation attempts, rate limit violations.
- Records are append-only.
