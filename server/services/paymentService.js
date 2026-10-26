import crypto from 'crypto';
import { prisma } from '../config/prisma.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Base platform convenience fee (e.g. ₹50.00 = 5000 paise)
const PLATFORM_FEE_PAISE = 5000;

/**
 * Calculates server-side verified consultation fees.
 * Never trusts client-submitted pricing.
 */
export const calculateFeeBreakdown = async (doctorId) => {
  const docProfile = await prisma.doctorProfile.findUnique({
    where: { userId: doctorId },
    select: { consultationFee: true, user: { select: { fullName: true } }, specialization: true }
  });

  // Base fee in paise (default to ₹500 = 50000 paise if unset)
  const baseConsultationPaise = Math.round((docProfile?.consultationFee || 500) * 100);
  const platformFeePaise = PLATFORM_FEE_PAISE;
  const gstPaise = Math.round((baseConsultationPaise + platformFeePaise) * 0.18); // 18% GST standard in India
  const totalAmountPaise = baseConsultationPaise + platformFeePaise + gstPaise;

  return {
    doctorName: docProfile?.user?.fullName || 'Medical Specialist',
    specialization: docProfile?.specialization || 'General Consultation',
    baseConsultationPaise,
    platformFeePaise,
    gstPaise,
    totalAmountPaise,
    currency: 'INR',
    formattedTotal: `₹${(totalAmountPaise / 100).toFixed(2)}`
  };
};

/**
 * Create or retrieve an existing pending PaymentOrder for an appointment.
 */
export const createPaymentOrder = async ({ appointmentId, patientId, idempotencyKey, preferredProvider = 'SIMULATED' }) => {
  // 1. Verify appointment ownership and current status
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { id: true, fullName: true, email: true, mobile: true } },
      doctor: { select: { id: true, fullName: true } },
      payment: true
    }
  });

  if (!appointment) {
    const error = new Error('Appointment record not found');
    error.statusCode = 404;
    throw error;
  }

  if (appointment.patientId !== patientId) {
    const error = new Error('Unauthorized: You can only initiate payment for your own appointments');
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status === 'CONFIRMED' && appointment.payment?.status === 'COMPLETED') {
    const error = new Error('This appointment has already been paid and confirmed');
    error.statusCode = 400;
    throw error;
  }

  if (appointment.status === 'CANCELLED') {
    const error = new Error('Cannot pay for a cancelled appointment');
    error.statusCode = 400;
    throw error;
  }

  // 2. Check for existing pending order (Idempotency)
  if (appointment.payment && appointment.payment.status === 'PENDING') {
    return {
      order: appointment.payment,
      isExisting: true,
      message: 'Resuming active payment session'
    };
  }

  // 3. Calculate verified server fees
  const feeDetails = await calculateFeeBreakdown(appointment.doctorId);

  // 4. Determine Provider
  const useRazorpay = preferredProvider === 'RAZORPAY' && RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET;
  const provider = useRazorpay ? 'RAZORPAY' : 'SIMULATED';
  const providerOrderId = useRazorpay
    ? `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    : `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 5. Create PaymentOrder transactionally
  const paymentOrder = await prisma.$transaction(async (tx) => {
    // If an existing failed order exists, delete or replace it
    if (appointment.payment) {
      await tx.paymentOrder.delete({ where: { id: appointment.payment.id } });
    }

    const order = await tx.paymentOrder.create({
      data: {
        appointmentId,
        patientId,
        amount: feeDetails.totalAmountPaise,
        currency: 'INR',
        provider,
        providerOrderId,
        status: 'PENDING',
        idempotencyKey: idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        receiptUrl: `/receipts/${providerOrderId}`
      }
    });

    // Update appointment to PENDING_PAYMENT
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: 'PENDING_PAYMENT' }
    });

    // Record Status History
    await tx.appointmentStatusHistory.create({
      data: {
        appointmentId,
        status: 'PENDING_PAYMENT',
        reason: 'Payment order created; slot held awaiting payment confirmation',
        changedById: patientId
      }
    });

    return order;
  });

  return {
    order: paymentOrder,
    feeDetails,
    provider,
    razorpayKeyId: useRazorpay ? RAZORPAY_KEY_ID : null,
    isExisting: false
  };
};

/**
 * Verify and fulfill payment
 */
