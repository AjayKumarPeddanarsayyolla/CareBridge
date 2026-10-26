import express from 'express';
import {
  getFamilyMembers,
  inviteFamilyMember,
  acceptInvitation,
  updatePermissions,
  revokeRelationship,
  getLinkedPatients
} from '../controllers/familyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/members', requireRoles('PATIENT'), getFamilyMembers);
router.post('/invite', requireRoles('PATIENT'), inviteFamilyMember);
router.post('/accept-invitation', requireRoles('GUARDIAN', 'FAMILY_MEMBER', 'PATIENT'), acceptInvitation);
router.put('/permissions/:id', requireRoles('PATIENT'), updatePermissions);
router.delete('/relationship/:id', requireRoles('PATIENT'), revokeRelationship);

router.get('/linked-patients', requireRoles('GUARDIAN', 'FAMILY_MEMBER'), getLinkedPatients);

export default router;
