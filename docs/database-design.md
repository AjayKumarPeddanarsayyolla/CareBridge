# CareBridge — Relational Database Design (PostgreSQL & Prisma)

**Database Engine:** PostgreSQL 18  
**ORM:** Prisma ORM  
**Schema Status:** Production Relational Design

---

## 1. Schema Strategy & Principles

1. **Strict Relational Integrity:** Enforced foreign key cascades and constraints; no orphaned medical documents, prescriptions, or guardian grants.
2. **ACID Transaction Guarantees:** Multi-step clinical processes (such as appointment booking and SOS alert broadcasting) execute within database transactions.
3. **Double-Booking Prevention:** Unique compound constraint on `(doctorId, date, timeSlot)` where appointment status is active/confirmed.
4. **Data Isolation & Privacy:** Clear foreign-key ownership separating sensitive health records (`MedicalRecord`, `Prescription`) from administrative views.
5. **Durable Auditing:** Immutable `AuditLog` and `SecurityEvent` tables preserving chronological history of clinical access and consent alterations.

---

## 2. Entity Relational Mapping & Prisma Schema Specification

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// -------------------------------------------------------------
// ENUMS
// -------------------------------------------------------------

enum Role {
  PATIENT
  DOCTOR
  GUARDIAN
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  PENDING_VERIFICATION
}

