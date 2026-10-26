import express from 'express';
import { getCaseMessages, markCaseMessagesRead } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/case/:caseId', getCaseMessages);
router.put('/case/:caseId/read', markCaseMessagesRead);
router.patch('/case/:caseId/read', markCaseMessagesRead);

export default router;
