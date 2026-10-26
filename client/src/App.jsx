import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Dedicated Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { GuardianLayout } from './layouts/GuardianLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { MinimalLayout } from './layouts/MinimalLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { HowItWorks } from './pages/public/HowItWorks';
import { DoctorsDirectory } from './pages/public/DoctorsDirectory';
import { DoctorDetails } from './pages/public/DoctorDetails';
import { FirstAidDirectory } from './pages/public/FirstAidDirectory';
import { FirstAidDetail } from './pages/public/FirstAidDetail';
import { EmergencyInfo } from './pages/public/EmergencyInfo';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfile } from './pages/patient/PatientProfile';
import { SubmitConcern } from './pages/patient/SubmitConcern';
import { MyCases } from './pages/patient/MyCases';
import { CaseDetails } from './pages/patient/CaseDetails';
import { AppointmentsPage } from './pages/patient/AppointmentsPage';
import { CheckoutPage } from './pages/patient/CheckoutPage';
import { FamilyAccess } from './pages/patient/FamilyAccess';
import { MedicalReports } from './pages/patient/MedicalReports';

// Guardian / Family Pages
import { FamilyDashboard } from './pages/family/FamilyDashboard';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorCaseDetails } from './pages/doctor/DoctorCaseDetails';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorProfile } from './pages/doctor/DoctorProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorVerification } from './pages/admin/DoctorVerification';
import { UserManagement } from './pages/admin/UserManagement';
import { FirstAidManagement } from './pages/admin/FirstAidManagement';
import { AuditLogs } from './pages/admin/AuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              {/* =========================================
                  PUBLIC ROUTES (PublicLayout: Full Marketing Header & Footer)
                  ========================================= */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
              <Route path="/doctors" element={<PublicLayout><DoctorsDirectory /></PublicLayout>} />
              <Route path="/doctors/:id" element={<PublicLayout><DoctorDetails /></PublicLayout>} />
              <Route path="/first-aid" element={<PublicLayout><FirstAidDirectory /></PublicLayout>} />
              <Route path="/first-aid/:slugOrId" element={<PublicLayout><FirstAidDetail /></PublicLayout>} />
              <Route path="/emergency" element={<PublicLayout><EmergencyInfo /></PublicLayout>} />

              {/* =========================================
                  AUTHENTICATION & MINIMAL ROUTES (MinimalLayout)
                  ========================================= */}
              <Route
                path="/login"
                element={
                  <MinimalLayout backUrl="/" title="CareBridge Portal Login">
                    <Login />
                  </MinimalLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <MinimalLayout backUrl="/" title="CareBridge Account Registration">
                    <Register />
                  </MinimalLayout>
                }
              />

              {/* Secure Checkout Route (MinimalLayout) */}
              <Route
                path="/checkout/:appointmentId"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT', 'GUARDIAN', 'FAMILY_MEMBER']}>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              {/* =========================================
                  PATIENT ROUTES (PatientLayout: Clinical Navigation & Patient Footer)
                  ========================================= */}
              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientLayout><PatientDashboard /></PatientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/profile"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientLayout><PatientProfile /></PatientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/submit-concern"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientLayout><SubmitConcern /></PatientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/cases"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientLayout><MyCases /></PatientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                    <PatientLayout><CaseDetails /></PatientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/appointments"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientLayout><AppointmentsPage /></PatientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/family"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientLayout><FamilyAccess /></PatientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/reports"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <PatientLayout><MedicalReports /></PatientLayout>
                  </ProtectedRoute>
                }
              />

              {/* =========================================
                  GUARDIAN / FAMILY ROUTES (GuardianLayout)
                  ========================================= */}
              <Route
                path="/family"
                element={
                  <ProtectedRoute allowedRoles={['GUARDIAN', 'FAMILY_MEMBER']}>
                    <GuardianLayout><FamilyDashboard /></GuardianLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guardian"
                element={<Navigate to="/family" replace />}
              />

              {/* =========================================
                  DOCTOR ROUTES (DoctorLayout: Physician Clinical Portal)
                  ========================================= */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']}>
                    <DoctorLayout><DoctorDashboard /></DoctorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']}>
                    <DoctorLayout><DoctorCaseDetails /></DoctorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/appointments"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']}>
                    <DoctorLayout><DoctorAppointments /></DoctorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/profile"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']}>
                    <DoctorLayout><DoctorProfile /></DoctorLayout>
                  </ProtectedRoute>
                }
              />

              {/* =========================================
                  ADMIN ROUTES (AdminLayout: Platform Control Plane)
                  ========================================= */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout><AdminDashboard /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/doctors/pending"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout><DoctorVerification /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout><UserManagement /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/first-aid"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout><FirstAidManagement /></AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout><AuditLogs /></AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