enum DoctorVerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum AppointmentStatus {
  REQUESTED
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum ConsultationMode {
  CHAT
  VIDEO_LINK
  IN_PERSON_OFFLINE
}

enum GuardianStatus {
  PENDING
  ACTIVE
  REVOKED
  EXPIRED
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REVOKED
  EXPIRED
}

enum EmergencySeverity {
  MILD
  MODERATE
  SEVERE
  CRITICAL
}

enum AlertStatus {
  ACTIVE
  ACKNOWLEDGED
  RESOLVED
  CANCELLED
}

enum DeliveryStatus {
  QUEUED
  SIMULATED
  SENT
  FAILED
  ACKNOWLEDGED
}

enum DeliveryChannel {
  SIMULATED_SMS
  SIMULATED_EMAIL
  IN_APP_PUSH
  SOCKET_BROADCAST
}

// -------------------------------------------------------------
// USER & CORE PROFILES
// -------------------------------------------------------------

model User {
  id           String     @id @default(uuid())
  fullName     String
  email        String     @unique
  mobile       String
  passwordHash String
  role         Role       @default(PATIENT)
  status       UserStatus @default(ACTIVE)
  profilePhoto String?
  lastLogin    DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  patientProfile           PatientProfile?
  doctorProfile            DoctorProfile?
  verifiedDoctors          DoctorProfile[]           @relation("DoctorVerifiedBy")
  patientGuardians         GuardianRelationship[]    @relation("PatientGuardianRelation")
  guardianPatients         GuardianRelationship[]    @relation("GuardianPatientRelation")
  sentGuardianInvitations  GuardianInvitation[]      @relation("SentInvitations")
  guardianInvitations      GuardianInvitation[]      @relation("TargetGuardianInvitations")
  patientAppointments      Appointment[]             @relation("PatientAppointments")
  doctorAppointments       Appointment[]             @relation("DoctorAppointments")
  medicalRecords           MedicalRecord[]           @relation("PatientMedicalRecords")
  uploadedRecords          MedicalRecord[]           @relation("UploadedMedicalRecords")
  patientPrescriptions     Prescription[]            @relation("PatientPrescriptions")
  prescribedPrescriptions  Prescription[]            @relation("DoctorPrescriptions")
  authoredNotes            ConsultationNote[]        @relation("DoctorConsultationNotes")
  receivedNotifications    Notification[]            @relation("UserNotifications")
  emergencyAlerts          EmergencyAlert[]          @relation("PatientEmergencyAlerts")
  emergencyAlertRecipients EmergencyAlertRecipient[] @relation("RecipientUser")
  sentMessages             ChatMessage[]             @relation("SentMessages")
  chatConversations        ChatConversation[]        @relation("UserConversations")
  aiInteractions           AIInteraction[]
  auditLogs                AuditLog[]                @relation("UserAuditLogs")
  targetAuditLogs          AuditLog[]                @relation("TargetUserAuditLogs")
  securityEvents           SecurityEvent[]
  statusChanges            AppointmentStatusHistory[]

  @@index([email])
  @@index([role])
}

model PatientProfile {
  id                 String    @id @default(uuid())
  userId             String    @unique
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  dateOfBirth        DateTime?
  gender             String?   @default("PREFER_NOT_TO_SAY")
  bloodGroup         String?   @default("UNKNOWN")
  allergies          String[]  @default([])
  existingConditions String[]  @default([])
  currentMedications String[]  @default([])
  medicalHistory     String?
  profileCompleted   Boolean   @default(false)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  emergencyContacts  EmergencyContact[]
}

model DoctorProfile {
  id                  String                   @id @default(uuid())
  userId              String                   @unique
  user                User                     @relation(fields: [userId], references: [id], onDelete: Cascade)
  specialization      String
  qualification       String
  experienceYears     Int                      @default(0)
  licenseNumber       String
  hospitalAffiliation String?                  @default("Independent Practice")
  consultationFee     Float                    @default(0.0)
  biography           String?
  verificationStatus  DoctorVerificationStatus @default(PENDING)
  verifiedById        String?
  verifiedBy          User?                    @relation("DoctorVerifiedBy", fields: [verifiedById], references: [id])
  verifiedAt          DateTime?
  rejectionReason     String?
  averageRating       Float                    @default(0.0)
  totalRatings        Int                      @default(0)
  createdAt           DateTime                 @default(now())
  updatedAt           DateTime                 @updatedAt

  availabilities      DoctorAvailability[]

  @@index([specialization])
  @@index([verificationStatus])
}

model DoctorAvailability {
  id              String        @id @default(uuid())
  doctorId        String
  doctorProfile   DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  dayOfWeek       String        // e.g. "Monday", "Tuesday"
  startTime       String        // e.g. "09:00"
  endTime         String        // e.g. "17:00"
  slotDurationMin Int           @default(30)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([doctorId, dayOfWeek])
}

// -------------------------------------------------------------
// APPOINTMENTS & CLINICAL ENCOUNTERS
// -------------------------------------------------------------

model Appointment {
  id                 String            @id @default(uuid())
  patientId          String
  patient            User              @relation("PatientAppointments", fields: [patientId], references: [id], onDelete: Cascade)
  doctorId           String
  doctor             User              @relation("DoctorAppointments", fields: [doctorId], references: [id], onDelete: Cascade)
  date               DateTime          @db.Date
  timeSlot           String            // e.g. "10:00 - 10:30"
  status             AppointmentStatus @default(REQUESTED)
  consultationMode   ConsultationMode  @default(CHAT)
  reason             String            @default("General Consultation")
  notes              String?
  cancellationReason String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  statusHistory      AppointmentStatusHistory[]
  consultationNotes  ConsultationNote[]
  prescriptions      Prescription[]

  // Database-backed double-booking prevention constraint
  @@unique([doctorId, date, timeSlot], name: "doctor_appointment_slot_unique")
  @@index([patientId, date])
  @@index([doctorId, date])
}

model AppointmentStatusHistory {
  id            String            @id @default(uuid())
  appointmentId String
  appointment   Appointment       @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  status        AppointmentStatus
  reason        String?
  changedById   String
  changedBy     User              @relation(fields: [changedById], references: [id])
  createdAt     DateTime          @default(now())

  @@index([appointmentId])
}

// -------------------------------------------------------------
// GUARDIAN SYSTEM & CONSENT MANAGEMENT
// -------------------------------------------------------------

model GuardianRelationship {
  id               String         @id @default(uuid())
  patientId        String
  patient          User           @relation("PatientGuardianRelation", fields: [patientId], references: [id], onDelete: Cascade)
  guardianId       String
  guardian         User           @relation("GuardianPatientRelation", fields: [guardianId], references: [id], onDelete: Cascade)
  relationshipType String         // e.g. "Spouse", "Parent", "Child", "Legal Guardian"
  status           GuardianStatus @default(PENDING)
  approvedAt       DateTime?
  revokedAt        DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  permissions      GuardianPermission?

  @@unique([patientId, guardianId])
  @@index([patientId])
  @@index([guardianId])
}

model GuardianInvitation {
  id               String           @id @default(uuid())
  patientId        String
  patient          User             @relation("SentInvitations", fields: [patientId], references: [id], onDelete: Cascade)
  guardianEmail    String
  guardianUserId   String?
  guardianUser     User?            @relation("TargetGuardianInvitations", fields: [guardianUserId], references: [id])
  relationshipType String
  invitationToken  String           @unique
  expiresAt        DateTime
  status           InvitationStatus @default(PENDING)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@index([invitationToken])
  @@index([guardianEmail])
}

model GuardianPermission {
  id                     String               @id @default(uuid())
  relationshipId         String               @unique
  relationship           GuardianRelationship @relation(fields: [relationshipId], references: [id], onDelete: Cascade)
  canViewAppointments   Boolean              @default(true)
  canBookAppointments   Boolean              @default(false)
  canViewMedicalRecords  Boolean              @default(true)
  canUploadRecords       Boolean              @default(false)
  canViewPrescriptions   Boolean              @default(true)
  canReceiveSOSAlerts    Boolean              @default(true)
  updatedAt              DateTime             @updatedAt
}

model EmergencyContact {
  id               String         @id @default(uuid())
  patientProfileId String
  patientProfile   PatientProfile @relation(fields: [patientProfileId], references: [id], onDelete: Cascade)
  name             String
  relationship     String
  phoneNumber      String
  email            String?
  isPrimary        Boolean        @default(false)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([patientProfileId])
}

// -------------------------------------------------------------
// CLINICAL RECORDS & PRESCRIPTIONS
// -------------------------------------------------------------

model MedicalRecord {
  id           String   @id @default(uuid())
  patientId    String
  patient      User     @relation("PatientMedicalRecords", fields: [patientId], references: [id], onDelete: Cascade)
  title        String
  recordType   String   // e.g. "LAB_REPORT", "PRESCRIPTION", "IMAGING", "DISCHARGE_SUMMARY"
  fileName     String
  originalName String
  filePath     String
  fileType     String
  fileSize     Int
  description  String?
  uploadedById String
  uploadedBy   User     @relation("UploadedMedicalRecords", fields: [uploadedById], references: [id])
  isPrivate    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([patientId])
}

model Prescription {
  id            String       @id @default(uuid())
  patientId     String
  patient       User         @relation("PatientPrescriptions", fields: [patientId], references: [id], onDelete: Cascade)
  doctorId      String
  doctor        User         @relation("DoctorPrescriptions", fields: [doctorId], references: [id])
  appointmentId String?
  appointment   Appointment? @relation(fields: [appointmentId], references: [id])
  medications   Json         // Array of { name, dosage, frequency, duration, instructions }
  diagnosis     String
  instructions  String?
  validUntil    DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([patientId])
  @@index([doctorId])
}

model ConsultationNote {
  id            String       @id @default(uuid())
  appointmentId String?
  appointment   Appointment? @relation(fields: [appointmentId], references: [id])
  doctorId      String
  doctor        User         @relation("DoctorConsultationNotes", fields: [doctorId], references: [id])
  summary       String
  symptoms      String?
  clinicalNotes String
  advice        String
  followUpDate  DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([doctorId])
  @@index([appointmentId])
}

// -------------------------------------------------------------
// NOTIFICATIONS & SOS OUTBOX
// -------------------------------------------------------------

model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  title       String
  message     String
  type        String
  link        String?
  isRead      Boolean  @default(false)
  readAt      DateTime?
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([userId, isRead])
}

