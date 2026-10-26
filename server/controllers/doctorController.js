import { prisma } from '../config/prisma.js';
import { emitToUser } from '../services/socketService.js';

// Helper to format doctor profile with both id and _id
const formatDoctor = (doc) => {
  if (!doc) return null;
  const user = doc.user || {};
  return {
    ...doc,
    _id: doc.id,
    userId: {
      ...user,
      _id: user.id
    }
  };
};

// Public: Get list of verified doctors
export const getVerifiedDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;

    const where = {
      verificationStatus: 'VERIFIED',
      user: {
        status: 'ACTIVE'
      }
    };

    if (specialization && specialization !== 'ALL') {
      where.specialization = specialization;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { specialization: { contains: q, mode: 'insensitive' } },
        { hospitalAffiliation: { contains: q, mode: 'insensitive' } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const doctorProfiles = await prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            profilePhoto: true,
            status: true
          }
        },
        availabilities: true
      },
      orderBy: { averageRating: 'desc' }
    });

    const formatted = doctorProfiles.map(formatDoctor);

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Public/Auth: Get single doctor profile
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctorProfile = await prisma.doctorProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }]
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            profilePhoto: true,
            status: true
          }
        },
        availabilities: true
      }
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.json({
      success: true,
      data: formatDoctor(doctorProfile)
    });
  } catch (error) {
    next(error);
  }
};

