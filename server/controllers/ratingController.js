import { prisma } from '../config/prisma.js';

// Helper: recalculate and update doctor's average rating in DoctorProfile
async function recalculateDoctorStats(doctorUserId) {
  const ratings = await prisma.doctorRating.findMany({
    where: { doctorId: doctorUserId }
  });

  if (ratings.length > 0) {
    const sumRating = ratings.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Math.round((sumRating / ratings.length) * 10) / 10;

    await prisma.doctorProfile.updateMany({
      where: { userId: doctorUserId },
      data: {
        averageRating: avgRating,
        totalRatings: ratings.length
      }
    });
  }
}

// Submit or update a rating for a doctor
export const submitDoctorRating = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { rating, assistanceRating, reviewText, isAnonymous, appointmentId } = req.body;
    const patientId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Verify doctor exists
    const doctorUser = await prisma.user.findUnique({
      where: { id: doctorId }
    });

    if (!doctorUser || doctorUser.role !== 'DOCTOR') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Upsert rating
    const doctorRating = await prisma.doctorRating.upsert({
      where: {
        doctorId_patientId: {
          doctorId,
          patientId
        }
      },
      create: {
        doctorId,
        patientId,
        rating: Number(rating),
        assistanceRating: assistanceRating ? Number(assistanceRating) : null,
        reviewText: reviewText || '',
        isAnonymous: Boolean(isAnonymous)
      },
      update: {
        rating: Number(rating),
        assistanceRating: assistanceRating ? Number(assistanceRating) : null,
        reviewText: reviewText || '',
        isAnonymous: Boolean(isAnonymous)
      }
    });

    // Recalculate stats
    await recalculateDoctorStats(doctorId);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: { ...doctorRating, _id: doctorRating.id }
    });
  } catch (error) {
    next(error);
  }
};

// Get all ratings for a specific doctor (public)
export const getDoctorRatings = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const ratings = await prisma.doctorRating.findMany({
      where: { doctorId },
      include: {
        patient: { select: { id: true, fullName: true, profilePhoto: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.doctorRating.count({ where: { doctorId } });

    // Mask patient info for anonymous reviews
    const maskedRatings = ratings.map((r) => ({
      ...r,
      _id: r.id,
      patientId: r.isAnonymous
        ? { fullName: 'Anonymous Patient', profilePhoto: '', _id: r.patientId }
        : { ...r.patient, _id: r.patient?.id }
    }));

    // Stats distribution
    const allRatings = await prisma.doctorRating.findMany({
      where: { doctorId },
      select: { rating: true, assistanceRating: true }
    });

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;
    allRatings.forEach((r) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
      sumRating += r.rating;
    });

    const avgRating = total > 0 ? Math.round((sumRating / total) * 10) / 10 : 0;

    res.json({
      success: true,
      data: maskedRatings,
      stats: {
        averageRating: avgRating,
        totalRatings: total,
        ratingDistribution
      },
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check if current patient has rated a doctor
export const getMyRating = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const patientId = req.user.id;

    const rating = await prisma.doctorRating.findUnique({
      where: {
        doctorId_patientId: {
          doctorId,
          patientId
        }
      }
    });

    res.json({
      success: true,
      data: rating ? { ...rating, _id: rating.id } : null
    });
  } catch (error) {
    next(error);
  }
};

// Admin: get all ratings across all doctors
export const getAllRatingsAdmin = async (req, res, next) => {
  try {
    const { minRating, maxRating } = req.query;

    const where = {};
    if (minRating) where.rating = { gte: Number(minRating) };
    if (maxRating) where.rating = { ...(where.rating || {}), lte: Number(maxRating) };

    const ratings = await prisma.doctorRating.findMany({
      where,
      include: {
        doctor: { select: { id: true, fullName: true, email: true } },
        patient: { select: { id: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const formatted = ratings.map((r) => ({
      ...r,
      _id: r.id,
      doctor: r.doctor ? { ...r.doctor, _id: r.doctor.id } : null,
      patient: r.patient ? { ...r.patient, _id: r.patient.id } : null
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    next(error);
  }
};
