import { prisma } from '../config/prisma.js';

export const getFirstAidGuides = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const where = { isPublished: true };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { situation: { contains: q, mode: 'insensitive' } }
      ];
    }

    const guides = await prisma.firstAidGuide.findMany({
      where,
      orderBy: [{ category: 'asc' }, { title: 'asc' }]
    });

    res.json({
      success: true,
      count: guides.length,
      data: guides.map((g) => ({ ...g, _id: g.id }))
    });
  } catch (error) {
    next(error);
  }
};

export const getFirstAidGuideByIdOrSlug = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;

    const guide = await prisma.firstAidGuide.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }]
      }
    });

    if (!guide) {
      return res.status(404).json({ success: false, message: 'First-aid guide not found' });
    }

    res.json({
      success: true,
      data: { ...guide, _id: guide.id }
    });
  } catch (error) {
    next(error);
  }
};