// Doctor Dashboard Summary
export const getDoctorDashboardSummary = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
      include: { availabilities: true }
    });

    // 1. Pending cases assigned or matching specialization
    const pendingCases = await prisma.healthCase.findMany({
      where: {
        OR: [
          { assignedDoctorId: doctorId, status: { in: ['ASSIGNED', 'SUBMITTED'] } },
          {
            assignedDoctorId: null,
            matchedSpecialization: profile?.specialization || 'General Medicine',
            status: 'SUBMITTED'
          }
        ]
      },
      include: {
        patient: {
          select: { id: true, fullName: true, profilePhoto: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // 2. Active cases under review
    const activeCases = await prisma.healthCase.findMany({
      where: {
        assignedDoctorId: doctorId,
        status: 'UNDER_REVIEW'
      },
      include: {
        patient: {
          select: { id: true, fullName: true, profilePhoto: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // 3. Upcoming appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: { in: ['REQUESTED', 'CONFIRMED'] },
        date: { gte: today }
      },
      include: {
        patient: {
          select: { id: true, fullName: true, profilePhoto: true, mobile: true }
        }
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
      take: 10
    });

    // 4. Completed consultations count
    const completedCount = await prisma.consultationNote.count({
      where: { doctorId }
    });

    res.json({
      success: true,
      data: {
        profile: formatDoctor(profile),
        pendingCases: pendingCases.map((c) => ({
          ...c,
          _id: c.id,
          patientId: { ...c.patient, _id: c.patient.id }
        })),
        activeCases: activeCases.map((c) => ({
          ...c,
          _id: c.id,
          patientId: { ...c.patient, _id: c.patient.id }
        })),
        upcomingAppointments: upcomingAppointments.map((a) => ({
          ...a,
          _id: a.id,
          patientId: { ...a.patient, _id: a.patient.id }
        })),
        completedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Doctor accepts case
export const acceptCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const doctorId = req.user.id;

    const healthCase = await prisma.healthCase.findUnique({
      where: { id: caseId }
    });

    if (!healthCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const updatedCase = await prisma.healthCase.update({
      where: { id: caseId },
      data: {
        assignedDoctorId: doctorId,
        status: 'UNDER_REVIEW'
      }
    });

    // Upsert consultation note
    let consultation = await prisma.consultationNote.findFirst({
      where: { caseId, doctorId }
    });

    if (!consultation) {
      consultation = await prisma.consultationNote.create({
        data: {
          caseId,
          doctorId,
          summary: 'Clinical case accepted for review.',
          clinicalNotes: 'Initial evaluation in progress.',
          advice: 'Doctor reviewing symptoms and medical profile.'
        }
      });
    }

    // Notify patient
    const notification = await prisma.notification.create({
      data: {
        userId: healthCase.patientId,
        type: 'CASE_UPDATE',
        title: 'Doctor Assigned to Your Case',
        message: `Dr. ${req.user.fullName} has accepted your case #${healthCase.caseNumber} for clinical review.`,
        link: `/patient/cases/${caseId}`
      }
    });

    emitToUser(healthCase.patientId, 'notification', notification);

    res.json({
      success: true,
      message: 'Case accepted successfully',
      data: {
        healthCase: { ...updatedCase, _id: updatedCase.id },
        consultation: { ...consultation, _id: consultation.id }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Doctor provides clinical guidance
export const provideGuidance = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const {
      generalGuidance,
      firstAidInstructions,
      recommendedNextSteps,
      consultationNotes,
      markResolved
    } = req.body;

    const healthCase = await prisma.healthCase.findUnique({
      where: { id: caseId }
    });

    if (!healthCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Create or update consultation note
    let consultation = await prisma.consultationNote.findFirst({
      where: { caseId, doctorId: req.user.id }
    });

    if (consultation) {
      consultation = await prisma.consultationNote.update({
        where: { id: consultation.id },
        data: {
          summary: generalGuidance || consultation.summary,
          clinicalNotes: consultationNotes || consultation.clinicalNotes,
          advice: [firstAidInstructions, recommendedNextSteps].filter(Boolean).join('\n\n') || consultation.advice
        }
      });
    } else {
      consultation = await prisma.consultationNote.create({
        data: {
          caseId,
          doctorId: req.user.id,
          summary: generalGuidance || 'Clinical guidance provided.',
          clinicalNotes: consultationNotes || '',
          advice: [firstAidInstructions, recommendedNextSteps].filter(Boolean).join('\n\n') || 'Follow standard outpatient advice.'
        }
      });
    }

    if (markResolved) {
      await prisma.healthCase.update({
        where: { id: caseId },
        data: {
          status: 'RESOLVED',
          resolutionNotes: consultationNotes || 'Clinical guidance provided and case closed.',
          resolvedAt: new Date()
        }
      });
    }

    // Notify patient
    const notification = await prisma.notification.create({
      data: {
        userId: healthCase.patientId,
        type: 'CASE_UPDATE',
        title: 'Doctor Updated Clinical Guidance',
        message: `Dr. ${req.user.fullName} has updated your case guidance for #${healthCase.caseNumber}.`,
        link: `/patient/cases/${caseId}`
      }
    });

    emitToUser(healthCase.patientId, 'notification', notification);

    res.json({
      success: true,
      message: 'Guidance submitted successfully',
      data: { ...consultation, _id: consultation.id }
    });
  } catch (error) {
    next(error);
  }
};

// Update Doctor Profile
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const {
      fullName,
      mobile,
      specialization,
      qualification,
      experienceYears,
      licenseNumber,
      hospitalAffiliation,
      consultationFee,
      biography,
      availableDays,
      availableHours
    } = req.body;

    if (fullName || mobile) {
      await prisma.user.update({
        where: { id: doctorId },
        data: {
          ...(fullName && { fullName: fullName.trim() }),
          ...(mobile && { mobile: mobile.trim() })
        }
      });
    }

    const updatedProfile = await prisma.doctorProfile.upsert({
      where: { userId: doctorId },
      create: {
        userId: doctorId,
        specialization: specialization || 'General Medicine',
        qualification: qualification || 'MBBS',
        experienceYears: Number(experienceYears) || 1,
        licenseNumber: licenseNumber || `LIC-${Date.now().toString().slice(-6)}`,
        hospitalAffiliation: hospitalAffiliation || 'Independent Practice',
        consultationFee: Number(consultationFee) || 0.0,
        biography: biography || '',
        availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableHoursStart: availableHours?.start || '09:00',
        availableHoursEnd: availableHours?.end || '17:00'
      },
      update: {
        ...(specialization && { specialization }),
        ...(qualification && { qualification }),
        ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
        ...(licenseNumber && { licenseNumber }),
        ...(hospitalAffiliation && { hospitalAffiliation }),
        ...(consultationFee !== undefined && { consultationFee: Number(consultationFee) }),
        ...(biography !== undefined && { biography }),
        ...(availableDays && { availableDays }),
        ...(availableHours?.start && { availableHoursStart: availableHours.start }),
        ...(availableHours?.end && { availableHoursEnd: availableHours.end })
      }
    });

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: formatDoctor(updatedProfile)
    });
  } catch (error) {
    next(error);
  }
};
