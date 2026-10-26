import * as paymentService from '../services/paymentService.js';

/**
 * Calculate fee breakdown for doctor consultation
 * GET /api/payments/fee-estimate/:doctorId
 */
export const getFeeEstimate = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const feeDetails = await paymentService.calculateFeeBreakdown(doctorId);
    res.json({ success: true, data: feeDetails });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate checkout order for an appointment
 * POST /api/payments/create-order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { appointmentId, idempotencyKey, preferredProvider } = req.body;
    const patientId = req.user.id;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'appointmentId is required' });
    }

    const result = await paymentService.createPaymentOrder({
      appointmentId,
      patientId,
      idempotencyKey,
      preferredProvider
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify payment callback
 * POST /api/payments/verify
 */
export const verifyPaymentResult = async (req, res, next) => {
  try {
    const { orderId, providerPaymentId, signature, scenario } = req.body;
    const patientId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const result = await paymentService.verifyPayment({
      orderId,
      patientId,
      providerPaymentId,
      signature,
      scenario
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Ingest provider webhooks
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-carebridge-signature'];
    const eventId = req.headers['x-razorpay-event-id'] || `wh_evt_${Date.now()}`;
    const eventType = req.body?.event || req.body?.eventType || 'payment.captured';

    const result = await paymentService.handleWebhookEvent({
      eventId,
      eventType,
      payload: req.body,
      signature
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * View consultation receipt
 * GET /api/payments/receipt/:orderId
 */
export const getReceipt = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const receipt = await paymentService.getReceiptDetails(orderId, userId);
    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient's payment history
 * GET /api/payments/my-history
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const payments = await prisma.paymentOrder.findMany({
      where: { patientId },
      include: {
        appointment: {
          select: {
            date: true,
            timeSlot: true,
            consultationMode: true,
            doctor: { select: { fullName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
