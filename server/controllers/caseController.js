import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../config/prisma.js';
import { matchDoctorSpecialization } from '../services/doctorMatchingService.js';
import { evaluateTriage } from '../services/triageService.js';
import { emitToUser } from '../services/socketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check if a user is authorized to access a case
const checkCaseAccess = async (user, healthCase) => {
  if (!user || !healthCase) return false;
  if (user.role === 'ADMIN') return true;
  if (healthCase.patientId === user.id) return true;
  if (healthCase.submittedById === user.id) return true;
  if (healthCase.assignedDoctorId && healthCase.assignedDoctorId === user.id) return true;

  // If user is a guardian, check active relationship with permissions
  if (user.role === 'GUARDIAN' || user.role === 'FAMILY_MEMBER') {
    const relation = await prisma.guardianRelationship.findFirst({
      where: {
        patientId: healthCase.patientId,
        guardianId: user.id,
        status: 'ACTIVE'
      },
      include: { permissions: true }
    });
    if (relation && (relation.permissions?.viewCases || relation.permissions?.canViewMedicalRecords)) {
      return true;
    }
  }

  return false;
};

// Format case object for frontend compatibility
const formatCase = (c) => {
  if (!c) return null;
  return {
    ...c,
    _id: c.id,
    patientId: c.patient ? { ...c.patient, _id: c.patient.id } : c.patientId,
    submittedBy: c.submittedBy ? { ...c.submittedBy, _id: c.submittedBy.id } : c.submittedById,
    assignedDoctorId: c.assignedDoctor ? { ...c.assignedDoctor, _id: c.assignedDoctor.id } : c.assignedDoctorId,
    uploadedReports: (c.medicalReports || []).map((r) => ({ ...r, _id: r.id }))
  };
};

