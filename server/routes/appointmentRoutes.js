import express from 'express';
import {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/status', updateAppointmentStatus);

export default router;
