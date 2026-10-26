import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  ArrowRight,
  ShieldCheck,
  User,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as doctorService from '../../services/doctorService';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctorDashboard = async () => {
    try {
      const res = await doctorService.getDoctorDashboardSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading physician clinical portal..." />;

  const { profile, pendingCases = [], activeCases = [], upcomingAppointments = [], completedCount = 0 } =
    data || {};

  const isPending = profile?.verificationStatus === 'PENDING' || user?.status === 'PENDING_VERIFICATION';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Verification Alert Banner if Pending */}
        {isPending ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-950/60 border-l-4 border-amber-500 rounded-r-3xl p-6 shadow-xl flex items-start space-x-4 border border-amber-800/60"
          >
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h2 className="text-sm font-black text-amber-200 uppercase tracking-wider">
                Physician Credential Verification Pending
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 mt-1.5 leading-relaxed">
                Your medical license (License: <strong className="text-white font-mono">{profile?.licenseNumber}</strong>) is currently undergoing administrative verification by platform medical governance. Once approved, clinical case intake and patient booking will be enabled.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-teal-950/80 rounded-3xl p-6 sm:p-9 border border-blue-500/30 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Physician Portal ({profile?.specialization})</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {user?.fullName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {profile?.hospitalAffiliation || 'CareBridge Clinical Network'} • {profile?.experienceYears} Years Clinical Experience
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to="/doctor/appointments"
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Consultation Schedule</span>
                </Link>
                <Link
                  to="/doctor/profile"
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center space-x-2"
                >
                  <User className="w-4 h-4 text-teal-400" />
                  <span>Manage Profile</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Pending Queue
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono">{pendingCases.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting clinical review</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Cases
            </span>
            <div className="text-3xl font-black text-teal-400 font-mono">{activeCases.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Under your consultation</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Upcoming Slots
            </span>
            <div className="text-3xl font-black text-cyan-400 font-mono">{upcomingAppointments.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Booked patient sessions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Resolved Cases
            </span>
            <div className="text-3xl font-black text-slate-200 font-mono">{completedCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Completed evaluations</p>
          </motion.div>
        </div>

        {/* 2-Column Section: Pending Queue & Upcoming Consultations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned & Specialty Queue */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Assigned & Specialty Patient Queue</span>
              </h2>
            </div>

            {pendingCases.length === 0 && activeCases.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No patient cases currently awaiting clinical evaluation in your queue.
              </div>
            ) : (
              <div className="space-y-3">
                {[...activeCases, ...pendingCases].slice(0, 5).map((c) => (
                  <Link
                    key={c._id || c.id}
                    to={`/doctor/cases/${c._id || c.id}`}
                    className="block p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:border-teal-500/50 hover:bg-slate-950/90 transition group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-teal-400">{c.caseNumber}</span>
                      <Badge variant={c.status}>{c.status.replace('_', ' ')}</Badge>
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-teal-300 transition">
                      {c.mainProblem}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                      <span>Patient: <strong className="text-slate-300">{c.patientId?.fullName}</strong></span>
                      <span className="font-bold text-teal-400 group-hover:translate-x-1 transition flex items-center gap-1">
                        Review Case &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Consultations */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Scheduled Consultations</span>
              </h2>
              <Link to="/doctor/appointments" className="text-xs font-bold text-teal-400 hover:text-teal-300">
                View Schedule &rarr;
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No upcoming consultations scheduled today.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((app) => (
                  <div
                    key={app._id || app.id}
                    className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-white text-sm">
                          {app.patientId?.fullName}
                        </span>
                        <Badge variant={app.status}>{app.status}</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 font-mono">
                        <span>{new Date(app.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-bold text-teal-300">{app.timeSlot}</span>
                        <span>•</span>
                        <span>{app.consultationMode}</span>
                      </div>
                    </div>

                    <Link
                      to="/doctor/appointments"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 rounded-xl text-xs font-bold transition"
                    >
                      Update
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
