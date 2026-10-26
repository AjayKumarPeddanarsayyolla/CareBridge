# CareBridge — Payment Integration & Transaction Architecture

**Date:** October 2026  
**Module:** Telehealth Consultation Payment & Financial Settlement  
**Design Standard:** Provider-Independent Service Architecture (India / Razorpay Ready)

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Client Checkout Interface                │
│    (Order Summary, Breakdown, Method, Scenario Choice) │
└───────────┬────────────────────────────────┬───────────┘
            │ 1. Initiate Checkout           │ 4. Submit Signature / Callback
            ▼                                ▼
┌────────────────────────────────────────────────────────┐
│             Express Backend Payment API                │
│     (Server-calculated Fee, Ownership Verification)     │
└───────────┬────────────────────────────────┬───────────┘
            │ 2. Create Order                │ 5. Verify Signature
            ▼                                ▼
┌────────────────────────────────────────────────────────┐
│             Payment Service Interface (SPI)            │
│   ┌───────────────────────┐ ┌───────────────────────┐  │
│   │  Simulated Provider   │ │  Razorpay Test Mode   │  │
│   │ (Deterministic Scen.) │ │ (HMAC-SHA256 Sign.)   │  │
│   └───────────────────────┘ └───────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ 3 & 6. Persist Order & Status
                            ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL Database (Prisma)             │
│   • PaymentOrder (Amount, Currency, Status, Provider)  │
│   • PaymentAttempt (Gate ID, Error Code, Gateway Resp) │
│   • PaymentEvent (Webhook Raw Payload, Idempotency)    │
│   • Appointment (Transitions to CONFIRMED on Success)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Payment Models & State Machine

### A. State Lifecycle

```
[INITIATED] ──────────► [PENDING] ──────────► [COMPLETED / CONFIRMED]
     │                      │
     ▼                      ▼
  [CANCELLED]            [FAILED] ──────────► [REFUNDED] (where applicable)
```

1. **`INITIATED`:** Patient enters checkout; server verifies appointment ownership and calculates fees from verified doctor profile (base fee + platform service fee).
2. **`PENDING`:** Order created on payment gateway (or simulation provider). Slot remains held for payment window (15 minutes).
3. **`COMPLETED`:** Payment signature or webhook verified on the server. Appointment status automatically transitions from `REQUESTED` / `PENDING_PAYMENT` to `CONFIRMED`.
4. **`FAILED`:** Gateway returned payment failure or user aborted. Slot released; patient prompted to retry.
5. **`REFUNDED`:** Cancelled appointment triggers refund workflow on provider.

---

## 3. Provider Configurations

### Mode 1: Local Deterministic Simulation (Default)
Operates with **zero external credentials or cost**:
- **Scenarios Supported:**
  - `SUCCESS`: Immediately completes order, generates synthetic `pay_sim_...` ID, transitions appointment to `CONFIRMED`.
  - `FAILURE`: Returns simulated bank decline (`INSUFFICIENT_FUNDS`), marks order `FAILED`.
  - `PENDING`: Simulates delayed banking authorization (e.g. UPI intent awaiting approval).
  - `DUPLICATE_CALLBACK`: Simulates duplicate webhook delivery, verifying server idempotency.
- Explicit Labeling: Every simulated receipt and order displays `[SIMULATION MODE — NO REAL FUNDS CHARGED]`.

### Mode 2: Gateway Test Mode (Razorpay Test Mode)
Activated when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are provided in `server/.env`:
- Orders created via Razorpay REST API (`POST /v1/orders`).
- Server validates `razorpay_signature` using `crypto.createHmac('sha256', secret).update(order_id + "|" + payment_id).digest('hex')`.
- Webhooks verified using `X-Razorpay-Signature`.

---

## 4. Security & Compliance Controls

1. **Zero Frontend Pricing Trust:** Amount is calculated purely on the server based on `DoctorProfile.consultationFee`. Any price submitted in request payloads is ignored.
2. **Strict Ownership Check:** Only the authenticated patient who owns the appointment can initiate or view payments.
3. **Integer Minor Units:** All monetary values stored as integers in smallest currency denomination (e.g. `50000` paise = `₹500.00`).
4. **No Sensitive Card Storage:** Raw card numbers, CVVs, and UPI PINs are never accepted or stored.
5. **Idempotent Webhooks:** `providerOrderId` and webhook event IDs enforce uniqueness in database to prevent double crediting.
