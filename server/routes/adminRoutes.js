import express from 'express';
import {
  getAdminStats,
  getPendingDoctors,
  verifyDoctor,
  rejectDoctor,
  getAllUsers,
  toggleUserStatus,
  createFirstAidGuide,
  updateFirstAidGuide,
  deleteFirstAidGuide,
  getAuditLogs,
  getClientDetails,
  getGuardianDetails,
  getDoctorDetails
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRoles('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/verify', verifyDoctor);
router.put('/doctors/:id/reject', rejectDoctor);

router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);

router.post('/first-aid', createFirstAidGuide);
router.put('/first-aid/:id', updateFirstAidGuide);
router.delete('/first-aid/:id', deleteFirstAidGuide);

router.get('/audit-logs', getAuditLogs);

// Client (patient) & guardian details
router.get('/clients', getClientDetails);
router.get('/guardians', getGuardianDetails);
router.get('/doctors/details', getDoctorDetails);

export default router;
