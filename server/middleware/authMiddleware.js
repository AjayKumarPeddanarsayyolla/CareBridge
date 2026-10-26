import { verifyToken } from '../config/jwt.js';
import { prisma } from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
        error: err.message
      });
    }

    const userId = decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Malformed token payload'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact platform administration.'
      });
    }

    // Attach user and backward-compatible _id
    req.user = {
      ...user,
      _id: user.id
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication processing failed',
      error: error.message
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const userId = decoded.id || decoded._id;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, fullName: true, email: true, role: true, status: true }
        });
        if (user && user.status !== 'SUSPENDED') {
          req.user = { ...user, _id: user.id };
        }
      }
    }
  } catch (e) {
    // Ignore error for optional authentication
  }
  next();
};

