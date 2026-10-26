import express from 'express';
import {
  getPatientProfile,
  updatePatientProfile,
  getDashboardSummary,
  getMedicalReports
} from '../controllers/patientController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getPatientProfile);
router.put('/profile', requireRoles('PATIENT'), updatePatientProfile);
router.get('/dashboard-summary', requireRoles('PATIENT'), getDashboardSummary);
router.get('/reports', requireRoles('PATIENT', 'GUARDIAN', 'FAMILY_MEMBER'), getMedicalReports);

export default router;
