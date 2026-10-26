import { prisma } from '../config/prisma.js';
import { emitToUser } from '../services/socketService.js';

// Format appointment for frontend compatibility
const formatAppointment = (a) => {
  if (!a) return null;
  return {
    ...a,
    _id: a.id,
    patientId: a.patient
      ? {
          ...a.patient,
          _id: a.patient.id
        }
      : a.patientId,
    doctorId: a.doctor
      ? {
          ...a.doctor,
          _id: a.doctor.id
        }
      : a.doctorId,
    caseId: a.healthCase
      ? {
          ...a.healthCase,
          _id: a.healthCase.id
        }
      : a.caseId
  };
};

export const bookAppointment = async (req, res, next) => {
  try {
    let { doctorId, patientId, caseId, date, timeSlot, consultationMode, reason, notes } = req.body;

    const actingUserId = req.user.id;

    // Check acting user role and determine target patient
    let effectivePatientId = actingUserId;

    if (req.user.role === 'GUARDIAN' || req.user.role === 'FAMILY_MEMBER') {
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required when booking as a guardian'
        });
      }

      // Check guardian permission
      const relationship = await prisma.guardianRelationship.findFirst({
        where: {
          guardianId: actingUserId,
          patientId: patientId,
          status: 'ACTIVE'
        },
        include: { permissions: true }
      });

      if (!relationship || (!relationship.permissions?.canBookAppointments && !relationship.permissions?.viewAppointments)) {
        return res.status(403).json({
          success: false,
          message: 'Guardian does not have permission to book appointments for this patient'
        });
      }

      effectivePatientId = patientId;
    }

    // Check doctor exists and is active
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      include: { doctorProfile: true }
    });

    if (!doctor || doctor.role !== 'DOCTOR' || doctor.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or inactive'
      });
    }

    const apptDate = new Date(date);
    if (isNaN(apptDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid appointment date format' });
    }

    // Normalized date (strip time)
    const normalizedDate = new Date(Date.UTC(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate()));

    // Execute booking inside a serializable/read-committed transaction
    try {
      const newAppointment = await prisma.$transaction(async (tx) => {
        // 1. Double-booking check: verify doctor has no active appointment in the same slot
        const existingDoctorSlot = await tx.appointment.findFirst({
          where: {
            doctorId,
            timeSlot,
            date: normalizedDate,
            status: { in: ['REQUESTED', 'CONFIRMED'] }
          }
        });

        if (existingDoctorSlot) {
          const err = new Error('Doctor is already booked for this time slot');
          err.statusCode = 409;
          throw err;
        }

        // 2. Also check patient doesn't double book themselves at the same slot
        const existingPatientSlot = await tx.appointment.findFirst({
          where: {
            patientId: effectivePatientId,
            timeSlot,
            date: normalizedDate,
            status: { in: ['REQUESTED', 'CONFIRMED'] }
          }
        });

        if (existingPatientSlot) {
          const err = new Error('Patient already has an active appointment at this time slot');
          err.statusCode = 409;
          throw err;
        }

        // 3. Create appointment
        const appt = await tx.appointment.create({
          data: {
            patientId: effectivePatientId,
            doctorId,
            caseId: caseId || null,
            date: normalizedDate,
            timeSlot,
            consultationMode: consultationMode || 'CHAT',
            reason: reason || 'General Healthcare Consultation',
            notes: notes || '',
            status: 'REQUESTED'
          },
          include: {
            patient: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
            doctor: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
            healthCase: { select: { id: true, mainProblem: true, caseNumber: true } }
          }
        });

        // 4. Record status history
        await tx.appointmentStatusHistory.create({
          data: {
            appointmentId: appt.id,
            status: 'REQUESTED',
            reason: 'Initial booking request submitted',
            changedById: actingUserId
          }
        });

        // 5. Audit Log
        await tx.auditLog.create({
          data: {
            userId: actingUserId,
            action: 'BOOK_APPOINTMENT',
            resourceType: 'Appointment',
            resourceId: appt.id,
            targetUserId: effectivePatientId,
            metadata: { doctorId, timeSlot, date: normalizedDate }
          }
        });

        return appt;
      });

      // Notify doctor
      const notification = await prisma.notification.create({
        data: {
          userId: doctorId,
          type: 'CONSULTATION_REQUEST',
          title: 'New Appointment Request',
          message: `${req.user.fullName} requested an appointment for ${timeSlot} on ${apptDate.toLocaleDateString()}.`,
          link: '/doctor/appointments'
        }
      });
      emitToUser(doctorId, 'notification', notification);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully. Awaiting doctor confirmation.',
        data: formatAppointment(newAppointment)
      });
    } catch (txErr) {
      // Catch PostgreSQL unique constraint violation P2002
      if (txErr.code === 'P2002' || txErr.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: 'This doctor is already booked for that time slot. Please choose another time.'
        });
      }
      throw txErr;
    }
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const { status, patientId } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let where = {};

    if (userRole === 'PATIENT') {
      where.patientId = userId;
    } else if (userRole === 'DOCTOR') {
      where.doctorId = userId;
    } else if (userRole === 'GUARDIAN' || userRole === 'FAMILY_MEMBER') {
      // Find all active patient relationships
      const relationships = await prisma.guardianRelationship.findMany({
        where: {
          guardianId: userId,
          status: 'ACTIVE'
        },
        include: { permissions: true }
      });

      const allowedPatientIds = relationships
        .filter((r) => r.permissions?.canViewAppointments || r.permissions?.viewAppointments)
        .map((r) => r.patientId);

      if (patientId) {
        if (!allowedPatientIds.includes(patientId)) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to view appointments for this patient'
          });
        }
        where.patientId = patientId;
      } else {
        where.patientId = { in: allowedPatientIds };
      }
    } else if (userRole === 'ADMIN') {
      if (patientId) where.patientId = patientId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        doctor: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        healthCase: { select: { id: true, mainProblem: true, caseNumber: true } }
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }]
    });

    const formatted = appointments.map(formatAppointment);

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, cancellationReason } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, fullName: true } },
        doctor: { select: { id: true, fullName: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role check: Only assigned doctor, patient, authorized guardian, or admin can modify
    const isDoctor = appointment.doctorId === req.user.id;
    const isPatient = appointment.patientId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    let isAuthorizedGuardian = false;
    if (req.user.role === 'GUARDIAN' || req.user.role === 'FAMILY_MEMBER') {
      const rel = await prisma.guardianRelationship.findFirst({
        where: {
          guardianId: req.user.id,
          patientId: appointment.patientId,
          status: 'ACTIVE'
        },
        include: { permissions: true }
      });
      isAuthorizedGuardian = Boolean(rel?.permissions?.canBookAppointments);
    }

    if (!isDoctor && !isPatient && !isAdmin && !isAuthorizedGuardian) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.update({
        where: { id },
        data: {
          status,
          ...(notes !== undefined && { notes }),
          ...(cancellationReason !== undefined && { cancellationReason })
        },
        include: {
          patient: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
          doctor: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
          healthCase: { select: { id: true, mainProblem: true, caseNumber: true } }
        }
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: id,
          status,
          reason: cancellationReason || notes || `Status changed to ${status}`,
          changedById: req.user.id
        }
      });

      return appt;
    });

    // Send in-app notification to the counterpart
    const targetUserId = isDoctor ? appointment.patientId : appointment.doctorId;
    const actionType =
      status === 'CONFIRMED'
        ? 'APPOINTMENT_CONFIRMATION'
        : status === 'CANCELLED'
        ? 'APPOINTMENT_CANCELLATION'
        : 'CASE_UPDATE';

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: actionType,
        title: `Appointment ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        message: `Your appointment for ${appointment.timeSlot} on ${new Date(appointment.date).toLocaleDateString()} is now ${status.toLowerCase()}.`,
        link: isDoctor ? '/patient/appointments' : '/doctor/appointments'
      }
    });

    emitToUser(targetUserId, 'notification', notification);

    res.json({
      success: true,
      message: `Appointment status changed to ${status}`,
      data: formatAppointment(updated)
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        doctor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            profilePhoto: true,
            doctorProfile: { select: { specialization: true, consultationFee: true, hospitalAffiliation: true } }
          }
        },
        healthCase: { select: { id: true, mainProblem: true, caseNumber: true } },
        payment: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (userRole === 'PATIENT' && appointment.patientId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this appointment' });
    }
    if (userRole === 'DOCTOR' && appointment.doctorId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this appointment' });
    }

    res.json({
      success: true,
      data: formatAppointment(appointment)
    });
  } catch (error) {
    next(error);
  }
};