export const verifyPayment = async ({
  orderId,
  patientId,
  providerPaymentId,
  signature,
  scenario = 'SUCCESS' // For simulation: SUCCESS, FAILURE, PENDING, DUPLICATE_CALLBACK
}) => {
  const order = await prisma.paymentOrder.findUnique({
    where: { id: orderId },
    include: {
      appointment: {
        include: {
          doctor: { select: { id: true, fullName: true } },
          patient: { select: { id: true, fullName: true } }
        }
      }
    }
  });

  if (!order) {
    const error = new Error('Payment order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.patientId !== patientId) {
    const error = new Error('Unauthorized to confirm this payment order');
    error.statusCode = 403;
    throw error;
  }

  // Idempotency: If already completed, return existing receipt safely
  if (order.status === 'COMPLETED') {
    return {
      success: true,
      status: 'COMPLETED',
      alreadyProcessed: true,
      message: 'Payment has already been confirmed and processed',
      order
    };
  }

  // -------------------------------------------------------------
  // SIMULATED PROVIDER EXECUTION
  // -------------------------------------------------------------
  if (order.provider === 'SIMULATED') {
    if (scenario === 'FAILURE') {
      const failedOrder = await prisma.$transaction(async (tx) => {
        await tx.paymentAttempt.create({
          data: {
            orderId: order.id,
            status: 'FAILED',
            errorCode: 'SIMULATED_DECLINE',
            errorMessage: 'Simulated banking decline: Insufficient balance or issuer timeout',
            scenario: 'FAILURE',
            rawResponse: { simulated: true, timestamp: new Date().toISOString() }
          }
        });

        return tx.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: 'FAILED',
            failureReason: 'Simulated card decline by issuing bank'
          }
        });
      });

      return {
        success: false,
        status: 'FAILED',
        message: 'Payment failed: The card or UPI bank declined the transaction [SIMULATION TEST]',
        order: failedOrder
      };
    }

    if (scenario === 'PENDING') {
      await prisma.paymentAttempt.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          errorCode: 'SIMULATED_AWAITING_AUTH',
          errorMessage: 'Transaction awaiting bank clearing settlement',
          scenario: 'PENDING'
        }
      });

      return {
        success: true,
        status: 'PENDING',
        message: 'Payment authorization pending. Your appointment slot will be held while your bank processes the transfer.',
        order
      };
    }

    // Default: SUCCESS SCENARIO
    const generatedPaymentId = providerPaymentId || `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const completed = await prisma.$transaction(async (tx) => {
      // 1. Record Attempt
      await tx.paymentAttempt.create({
        data: {
          orderId: order.id,
          providerPaymentId: generatedPaymentId,
          status: 'COMPLETED',
          scenario: 'SUCCESS',
          rawResponse: {
            simulated: true,
            provider: 'CAREBRIDGE_LOCAL_SIMULATION',
            verifiedAt: new Date().toISOString()
          }
        }
      });

      // 2. Mark PaymentOrder as COMPLETED
      const updatedOrder = await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          providerPaymentId: generatedPaymentId,
          receiptUrl: `/receipts/${order.providerOrderId}`
        }
      });

      // 3. Confirm the Appointment
      await tx.appointment.update({
        where: { id: order.appointmentId },
        data: {
          status: 'CONFIRMED'
        }
      });

      // 4. Log Appointment State Transition
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: order.appointmentId,
          status: 'CONFIRMED',
          reason: `Payment verified via ${order.provider} (${generatedPaymentId})`,
          changedById: patientId
        }
      });

      // 5. In-app notifications
      await tx.notification.create({
        data: {
          userId: patientId,
          type: 'APPOINTMENT',
          title: 'Consultation Confirmed & Paid',
          message: `Your appointment with Dr. ${order.appointment.doctor.fullName} on ${order.appointment.date.toISOString().split('T')[0]} at ${order.appointment.timeSlot} is confirmed.`,
          metadata: { appointmentId: order.appointmentId, orderId: order.id }
        }
      });

      await tx.notification.create({
        data: {
          userId: order.appointment.doctorId,
          type: 'APPOINTMENT',
          title: 'New Paid Appointment Scheduled',
          message: `Patient ${order.appointment.patient.fullName} has booked and confirmed consultation for ${order.appointment.date.toISOString().split('T')[0]} at ${order.appointment.timeSlot}.`,
          metadata: { appointmentId: order.appointmentId, orderId: order.id }
        }
      });

      return updatedOrder;
    });

    return {
      success: true,
      status: 'COMPLETED',
      order: completed,
      message: 'Payment confirmed successfully! Your appointment has been scheduled and confirmed.'
    };
  }

  // -------------------------------------------------------------
  // RAZORPAY GATEWAY SIGNATURE VERIFICATION
  // -------------------------------------------------------------
  if (order.provider === 'RAZORPAY') {
    if (!signature || !providerPaymentId) {
      const error = new Error('Missing Razorpay payment ID or cryptographic signature');
      error.statusCode = 400;
      throw error;
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${order.providerOrderId}|${providerPaymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      await prisma.paymentAttempt.create({
        data: {
          orderId: order.id,
          providerPaymentId,
          status: 'FAILED',
          errorCode: 'INVALID_SIGNATURE',
          errorMessage: 'Cryptographic HMAC signature mismatch',
          scenario: 'TAMPER_DETECTED'
        }
      });

      const error = new Error('Invalid payment signature. Transaction rejected for security integrity.');
      error.statusCode = 400;
      throw error;
    }

    // Valid Razorpay Signature — Fulfill
    const completed = await prisma.$transaction(async (tx) => {
      await tx.paymentAttempt.create({
        data: {
          orderId: order.id,
          providerPaymentId,
          status: 'COMPLETED',
          rawResponse: { provider: 'RAZORPAY_GATEWAY', verifiedAt: new Date().toISOString() }
        }
      });

      const updatedOrder = await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          providerPaymentId
        }
      });

      await tx.appointment.update({
        where: { id: order.appointmentId },
        data: { status: 'CONFIRMED' }
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: order.appointmentId,
          status: 'CONFIRMED',
          reason: `Razorpay payment verified: ${providerPaymentId}`,
          changedById: patientId
        }
      });

      return updatedOrder;
    });

    return {
      success: true,
      status: 'COMPLETED',
      order: completed,
      message: 'Razorpay payment verified and consultation confirmed!'
    };
  }

  throw new Error(`Unsupported payment provider: ${order.provider}`);
};

/**
 * Handle incoming webhooks (Razorpay or simulated)
 */
export const handleWebhookEvent = async ({ eventId, eventType, payload, signature }) => {
  // 1. Idempotency check: if event already processed, acknowledge without re-running
  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { eventId }
  });

  if (existingEvent) {
    return { success: true, duplicate: true, message: 'Webhook event already processed' };
  }

  // 2. Signature verification if webhook secret configured
  if (RAZORPAY_WEBHOOK_SECRET && signature) {
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');

    if (expected !== signature) {
      const error = new Error('Invalid webhook signature');
      error.statusCode = 400;
      throw error;
    }
  }

  const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
  const providerOrderId = parsedPayload?.payload?.payment?.entity?.order_id || parsedPayload?.orderId;

  if (!providerOrderId) {
    return { success: false, message: 'Webhook missing associated order identifier' };
  }

  const order = await prisma.paymentOrder.findUnique({
    where: { providerOrderId }
  });

  if (!order) {
    return { success: false, message: 'No matching internal order found for webhook' };
  }

  // 3. Persist Event Log
  await prisma.paymentEvent.create({
    data: {
      orderId: order.id,
      eventId,
      eventType,
      payload: parsedPayload
    }
  });

  // 4. State updates based on event type
  if (eventType === 'payment.captured' && order.status !== 'COMPLETED') {
    const paymentId = parsedPayload?.payload?.payment?.entity?.id || 'pay_wh_' + Date.now();
    await verifyPayment({
      orderId: order.id,
      patientId: order.patientId,
      providerPaymentId: paymentId,
      signature: null,
      scenario: 'SUCCESS'
    });
  } else if (eventType === 'payment.failed') {
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { status: 'FAILED', failureReason: 'Webhook reported payment failure' }
    });
  }

  return { success: true, processed: true };
};

/**
 * Retrieve patient's payment receipt
 */
export const getReceiptDetails = async (orderId, userId) => {
  const order = await prisma.paymentOrder.findUnique({
    where: { id: orderId },
    include: {
      appointment: {
        include: {
          doctor: {
            select: {
              fullName: true,
              email: true,
              doctorProfile: { select: { specialization: true, hospitalAffiliation: true, licenseNumber: true } }
            }
          },
          patient: { select: { fullName: true, email: true, mobile: true } }
        }
      },
      attempts: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!order) {
    const error = new Error('Receipt not found');
    error.statusCode = 404;
    throw error;
  }

  // Allow patient, assigned doctor, or admin to view receipt
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (order.patientId !== userId && order.appointment.doctorId !== userId && user?.role !== 'ADMIN') {
    const error = new Error('Unauthorized to view this transaction receipt');
    error.statusCode = 403;
    throw error;
  }

  return {
    orderId: order.id,
    providerOrderId: order.providerOrderId,
    providerPaymentId: order.providerPaymentId,
    amountPaise: order.amount,
    formattedAmount: `₹${(order.amount / 100).toFixed(2)}`,
    currency: order.currency,
    status: order.status,
    provider: order.provider,
    date: order.createdAt,
    doctor: {
      name: order.appointment.doctor.fullName,
      specialization: order.appointment.doctor.doctorProfile?.specialization || 'Clinical Specialist',
      hospital: order.appointment.doctor.doctorProfile?.hospitalAffiliation,
      licenseNumber: order.appointment.doctor.doctorProfile?.licenseNumber
    },
    patient: {
      name: order.appointment.patient.fullName,
      email: order.appointment.patient.email,
      mobile: order.appointment.patient.mobile
    },
    appointment: {
      id: order.appointmentId,
      date: order.appointment.date,
      timeSlot: order.appointment.timeSlot,
      mode: order.appointment.consultationMode
    }
  };
};
