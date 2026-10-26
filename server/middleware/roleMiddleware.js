export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Normalize roles to support GUARDIAN and FAMILY_MEMBER interchangeably
    const userRole = req.user.role === 'FAMILY_MEMBER' ? 'GUARDIAN' : req.user.role;
    const allowed = roles.map((r) => (r === 'FAMILY_MEMBER' ? 'GUARDIAN' : r));

    if (!allowed.includes(userRole) && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

export const requireVerifiedDoctor = async (req, res, next) => {
  if (req.user.role !== 'DOCTOR') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to doctors only'
    });
  }

  if (req.user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message: 'Doctor account is pending verification or suspended'
    });
  }

  next();
};
