import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const userId = user.id || user._id;
  return jwt.sign(
    {
      id: userId,
      _id: userId,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    process.env.JWT_SECRET || 'carebridge_super_secure_jwt_secret_key_2026_change_in_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'carebridge_super_secure_jwt_secret_key_2026_change_in_production'
  );
};