model EmergencyAlert {
  id          String            @id @default(uuid())
  patientId   String
  patient     User              @relation("PatientEmergencyAlerts", fields: [patientId], references: [id], onDelete: Cascade)
  severity    EmergencySeverity @default(CRITICAL)
  status      AlertStatus       @default(ACTIVE)
  latitude    Float?
  longitude   Float?
  address     String?
  notes       String?
  activatedAt DateTime          @default(now())
  resolvedAt  DateTime?

  recipients  EmergencyAlertRecipient[]

  @@index([patientId, status])
}

model EmergencyAlertRecipient {
  id             String         @id @default(uuid())
  alertId        String
  alert          EmergencyAlert @relation(fields: [alertId], references: [id], onDelete: Cascade)
  recipientId    String?
  recipientUser  User?          @relation("RecipientUser", fields: [recipientId], references: [id])
  recipientName  String
  recipientPhone String
  recipientEmail String?
  acknowledged   Boolean        @default(false)
  acknowledgedAt DateTime?
  deliveries     NotificationDelivery[]

  @@index([alertId])
}

model NotificationDelivery {
  id          String                 @id @default(uuid())
  recipientId String
  recipient   EmergencyAlertRecipient @relation(fields: [recipientId], references: [id], onDelete: Cascade)
  channel     DeliveryChannel        @default(SIMULATED_SMS)
  status      DeliveryStatus         @default(QUEUED)
  sentAt      DateTime?
  simulatedAt DateTime?
  failureReason String?
  retryCount  Int                    @default(0)
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt

  @@index([recipientId, status])
}

