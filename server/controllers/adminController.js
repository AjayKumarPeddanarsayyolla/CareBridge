import { prisma } from '../config/prisma.js';
import { emitToUser } from '../services/socketService.js';

// Admin platform dashboard statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } });
    const totalDoctors = await prisma.user.count({ where: { role: 'DOCTOR' } });
    const pendingVerifications = await prisma.doctorProfile.count({
      where: { verificationStatus: 'PENDING' }
    });
    const activeCases = await prisma.healthCase.count({
      where: { status: { in: ['SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW'] } }
    });
    const completedConsultations = await prisma.consultationNote.count();
    const totalFirstAidGuides = await prisma.firstAidGuide.count();

    // Recent user signups
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    });

    // Recent cases
    const recentCases = await prisma.healthCase.findMany({
      include: {
        patient: { select: { id: true, fullName: true, email: true } },
        assignedDoctor: { select: { id: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        pendingVerifications,
        activeCases,
        completedConsultations,
        totalFirstAidGuides,
        recentUsers: recentUsers.map((u) => ({ ...u, _id: u.id })),
        recentCases: recentCases.map((c) => ({
          ...c,
          _id: c.id,
          patientId: c.patient ? { ...c.patient, _id: c.patient.id } : null,
          assignedDoctorId: c.assignedDoctor ? { ...c.assignedDoctor, _id: c.assignedDoctor.id } : null
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// List pending doctor applications
export const getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            status: true,
            createdAt: true,
            profilePhoto: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = doctors.map((doc) => ({
      ...doc,
      _id: doc.id,
      userId: doc.user ? { ...doc.user, _id: doc.user.id } : null
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Verify doctor application
export const verifyDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctorProfile = await prisma.doctorProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true }
    });

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.doctorProfile.update({
        where: { id: doctorProfile.id },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedById: req.user.id,
          verifiedAt: new Date()
        }
      });

      await tx.user.update({
        where: { id: doctorProfile.userId },
        data: { status: 'ACTIVE' }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'VERIFY_DOCTOR',
          resourceType: 'DoctorProfile',
          resourceId: doctorProfile.id,
          targetUserId: doctorProfile.userId,
          metadata: { licenseNumber: doctorProfile.licenseNumber }
        }
      });

      return updatedProfile;
    });

    // Notify doctor
    const notification = await prisma.notification.create({
      data: {
        userId: doctorProfile.userId,
        type: 'DOCTOR_VERIFICATION',
        title: 'Account Verification Approved',
        message: 'Your medical credentials have been verified by the CareBridge administration. You may now accept patient cases.',
        link: '/doctor'
      }
    });

    emitToUser(doctorProfile.userId, 'notification', notification);

    res.json({
      success: true,
      message: 'Doctor successfully verified and activated',
      data: { ...updated, _id: updated.id }
    });
  } catch (error) {
    next(error);
  }
};

// Reject doctor application
export const rejectDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const doctorProfile = await prisma.doctorProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true }
    });

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.doctorProfile.update({
        where: { id: doctorProfile.id },
        data: {
          verificationStatus: 'REJECTED',
          rejectionReason: reason || 'Documentation could not be validated'
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'REJECT_DOCTOR',
          resourceType: 'DoctorProfile',
          resourceId: doctorProfile.id,
          targetUserId: doctorProfile.userId,
          metadata: { reason }
        }
      });

      return updatedProfile;
    });

    // Notify doctor
    const notification = await prisma.notification.create({
      data: {
        userId: doctorProfile.userId,
        type: 'DOCTOR_VERIFICATION',
        title: 'Verification Request Rejected',
        message: `Your medical verification was not approved: ${reason || 'Documentation could not be validated'}`,
        link: '/doctor'
      }
    });

    emitToUser(doctorProfile.userId, 'notification', notification);

    res.json({
      success: true,
      message: 'Doctor application rejected',
      data: { ...updated, _id: updated.id }
    });
  } catch (error) {
    next(error);
  }
};

