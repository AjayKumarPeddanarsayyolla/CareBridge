import { prisma } from '../config/prisma.js';

export const getPatientProfile = async (req, res, next) => {
  try {
    const targetUserId = req.query.patientId || req.user.id;

    // Authorization check if requesting someone else's profile
    if (targetUserId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'DOCTOR') {
      const relation = await prisma.guardianRelationship.findFirst({
        where: {
          guardianId: req.user.id,
          patientId: targetUserId,
          status: 'ACTIVE'
        },
        include: { permissions: true }
      });
      if (!relation || (!relation.permissions?.viewMedicalHistory && !relation.permissions?.canViewMedicalRecords)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this patient profile'
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profile = await prisma.patientProfile.findUnique({
      where: { userId: targetUserId },
      include: { emergencyContacts: true }
    });

    res.json({
      success: true,
      data: {
        user: { ...user, _id: user.id },
        profile: profile
          ? {
              ...profile,
              _id: profile.id,
              emergencyContact: profile.emergencyContacts[0]
                ? {
                    name: profile.emergencyContacts[0].name,
                    relation: profile.emergencyContacts[0].relationship,
                    phone: profile.emergencyContacts[0].phoneNumber
                  }
                : null
            }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatientProfile = async (req, res, next) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodGroup,
      allergies,
      existingConditions,
      currentMedications,
      medicalHistory,
      emergencyContact,
      fullName,
      mobile
    } = req.body;

    // Update base user info if provided
    if (fullName || mobile) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(fullName && { fullName: fullName.trim() }),
          ...(mobile && { mobile: mobile.trim() })
        }
      });
    }

    // Upsert patient profile
    const profile = await prisma.patientProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || 'PREFER_NOT_TO_SAY',
        bloodGroup: bloodGroup || 'UNKNOWN',
        allergies: Array.isArray(allergies) ? allergies : [],
        existingConditions: Array.isArray(existingConditions) ? existingConditions : [],
        currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
        medicalHistory: medicalHistory || '',
        profileCompleted: Boolean(dateOfBirth && bloodGroup && emergencyContact?.name)
      },
      update: {
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(bloodGroup && { bloodGroup }),
        ...(Array.isArray(allergies) && { allergies }),
        ...(Array.isArray(existingConditions) && { existingConditions }),
        ...(Array.isArray(currentMedications) && { currentMedications }),
        ...(medicalHistory !== undefined && { medicalHistory }),
        profileCompleted: Boolean(dateOfBirth && bloodGroup && emergencyContact?.name)
      },
      include: { emergencyContacts: true }
    });

    // Update or create primary emergency contact
    if (emergencyContact && emergencyContact.name && emergencyContact.phone) {
      const existingContact = profile.emergencyContacts[0];
      if (existingContact) {
        await prisma.emergencyContact.update({
          where: { id: existingContact.id },
          data: {
            name: emergencyContact.name,
            relationship: emergencyContact.relation || 'Emergency Contact',
            phoneNumber: emergencyContact.phone
          }
        });
      } else {
        await prisma.emergencyContact.create({
          data: {
            patientProfileId: profile.id,
            name: emergencyContact.name,
            relationship: emergencyContact.relation || 'Emergency Contact',
            phoneNumber: emergencyContact.phone,
            isPrimary: true
          }
        });
      }
    }

    const reloaded = await prisma.patientProfile.findUnique({
      where: { id: profile.id },
      include: { emergencyContacts: true }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...reloaded,
        _id: reloaded.id,
        emergencyContact: reloaded.emergencyContacts[0]
          ? {
              name: reloaded.emergencyContacts[0].name,
              relation: reloaded.emergencyContacts[0].relationship,
              phone: reloaded.emergencyContacts[0].phoneNumber
            }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Profile status & completion
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: { emergencyContacts: true }
    });

    let completionPercentage = 20;
    if (profile) {
      if (profile.dateOfBirth) completionPercentage += 15;
      if (profile.bloodGroup && profile.bloodGroup !== 'UNKNOWN') completionPercentage += 15;
      if (profile.emergencyContacts.length > 0) completionPercentage += 25;
      if (profile.allergies.length > 0) completionPercentage += 10;
      if (profile.existingConditions.length > 0) completionPercentage += 15;
    }

    // 2. Active cases
    const activeCases = await prisma.healthCase.findMany({
      where: {
        patientId: userId,
        status: { in: ['SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW'] }
      },
      include: {
        assignedDoctor: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 3. Upcoming appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId: userId,
        status: { in: ['REQUESTED', 'CONFIRMED'] },
        date: { gte: today }
      },
      include: {
        doctor: { select: { id: true, fullName: true } }
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
      take: 5
    });

    // 4. Recent consultations & prescriptions
    const recentConsultations = await prisma.consultationNote.findMany({
      where: {
        healthCase: {
          patientId: userId
        }
      },
      include: {
        doctor: { select: { id: true, fullName: true, profilePhoto: true } },
        healthCase: { select: { id: true, mainProblem: true, caseNumber: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: userId },
      include: {
        doctor: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        profileCompletion: Math.min(completionPercentage, 100),
        profile: profile ? { ...profile, _id: profile.id } : null,
        activeCases: activeCases.map((c) => ({
          ...c,
          _id: c.id,
          assignedDoctorId: c.assignedDoctor ? { ...c.assignedDoctor, _id: c.assignedDoctor.id } : null
        })),
        upcomingAppointments: upcomingAppointments.map((a) => ({
          ...a,
          _id: a.id,
          doctorId: a.doctor ? { ...a.doctor, _id: a.doctor.id } : null
        })),
        recentConsultations: recentConsultations.map((c) => ({
          ...c,
          _id: c.id,
          caseId: c.healthCase ? { ...c.healthCase, _id: c.healthCase.id } : null,
          doctorId: c.doctor ? { ...c.doctor, _id: c.doctor.id } : null
        })),
        prescriptions: prescriptions.map((p) => ({
          ...p,
          _id: p.id,
          doctorId: p.doctor ? { ...p.doctor, _id: p.doctor.id } : null
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get medical reports for patient (or authorized guardian)
export const getMedicalReports = async (req, res, next) => {
  try {
    const targetPatientId = req.query.patientId || req.user.id;

    if (targetPatientId !== req.user.id && req.user.role !== 'ADMIN') {
      const rel = await prisma.guardianRelationship.findFirst({
        where: {
          guardianId: req.user.id,
          patientId: targetPatientId,
          status: 'ACTIVE'
        },
        include: { permissions: true }
      });
      if (!rel || (!rel.permissions?.canViewMedicalRecords && !rel.permissions?.viewMedicalHistory)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Guardian lacks permission to view medical records'
        });
      }
    }

    const reports = await prisma.medicalRecord.findMany({
      where: { patientId: targetPatientId },
      include: {
        uploadedBy: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: reports.length,
      data: reports.map((r) => ({ ...r, _id: r.id }))
    });
  } catch (error) {
    next(error);
  }
};
