import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Verifying CareBridge credentials..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles.length > 0) {
    const isGuardian = user.role === 'GUARDIAN' || user.role === 'FAMILY_MEMBER';
    const roleAllowed = allowedRoles.includes(user.role) || (isGuardian && (allowedRoles.includes('GUARDIAN') || allowedRoles.includes('FAMILY_MEMBER')));
    
    if (!roleAllowed) {
      // Redirect to their respective role portal
      let fallback = '/';
      if (user.role === 'ADMIN') fallback = '/admin';
      else if (user.role === 'DOCTOR') fallback = '/doctor';
      else if (isGuardian) fallback = '/family';
      else if (user.role === 'PATIENT') fallback = '/patient';

      return <Navigate to={fallback} replace />;
    }
  }

  return children;
};
