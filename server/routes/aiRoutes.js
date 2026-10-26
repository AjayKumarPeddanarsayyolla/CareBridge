import express from 'express';
import { getAIHealth, getAIStatus, chatWithAI } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/health', getAIHealth);
router.get('/status', getAIStatus);
router.post('/chat', optionalAuth, chatWithAI);

export default router;
