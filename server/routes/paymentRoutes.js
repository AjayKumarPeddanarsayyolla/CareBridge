import express from 'express';
import {
  getFeeEstimate,
  createOrder,
  verifyPaymentResult,
  handleWebhook,
  getReceipt,
  getMyPayments
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Authenticated fee estimation
router.get('/fee-estimate/:doctorId', getFeeEstimate);

// Protected routes (Patient)
router.post('/create-order', authenticateToken, createOrder);
router.post('/verify', authenticateToken, verifyPaymentResult);
router.get('/receipt/:orderId', authenticateToken, getReceipt);
router.get('/my-history', authenticateToken, getMyPayments);

// Webhook endpoint (Raw / Signed, no bearer token)
router.post('/webhook', handleWebhook);

export default router;
