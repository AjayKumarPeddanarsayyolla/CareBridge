import { prisma } from '../config/prisma.js';
import { emitToUser, getIO } from '../services/socketService.js';

// Format alert for client compatibility
const formatAlert = (alert) => {
  if (!alert) return null;
  return {
    ...alert,
    _id: alert.id,
    patient: alert.patient
      ? {
          ...alert.patient,
          _id: alert.patient.id
        }
      : alert.patientId,
    recipients: (alert.recipients || []).map((r) => ({
      ...r,
      _id: r.id,
      deliveries: (r.deliveries || []).map((d) => ({ ...d, _id: d.id }))
    }))
  };
};

// 1. Get emergency warning protocols and telephone hotlines
export const getEmergencyWarnings = async (req, res, next) => {
  try {
    const warnings = await prisma.emergencyWarning.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    const emergencyHotlines = [
      {
        country: 'India (Pan-India Integrated Emergency - ERSS)',
        emergency: '112',
        ambulance: '108 (Regional Ambulance / Telangana ERSS)',
        portal: 'https://112.gov.in',
        description: 'Single all-emergency number (Police, Fire, Medical, Disaster). Free from any phone.'
      },
      {
        country: 'Telangana Emergency Medical & Police Dispatch',
        emergency: '112',
        ambulance: '108',
        portal: 'https://erss.tspolice.gov.in',
        description: 'Dedicated 108 Emergency Ambulance Fleet & ERSS 112 Command Control Center'
      },
      {
        country: 'National Health Mission (NHM) Ambulance Services',
        emergency: '102',
        ambulance: '108 / 102',
        portal: 'https://nhm.gov.in',
        description: '102 provides basic patient & maternal-child transport; 108 provides emergency life-support'
      },
      {
        country: 'Specialized National Helplines (India)',
        emergency: '112',
        womenHelpline: '1091',
        childline: '1098',
        mentalHealth: '14416 (Tele-MANAS)',
        portal: 'https://112.gov.in'
      }
    ];

    res.json({
      success: true,
      data: {
        warnings: warnings.map((w) => ({ ...w, _id: w.id })),
        emergencyHotlines,
        disclaimer:
          'EMERGENCY DIRECTIVE: CareBridge is an informational and telehealth triage advisory system. It is NOT a certified public safety answering point (PSAP). In life-threatening medical emergencies, immediately dial 112 (Pan-India ERSS) or 108 (Ambulance). Do NOT wait for an online response.'
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Trigger persistent Emergency SOS Alert
export const triggerSOS = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { latitude, longitude, address, notes, severity = 'CRITICAL' } = req.body;

    // 1. Identify eligible emergency contacts from patient profile
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
      include: { emergencyContacts: true }
    });

    const emergencyContacts = profile?.emergencyContacts || [];

    // 2. Identify active guardians with canReceiveSOSAlerts permission
    const guardianRels = await prisma.guardianRelationship.findMany({
      where: {
        patientId,
        status: 'ACTIVE'
      },
      include: {
        guardian: { select: { id: true, fullName: true, mobile: true, email: true } },
        permissions: true
      }
    });

    const eligibleGuardians = guardianRels.filter(
      (rel) => rel.permissions?.canReceiveSOSAlerts !== false
    );

    // 3. Create EmergencyAlert, Recipients, and NotificationDeliveries transactionally
    const newAlert = await prisma.$transaction(async (tx) => {
      const alert = await tx.emergencyAlert.create({
        data: {
          patientId,
          severity,
          status: 'ACTIVE',
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          address: address || '',
          notes: notes || 'Emergency assistance requested via CareBridge SOS button.'
        }
      });

      // Prepare recipient records
      const recipientCreates = [];

      // Add emergency contacts
      for (const contact of emergencyContacts) {
        recipientCreates.push({
          alertId: alert.id,
          recipientName: contact.name,
          recipientPhone: contact.phoneNumber,
          recipientEmail: contact.email || null
        });
      }

      // Add active guardians
      for (const rel of eligibleGuardians) {
        recipientCreates.push({
          alertId: alert.id,
          recipientId: rel.guardian.id,
          recipientName: rel.guardian.fullName,
          recipientPhone: rel.guardian.mobile,
          recipientEmail: rel.guardian.email
        });
      }

      // If no contacts configured, add a fallback simulation recipient
      if (recipientCreates.length === 0) {
        recipientCreates.push({
          alertId: alert.id,
          recipientName: 'CareBridge Emergency Dispatch (Simulation)',
          recipientPhone: '+1 (555) 911-0000',
          recipientEmail: 'dispatch-demo@carebridge.com'
        });
      }

      // Create recipients & deliveries
      for (const r of recipientCreates) {
        const createdRecipient = await tx.emergencyAlertRecipient.create({
          data: r
        });

        // Outbox delivery record (simulated for local environment)
        await tx.notificationDelivery.create({
          data: {
            recipientId: createdRecipient.id,
            channel: 'SIMULATED_SMS',
            status: 'SIMULATED',
            simulatedAt: new Date()
          }
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: patientId,
          action: 'SOS_ACTIVATED',
          resourceType: 'EmergencyAlert',
          resourceId: alert.id,
          metadata: {
            recipientCount: recipientCreates.length,
            hasCoordinates: Boolean(latitude && longitude)
          }
        }
      });

      return tx.emergencyAlert.findUnique({
        where: { id: alert.id },
        include: {
          patient: { select: { id: true, fullName: true, mobile: true, email: true } },
          recipients: {
            include: { deliveries: true }
          }
        }
      });
    });

    // Broadcast real-time Socket.IO alert to all eligible guardians
    for (const rel of eligibleGuardians) {
      emitToUser(rel.guardian.id, 'emergency:sos_alert', {
        alertId: newAlert.id,
        patientName: req.user.fullName,
        patientPhone: req.user.mobile,
        activatedAt: newAlert.activatedAt,
        address: newAlert.address,
        isSimulation: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency SOS activated! Alerts dispatched to configured contacts (Simulated).',
      data: formatAlert(newAlert)
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get currently active SOS alert for patient or linked guardian
export const getActiveSOS = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let patientId = userId;

    if (req.user.role === 'GUARDIAN' || req.user.role === 'FAMILY_MEMBER') {
      const { targetPatientId } = req.query;
      if (targetPatientId) {
        patientId = targetPatientId;
      } else {
        const rel = await prisma.guardianRelationship.findFirst({
          where: { guardianId: userId, status: 'ACTIVE' }
        });
        if (rel) patientId = rel.patientId;
      }
    }

    const activeAlert = await prisma.emergencyAlert.findFirst({
      where: {
        patientId,
        status: { in: ['ACTIVE', 'ACKNOWLEDGED'] }
      },
      include: {
        patient: { select: { id: true, fullName: true, mobile: true, email: true } },
        recipients: {
          include: { deliveries: true }
        }
      },
      orderBy: { activatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: activeAlert ? formatAlert(activeAlert) : null
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get SOS alert history for authenticated user
export const getSOSHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let where = {};

    if (req.user.role === 'PATIENT') {
      where.patientId = userId;
    } else if (req.user.role === 'GUARDIAN' || req.user.role === 'FAMILY_MEMBER') {
      where.recipients = {
        some: { recipientId: userId }
      };
    } else if (req.user.role === 'ADMIN') {
      // Admin views all
    }

    const alerts = await prisma.emergencyAlert.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, mobile: true } },
        recipients: {
          include: { deliveries: true }
        }
      },
      orderBy: { activatedAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts.map(formatAlert)
    });
  } catch (error) {
    next(error);
  }
};

// 5. Acknowledge emergency alert by guardian or recipient
export const acknowledgeSOS = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const alert = await prisma.emergencyAlert.findUnique({
      where: { id: alertId },
      include: { recipients: true, patient: true }
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Emergency alert not found' });
    }

    const updatedAlert = await prisma.$transaction(async (tx) => {
      // Find matching recipient record
      const recipient = alert.recipients.find((r) => r.recipientId === userId) || alert.recipients[0];

      if (recipient) {
        await tx.emergencyAlertRecipient.update({
          where: { id: recipient.id },
          data: {
            acknowledged: true,
            acknowledgedAt: new Date()
          }
        });
      }

      const uAlert = await tx.emergencyAlert.update({
        where: { id: alertId },
        data: { status: 'ACKNOWLEDGED' },
        include: {
          patient: { select: { id: true, fullName: true, mobile: true } },
          recipients: { include: { deliveries: true } }
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'SOS_ACKNOWLEDGED',
          resourceType: 'EmergencyAlert',
          resourceId: alertId,
          targetUserId: alert.patientId,
          metadata: { acknowledgedBy: req.user.fullName }
        }
      });

      return uAlert;
    });

    // Emit confirmation to patient
    emitToUser(alert.patientId, 'emergency:sos_acknowledged', {
      alertId,
      acknowledgedBy: req.user.fullName,
      acknowledgedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Emergency SOS alert acknowledged. Telehealth assistance logged.',
      data: formatAlert(updatedAlert)
    });
  } catch (error) {
    next(error);
  }
};

// 6. Resolve / Cancel emergency alert
export const resolveSOS = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { resolutionNotes } = req.body;

    const alert = await prisma.emergencyAlert.findUnique({
      where: { id: alertId }
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Emergency alert not found' });
    }

    // Role check: Only patient who created it, or admin
    if (alert.patientId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to resolve this alert' });
    }

    const resolved = await prisma.emergencyAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        notes: resolutionNotes || alert.notes
      },
      include: {
        patient: { select: { id: true, fullName: true } },
        recipients: { include: { deliveries: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'SOS_RESOLVED',
        resourceType: 'EmergencyAlert',
        resourceId: alertId,
        metadata: { resolutionNotes }
      }
    });

    res.json({
      success: true,
      message: 'Emergency alert marked as resolved',
      data: formatAlert(resolved)
    });
  } catch (error) {
    next(error);
  }
};