// Create new health case
export const createCase = async (req, res, next) => {
  try {
    const {
      patientId: targetPatientId,
      mainProblem,
      symptoms = [],
      severity = 'MODERATE',
      age,
      medicalHistorySummary,
      currentMedications = [],
      allergies = [],
      additionalInfo,
      assignedDoctorId
    } = req.body;

    let patientId = req.user.id;

    // Check authorization if guardian is submitting on behalf of patient
    if (req.user.role === 'GUARDIAN' || req.user.role === 'FAMILY_MEMBER') {
      if (!targetPatientId) {
        return res.status(400).json({
          success: false,
          message: 'Target patientId is required when submitting as a guardian'
        });
      }
      const relation = await prisma.guardianRelationship.findFirst({
        where: {
          patientId: targetPatientId,
          guardianId: req.user.id,
          status: 'ACTIVE'
        },
        include: { permissions: true }
      });
      if (!relation || (!relation.permissions?.submitConcerns && !relation.permissions?.canUploadRecords)) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to submit concerns for this patient'
        });
      }
      patientId = targetPatientId;
    }

    if (!mainProblem) {
      return res.status(400).json({
        success: false,
        message: 'Main problem description is required'
      });
    }

    // 1. Run Rule-Based Doctor Matching
    const { matchedSpecialization } = matchDoctorSpecialization({
      mainProblem,
      symptoms,
      age: Number(age) || 30
    });

    // 2. Run Safe Clinical Triage Assessment
    const triageResult = evaluateTriage({
      mainProblem,
      symptoms,
      severity,
      age: Number(age) || 30
    });

    // Auto-generate friendly case number
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `CB-${Date.now().toString().slice(-6)}-${randomDigits}`;

    // 3. Create Case in PostgreSQL
    const healthCase = await prisma.healthCase.create({
      data: {
        caseNumber,
        patientId,
        submittedById: req.user.id,
        mainProblem: mainProblem.trim(),
        symptoms: symptoms || [],
        severity,
        ageAtSubmission: Number(age) || 30,
        medicalHistorySummary: medicalHistorySummary || '',
        currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
        allergies: Array.isArray(allergies) ? allergies : [],
        additionalInfo: additionalInfo || '',
        matchedSpecialization,
        recommendedCareLevel: triageResult.recommendedCareLevel,
        warningSignsDetected: triageResult.warningSignsDetected || [],
        firstAidAdviceSummary: triageResult.firstAidAdviceSummary || '',
        assignedDoctorId: assignedDoctorId || null,
        status: assignedDoctorId ? 'ASSIGNED' : 'SUBMITTED'
      },
      include: {
        patient: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        assignedDoctor: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } }
      }
    });

    // If doctor assigned directly, send notification
    if (assignedDoctorId) {
      const notification = await prisma.notification.create({
        data: {
          userId: assignedDoctorId,
          type: 'CONSULTATION_REQUEST',
          title: 'New Patient Case Assigned',
          message: `New case #${healthCase.caseNumber} (${matchedSpecialization}) has been routed to you.`,
          link: `/doctor/cases/${healthCase.id}`
        }
      });
      emitToUser(assignedDoctorId, 'notification', notification);
    }

    res.status(201).json({
      success: true,
      message: 'Health concern submitted safely.',
      data: {
        healthCase: formatCase(healthCase),
        triageResult,
        matchedSpecialization
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get cases with role-based filtering
export const getCases = async (req, res, next) => {
  try {
    const { status, specialization } = req.query;
    let where = {};

    if (req.user.role === 'PATIENT') {
      where.patientId = req.user.id;
    } else if (req.user.role === 'GUARDIAN' || req.user.role === 'FAMILY_MEMBER') {
      const relations = await prisma.guardianRelationship.findMany({
        where: {
          guardianId: req.user.id,
          status: 'ACTIVE'
        },
        include: { permissions: true }
      });
      const allowedPatientIds = relations
        .filter((r) => r.permissions?.viewCases || r.permissions?.canViewMedicalRecords)
        .map((r) => r.patientId);

      where.OR = [
        { submittedById: req.user.id },
        { patientId: { in: allowedPatientIds } }
      ];
    } else if (req.user.role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.id }
      });
      const doctorSpec = specialization || doctorProfile?.specialization || 'General Medicine';

      where.OR = [
        { assignedDoctorId: req.user.id },
        { status: 'SUBMITTED', matchedSpecialization: doctorSpec }
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const cases = await prisma.healthCase.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        assignedDoctor: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        medicalReports: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = cases.map(formatCase);

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Get single case details
export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const healthCase = await prisma.healthCase.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        submittedBy: { select: { id: true, fullName: true, email: true, role: true } },
        assignedDoctor: { select: { id: true, fullName: true, email: true, mobile: true, profilePhoto: true } },
        medicalReports: true,
        consultationNotes: {
          include: {
            doctor: { select: { id: true, fullName: true, profilePhoto: true } }
          }
        }
      }
    });

    if (!healthCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const authorized = await checkCaseAccess(req.user, healthCase);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this health case'
      });
    }

    res.json({
      success: true,
      data: {
        healthCase: formatCase(healthCase),
        consultations: (healthCase.consultationNotes || []).map((n) => ({
          ...n,
          _id: n.id,
          doctorId: n.doctor ? { ...n.doctor, _id: n.doctor.id } : n.doctorId
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload medical report attached to case
export const uploadCaseReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a report file' });
    }

    const healthCase = await prisma.healthCase.findUnique({
      where: { id }
    });

    if (!healthCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const authorized = await checkCaseAccess(req.user, healthCase);
    if (!authorized) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const report = await prisma.medicalRecord.create({
      data: {
        patientId: healthCase.patientId,
        caseId: healthCase.id,
        title: req.file.originalname,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedById: req.user.id,
        description: description || ''
      }
    });

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded successfully',
      data: { ...report, _id: report.id }
    });
  } catch (error) {
    next(error);
  }
};

// Download / View report securely
export const downloadReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.medicalRecord.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found' });
    }

    if (report.caseId) {
      const healthCase = await prisma.healthCase.findUnique({
        where: { id: report.caseId }
      });
      if (healthCase) {
        const authorized = await checkCaseAccess(req.user, healthCase);
        if (!authorized) {
          return res.status(403).json({ success: false, message: 'Access denied to this file' });
        }
      }
    } else {
      // Direct patient record
      if (report.patientId !== req.user.id && req.user.role !== 'ADMIN') {
        const rel = await prisma.guardianRelationship.findFirst({
          where: {
            guardianId: req.user.id,
            patientId: report.patientId,
            status: 'ACTIVE'
          },
          include: { permissions: true }
        });
        if (!rel || !rel.permissions?.canViewMedicalRecords) {
          return res.status(403).json({ success: false, message: 'Access denied to this file' });
        }
      }
    }

    const absolutePath = path.resolve(report.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found on storage server' });
    }

    res.setHeader('Content-Type', report.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${report.originalName}"`);
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