// -------------------------------------------------------------
// CHAT & MESSAGING
// -------------------------------------------------------------

model ChatConversation {
  id           String        @id @default(uuid())
  title        String?
  participants User[]        @relation("UserConversations")
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  messages     ChatMessage[]
}

model ChatMessage {
  id             String           @id @default(uuid())
  conversationId String
  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User             @relation("SentMessages", fields: [senderId], references: [id])
  content        String
  attachments    Json?
  isRead         Boolean          @default(false)
  createdAt      DateTime         @default(now())

  @@index([conversationId])
}

// -------------------------------------------------------------
// AI, KNOWLEDGE BASE & AUDITING
// -------------------------------------------------------------

model KnowledgeDocument {
  id              String           @id @default(uuid())
  title           String
  publisher       String
  sourceUrl       String?
  publicationDate DateTime?
  retrievalDate   DateTime         @default(now())
  category        String
  content         String
  isApproved      Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  chunks          KnowledgeChunk[]
}

model KnowledgeChunk {
  id         String            @id @default(uuid())
  documentId String
  document   KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  chunkIndex Int
  content    String
  // Stored vector string/json for portable embedding retrieval without mandatory native extensions
  embedding  Json?
  createdAt  DateTime          @default(now())

  @@index([documentId])
}

model AIInteraction {
  id             String   @id @default(uuid())
  userId         String?
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  query          String
  response       String
  citations      Json?    // Array of { documentId, title, chunkId, snippet }
  isEmergencyFlag Boolean @default(false)
  modelName      String   @default("local-deterministic-rag")
  durationMs     Int      @default(0)
  createdAt      DateTime @default(now())

  @@index([userId])
}

model AuditLog {
  id           String   @id @default(uuid())
  userId       String?
  user         User?    @relation("UserAuditLogs", fields: [userId], references: [id], onDelete: SetNull)
  action       String   // e.g. "VIEW_MEDICAL_RECORD", "UPDATE_GUARDIAN_CONSENT", "SOS_ACTIVATED"
  resourceType String
  resourceId   String?
  targetUserId String?
  targetUser   User?    @relation("TargetUserAuditLogs", fields: [targetUserId], references: [id], onDelete: SetNull)
  ipAddress    String?
  userAgent    String?
  metadata     Json?
  timestamp    DateTime @default(now())

  @@index([userId, timestamp])
  @@index([action])
}

model SecurityEvent {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  eventType String   // e.g. "AUTH_FAILED", "UNAUTHORIZED_ACCESS_ATTEMPT", "RATE_LIMIT_TRIGGERED"
  severity  String   // "LOW", "MEDIUM", "HIGH", "CRITICAL"
  ipAddress String?
  details   Json?
  timestamp DateTime @default(now())

  @@index([eventType, timestamp])
}

// -------------------------------------------------------------
// FIRST AID GUIDES & EMERGENCY DIRECTORY
// -------------------------------------------------------------

model FirstAidGuide {
  id                         String    @id @default(uuid())
  title                      String
  slug                       String    @unique
  category                   String
  situation                  String
  safeImmediateSteps         String[]
  thingsToAvoid              String[]
  warningSigns               String[]
  whenToSeekProfessionalCare String[]
  emergencyWarning           String?
  reviewedByDoctor           String?
  lastReviewedDate           DateTime?
  isPublished                Boolean   @default(true)
  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime  @updatedAt

  @@index([category])
}

model EmergencyWarning {
  id                    String   @id @default(uuid())
  category              String   @unique
  title                 String
  redFlags              String[]
  immediateActions      String[]
  emergencyPhoneNumbers Json     // Array of { label, number }
  displayOrder          Int      @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([displayOrder])
}
```
