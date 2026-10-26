import express from 'express';
import {
  getFirstAidGuides,
  getFirstAidGuideByIdOrSlug
} from '../controllers/firstAidController.js';

const router = express.Router();

router.get('/', getFirstAidGuides);
router.get('/:slugOrId', getFirstAidGuideByIdOrSlug);

export default router;
