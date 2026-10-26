import express from 'express';
import {
  createCase,
  getCases,
  getCaseById,
  uploadCaseReport,
  downloadReport
} from '../controllers/caseController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadReport } from '../config/upload.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/:id/reports', uploadReport.single('reportFile'), uploadCaseReport);
router.get('/reports/:reportId/download', downloadReport);

export default router;
