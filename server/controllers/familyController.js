import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { emitToUser } from '../services/socketService.js';

// Format relationship for client compatibility
const formatRelationship = (rel) => {
  if (!rel) return null;
  const guardianUser = rel.guardian || {};
  const patientUser = rel.patient || {};
  const perms = rel.permissions || {};

  return {
    ...rel,
    _id: rel.id,
    familyMemberId: {
      ...guardianUser,
      _id: guardianUser.id
    },
    patientId: {
      ...patientUser,
      _id: patientUser.id
    },
    permissions: {
      viewMedicalHistory: perms.viewMedicalHistory ?? perms.canViewMedicalRecords ?? true,
      viewCases: perms.viewCases ?? perms.canViewMedicalRecords ?? true,
      viewAppointments: perms.viewAppointments ?? perms.canViewAppointments ?? true,
      participateChat: perms.participateChat ?? true,
      submitConcerns: perms.submitConcerns ?? perms.canUploadRecords ?? true,
      canBookAppointments: perms.canBookAppointments ?? false,
      canViewPrescriptions: perms.canViewPrescriptions ?? true,
      canReceiveSOSAlerts: perms.canReceiveSOSAlerts ?? true
    }
  };
};

// Get linked guardians/family members for the authenticated patient
export const getFamilyMembers = async (req, res, next) => {
  try {
    const relationships = await prisma.guardianRelationship.findMany({
      where: { patientId: req.user.id },
      include: {
        guardian: {
          select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true }
        },
        permissions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Also fetch pending invitations sent by this patient
    const pendingInvitations = await prisma.guardianInvitation.findMany({
      where: {
        patientId: req.user.id,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = relationships.map(formatRelationship);

    res.json({
      success: true,
      data: formatted,
      pendingInvitations: pendingInvitations.map((inv) => ({ ...inv, _id: inv.id }))
    });
  } catch (error) {
    next(error);
  }
};

// Patient invites or links a guardian
export const inviteFamilyMember = async (req, res, next) => {
  try {
    const { email, relationshipType = 'Legal Guardian', permissions } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if target user is self
    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a guardian.'
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!targetUser) {
      // Create expiring invitation for unregistered guardian
      const invitationToken = `inv_${crypto.randomBytes(16).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

      const invitation = await prisma.guardianInvitation.create({
        data: {
          patientId: req.user.id,
          guardianEmail: normalizedEmail,
          relationshipType,
          invitationToken,
          expiresAt,
          status: 'PENDING'
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Guardian invitation created. Share this invitation link with your guardian.',
        data: {
          invitation: { ...invitation, _id: invitation.id },
          invitationToken,
          inviteUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?invitation=${invitationToken}`
        }
      });
    }

    // Check if relationship already exists
    const existing = await prisma.guardianRelationship.findFirst({
      where: {
        patientId: req.user.id,
        guardianId: targetUser.id
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A guardian relationship with this user already exists.'
      });
    }

    // Create relationship & granular permissions transactionally
    const relationship = await prisma.$transaction(async (tx) => {
      const rel = await tx.guardianRelationship.create({
        data: {
          patientId: req.user.id,
          guardianId: targetUser.id,
          relationshipType,
          status: 'ACTIVE',
          approvedAt: new Date()
        },
        include: {
          guardian: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } }
        }
      });

      const perms = await tx.guardianPermission.create({
        data: {
          relationshipId: rel.id,
          canViewAppointments: permissions?.viewAppointments ?? permissions?.canViewAppointments ?? true,
          canBookAppointments: permissions?.canBookAppointments ?? false,
          canViewMedicalRecords: permissions?.viewMedicalHistory ?? permissions?.canViewMedicalRecords ?? true,
          canUploadRecords: permissions?.submitConcerns ?? permissions?.canUploadRecords ?? false,
          canViewPrescriptions: permissions?.canViewPrescriptions ?? true,
          canReceiveSOSAlerts: permissions?.canReceiveSOSAlerts ?? true,
          viewMedicalHistory: permissions?.viewMedicalHistory ?? true,
          viewCases: permissions?.viewCases ?? true,
          viewAppointments: permissions?.viewAppointments ?? true,
          participateChat: permissions?.participateChat ?? true,
          submitConcerns: permissions?.submitConcerns ?? true
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'GUARDIAN_LINKED',
          resourceType: 'GuardianRelationship',
          resourceId: rel.id,
          targetUserId: targetUser.id,
          metadata: { relationshipType, permissions: perms }
        }
      });

      return { ...rel, permissions: perms };
    });

    // Notify guardian
    const notification = await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'FAMILY_INVITE',
        title: 'Guardian Care Access Granted',
        message: `${req.user.fullName} added you as their ${relationshipType} on CareBridge.`,
        link: '/family'
      }
    });

    emitToUser(targetUser.id, 'notification', notification);

    res.status(201).json({
      success: true,
      message: 'Guardian linked successfully with verified consent',
      data: formatRelationship(relationship)
    });
  } catch (error) {
    next(error);
  }
};

