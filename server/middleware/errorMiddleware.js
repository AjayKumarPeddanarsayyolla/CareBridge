export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  let statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // Handle Prisma Unique Constraint Violation (P2002)
  if (err.code === 'P2002') {
    statusCode = 400;
    const target = err.meta?.target;
    const field = Array.isArray(target) ? target.join(', ') : (target || 'field');
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Handle Prisma Record Not Found (P2025)
  if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause || 'Requested record not found';
  }

  // Handle Prisma Foreign Key Constraint Failure (P2003)
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference: Related entity does not exist.';
  }

  // Handle Prisma Validation Error
  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided for database operation.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