// List all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const where = {};

    if (role && role !== 'ALL') {
      where.role = role === 'FAMILY_MEMBER' ? 'GUARDIAN' : role;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        profilePhoto: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = users.map((u) => ({ ...u, _id: u.id }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Suspend or Activate user
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be ACTIVE or SUSPENDED' });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN' && user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own admin account' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: { status }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: status === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
          resourceType: 'User',
          resourceId: id,
          targetUserId: id,
          metadata: { newStatus: status }
        }
      });

      return u;
    });

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      data: { ...updated, _id: updated.id }
    });
  } catch (error) {
    next(error);
  }
};

// Manage First-Aid Guides
export const createFirstAidGuide = async (req, res, next) => {
  try {
    const {
      title,
      category,
      situation,
      safeImmediateSteps = [],
      thingsToAvoid = [],
      warningSigns = [],
      whenToSeekProfessionalCare = [],
      emergencyWarning
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const guide = await prisma.firstAidGuide.create({
      data: {
        title,
        slug,
        category,
        situation,
        safeImmediateSteps,
        thingsToAvoid,
        warningSigns,
        whenToSeekProfessionalCare,
        emergencyWarning: emergencyWarning || undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_FIRST_AID',
        resourceType: 'FirstAidGuide',
        resourceId: guide.id,
        metadata: { title: guide.title }
      }
    });

    res.status(201).json({
      success: true,
      message: 'First-aid guide created',
      data: { ...guide, _id: guide.id }
    });
  } catch (error) {
    next(error);
  }
};

export const updateFirstAidGuide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guide = await prisma.firstAidGuide.update({
      where: { id },
      data: req.body
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_FIRST_AID',
        resourceType: 'FirstAidGuide',
        resourceId: guide.id,
        metadata: { title: guide.title }
      }
    });

    res.json({
      success: true,
      message: 'Guide updated successfully',
      data: { ...guide, _id: guide.id }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFirstAidGuide = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.firstAidGuide.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Guide deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Audit logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        targetUser: { select: { id: true, fullName: true, email: true, role: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const formatted = logs.map((log) => ({
      ...log,
      _id: log.id,
      adminId: log.user ? { ...log.user, _id: log.user.id } : null,
      targetUserId: log.targetUser ? { ...log.targetUser, _id: log.targetUser.id } : null,
      createdAt: log.timestamp
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all patient details with case counts
export const getClientDetails = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const where = { role: 'PATIENT' };
    if (status && status !== 'ALL') where.status = status;
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }

    const patients = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        patientProfile: true,
        _count: {
          select: { patientCases: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = patients.map((patient) => ({
      user: { ...patient, _id: patient.id },
      profile: patient.patientProfile ? { ...patient.patientProfile, _id: patient.patientProfile.id } : null,
      caseCount: patient._count.patientCases
    }));

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all guardian details
export const getGuardianDetails = async (req, res, next) => {
  try {
    const { search } = req.query;

    const where = {
      role: { in: ['GUARDIAN', 'FAMILY_MEMBER'] }
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }

    const guardians = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        profilePhoto: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: guardians.length,
      data: guardians.map((g) => ({ ...g, _id: g.id }))
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all doctor details with profiles
export const getDoctorDetails = async (req, res, next) => {
  try {
    const { search, specialization, minRating } = req.query;

    const where = {
      role: 'DOCTOR'
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }

    const profileWhere = {};
    if (specialization) {
      profileWhere.specialization = { contains: specialization, mode: 'insensitive' };
    }
    if (minRating) {
      profileWhere.averageRating = { gte: Number(minRating) };
    }

    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        profilePhoto: true,
        status: true,
        createdAt: true,
        doctorProfile: {
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = doctors
      .filter((d) => d.doctorProfile !== null)
      .map((doctor) => ({
        user: { ...doctor, _id: doctor.id },
        profile: { ...doctor.doctorProfile, _id: doctor.doctorProfile?.id }
      }));

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};