// Accept guardian invitation via token
export const acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Invitation token is required' });
    }

    const invitation = await prisma.guardianInvitation.findUnique({
      where: { invitationToken: token }
    });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invalid invitation token' });
    }

    if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invitation is expired or already processed' });
    }

    // Activate relationship
    const relationship = await prisma.$transaction(async (tx) => {
      await tx.guardianInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', guardianUserId: req.user.id }
      });

      const rel = await tx.guardianRelationship.upsert({
        where: {
          patientId_guardianId: {
            patientId: invitation.patientId,
            guardianId: req.user.id
          }
        },
        create: {
          patientId: invitation.patientId,
          guardianId: req.user.id,
          relationshipType: invitation.relationshipType || 'Legal Guardian',
          status: 'ACTIVE',
          approvedAt: new Date()
        },
        update: {
          status: 'ACTIVE',
          approvedAt: new Date()
        }
      });

      const perms = await tx.guardianPermission.upsert({
        where: { relationshipId: rel.id },
        create: {
          relationshipId: rel.id,
          canViewAppointments: true,
          canBookAppointments: true,
          canViewMedicalRecords: true,
          canUploadRecords: true,
          canViewPrescriptions: true,
          canReceiveSOSAlerts: true,
          viewMedicalHistory: true,
          viewCases: true,
          viewAppointments: true,
          participateChat: true,
          submitConcerns: true
        },
        update: {
          canViewAppointments: true,
          canViewMedicalRecords: true
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'GUARDIAN_INVITATION_ACCEPTED',
          resourceType: 'GuardianRelationship',
          resourceId: rel.id,
          targetUserId: invitation.patientId
        }
      });

      return { ...rel, permissions: perms };
    });

    res.json({
      success: true,
      message: 'Invitation accepted! Guardian access is now active.',
      data: formatRelationship(relationship)
    });
  } catch (error) {
    next(error);
  }
};

// Update permissions granted to guardian
export const updatePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions, status } = req.body;

    const relationship = await prisma.guardianRelationship.findFirst({
      where: {
        id,
        patientId: req.user.id
      },
      include: { permissions: true }
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Relationship record not found'
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      let updatedRel = relationship;
      if (status && status !== relationship.status) {
        updatedRel = await tx.guardianRelationship.update({
          where: { id },
          data: {
            status,
            ...(status === 'REVOKED' && { revokedAt: new Date() })
          }
        });
      }

      let updatedPerms = relationship.permissions;
      if (permissions) {
        updatedPerms = await tx.guardianPermission.upsert({
          where: { relationshipId: id },
          create: {
            relationshipId: id,
            ...permissions
          },
          update: {
            ...permissions
          }
        });
      }

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_GUARDIAN_PERMISSIONS',
          resourceType: 'GuardianRelationship',
          resourceId: id,
          targetUserId: relationship.guardianId,
          metadata: { permissions: updatedPerms, status }
        }
      });

      return { ...updatedRel, permissions: updatedPerms };
    });

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: formatRelationship(updated)
    });
  } catch (error) {
    next(error);
  }
};

// Revoke relationship immediately
export const revokeRelationship = async (req, res, next) => {
  try {
    const { id } = req.params;

    const relationship = await prisma.guardianRelationship.findFirst({
      where: {
        id,
        patientId: req.user.id
      }
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Relationship record not found'
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.guardianRelationship.delete({
        where: { id }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'REVOKE_GUARDIAN_ACCESS',
          resourceType: 'GuardianRelationship',
          resourceId: id,
          targetUserId: relationship.guardianId
        }
      });
    });

    res.json({
      success: true,
      message: 'Guardian access revoked immediately'
    });
  } catch (error) {
    next(error);
  }
};

// For Guardian: Get linked patients they are authorized to view
export const getLinkedPatients = async (req, res, next) => {
  try {
    const relationships = await prisma.guardianRelationship.findMany({
      where: {
        guardianId: req.user.id,
        status: 'ACTIVE'
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            profilePhoto: true,
            patientProfile: true
          }
        },
        permissions: true
      }
    });

    const result = relationships.map((rel) => {
      const p = rel.patient;
      const canViewMed = rel.permissions?.canViewMedicalRecords || rel.permissions?.viewMedicalHistory;

      return {
        relationship: formatRelationship(rel),
        patient: { ...p, _id: p.id },
        medicalProfile: canViewMed && p.patientProfile ? { ...p.patientProfile, _id: p.patientProfile.id } : null
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
