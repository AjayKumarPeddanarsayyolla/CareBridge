import express from 'express';
import {
  getVerifiedDoctors,
  getDoctorById,
  getDoctorDashboardSummary,
  acceptCase,
  provideGuidance,
  updateDoctorProfile
} from '../controllers/doctorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles, requireVerifiedDoctor } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getVerifiedDoctors);
router.get('/:id', getDoctorById);

// Protected doctor routes
router.use(authenticateToken);
router.get('/portal/dashboard-summary', requireRoles('DOCTOR'), getDoctorDashboardSummary);
router.put('/portal/profile', requireRoles('DOCTOR'), updateDoctorProfile);
router.post('/cases/:caseId/accept', requireRoles('DOCTOR'), requireVerifiedDoctor, acceptCase);
router.post('/cases/:caseId/guidance', requireRoles('DOCTOR'), requireVerifiedDoctor, provideGuidance);

export default router;
