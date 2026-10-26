import express from 'express';
import {
  submitDoctorRating,
  getDoctorRatings,
  getMyRating,
  getAllRatingsAdmin
} from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public — anyone can view ratings
router.get('/doctors/:doctorId', getDoctorRatings);

// Patient — submit / update their rating
router.post('/doctors/:doctorId', authenticateToken, requireRoles('PATIENT'), submitDoctorRating);

// Patient — get their own rating for a doctor
router.get('/doctors/:doctorId/my-rating', authenticateToken, requireRoles('PATIENT'), getMyRating);

// Admin — get all ratings
router.get('/admin/all', authenticateToken, requireRoles('ADMIN'), getAllRatingsAdmin);

export default router;
