import express from 'express';
import {
  getEmergencyWarnings,
  triggerSOS,
  getActiveSOS,
  getSOSHistory,
  acknowledgeSOS,
  resolveSOS
} from '../controllers/emergencyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public: Get clinical emergency red-flags and international hotlines
router.get('/warnings', getEmergencyWarnings);

// Authenticated SOS endpoints
router.use(authenticateToken);

router.post('/sos', requireRoles('PATIENT'), triggerSOS);
router.get('/sos/active', requireRoles('PATIENT', 'GUARDIAN', 'FAMILY_MEMBER', 'ADMIN'), getActiveSOS);
router.get('/sos/history', requireRoles('PATIENT', 'GUARDIAN', 'FAMILY_MEMBER', 'ADMIN'), getSOSHistory);
router.post('/sos/:alertId/acknowledge', requireRoles('GUARDIAN', 'FAMILY_MEMBER', 'DOCTOR', 'ADMIN'), acknowledgeSOS);
router.post('/sos/:alertId/resolve', requireRoles('PATIENT', 'ADMIN'), resolveSOS);

export default router;
