import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  AlertTriangle,
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Radio,
  PhoneCall,
  Loader2,
  ChevronRight,
  Sparkles,
  Activity,
  FileBadge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSOS, setActiveSOS] = useState(null);
  const [sosLoading, setSosLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sosStatusMsg, setSosStatusMsg] = useState('');

  const fetchSummary = async () => {
    try {
      const [summaryRes, sosRes] = await Promise.allSettled([
        api.get('/patients/dashboard-summary'),
        api.get('/emergency/sos/active')
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value.data.success) {
        setDashboardData(summaryRes.value.data.data);
      }
      if (sosRes.status === 'fulfilled' && sosRes.value.data.success) {
        setActiveSOS(sosRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleTriggerSOS = async () => {
    setSosLoading(true);
    setShowConfirmModal(false);
    setSosStatusMsg('');

    try {
      let coords = {};
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
        } catch {
          // Geolocation optional fallback
        }
      }

      const res = await api.post('/emergency/sos', {
        ...coords,
        notes: 'Emergency SOS initiated from Patient Dashboard.',
        address: coords.latitude ? `GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : 'Local GPS Unavailable'
      });

      if (res.data.success) {
        setActiveSOS(res.data.data);
        setSosStatusMsg('Emergency SOS triggered! Simulated alerts dispatched to contacts.');
      }
    } catch (err) {
      console.error('SOS trigger error', err);
      setSosStatusMsg(err.response?.data?.message || 'Failed to dispatch SOS alert.');
    } finally {
      setSosLoading(false);
    }
  };

  const handleResolveSOS = async () => {
    if (!activeSOS) return;
    setSosLoading(true);
    try {
      await api.post(`/emergency/sos/${activeSOS.id || activeSOS._id}/resolve`, {
        resolutionNotes: 'Patient cleared emergency alarm.'
      });
      setActiveSOS(null);
      setSosStatusMsg('Emergency alert cleared.');
    } catch (err) {
      console.error(err);
    } finally {
      setSosLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Assembling your health profile..." />;

  const {
    profileCompletion = 20,
    profile,
    activeCases = [],
    upcomingAppointments = [],
    recentConsultations = []
  } = dashboardData || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[300px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Welcome Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-teal-900/80 via-slate-900/90 to-teal-950/80 rounded-3xl p-6 sm:p-9 border border-teal-500/30 shadow-2xl backdrop-blur-xl"
        >
          {/* Subtle decoration */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Patient Health Overview</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">{user?.fullName || 'Patient'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Review your active clinical cases, verify upcoming appointments, and keep family caregivers authorized in one secure interface.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-shrink-0">
              <Link
                to="/patient/submit-concern"
                className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Submit Health Concern</span>
              </Link>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={sosLoading}
                className="px-6 py-3.5 bg-red-600/90 hover:bg-red-600 border border-red-500/60 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-900/30 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                id="dashboard-sos-btn"
              >
                <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Emergency SOS</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Active SOS Banner if alert is active */}
        {activeSOS && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg shadow-red-600/50">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-black text-white text-base sm:text-lg">
                    Emergency Distress Signal Active ({activeSOS.status})
                  </h3>
                  <span className="bg-red-800 text-red-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Simulation
                  </span>
                </div>
                <p className="text-xs text-red-200 mt-1">
                  Dispatched on {new Date(activeSOS.activatedAt).toLocaleTimeString()} • Notified {activeSOS.recipients?.length || 0} registered contact(s) & family guardians.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <a
                href="tel:112"
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Dial 112 (ERSS)</span>
              </a>
              <a
                href="tel:108"
                className="px-4 py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow transition"
              >
                <span>108 (Amb)</span>
              </a>
              <button
                onClick={handleResolveSOS}
                disabled={sosLoading}
                className="px-5 py-2.5 bg-slate-900 border border-red-500/60 text-red-300 hover:bg-slate-800 rounded-xl text-xs font-black transition"
              >
                Clear / Resolve Alert
              </button>
            </div>
          </motion.div>
        )}

        {sosStatusMsg && (
          <div className="bg-teal-950/60 border border-teal-500/40 text-teal-200 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>{sosStatusMsg}</span>
            <button onClick={() => setSosStatusMsg('')} className="text-teal-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Profile Completion Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md"
        >
          <div className="w-full sm:w-2/3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-400" />
                Health Profile Completeness
              </span>
              <span className="text-teal-400 font-mono font-black">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Allergies, chronic conditions, and emergency contacts accelerate physician triage accuracy.
            </p>
          </div>

          <Link
            to="/patient/profile"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 hover:border-teal-500 font-bold text-xs rounded-xl transition flex-shrink-0"
          >
            {profileCompletion === 100 ? 'Review Health Baseline' : 'Complete Health Profile'}
          </Link>
        </motion.div>

        {/* Quick Access Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/patient/submit-concern"
            className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 shadow-lg transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-teal-300 transition">New Concern</h3>
            <p className="text-[11px] text-slate-400 mt-1">Symptom submission & triage</p>
          </Link>

          <Link
            to="/patient/appointments"
            className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 shadow-lg transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition">Appointments</h3>
            <p className="text-[11px] text-slate-400 mt-1">Booking & video calls</p>
          </Link>

          <Link
            to="/patient/cases"
            className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 shadow-lg transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition">My Cases</h3>
            <p className="text-[11px] text-slate-400 mt-1">Physician clinical notes</p>
          </Link>

          <Link
            to="/patient/family"
            className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 shadow-lg transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition">Family & Caregivers</h3>
            <p className="text-[11px] text-slate-400 mt-1">Consent & guardian access</p>
          </Link>
        </div>

        {/* 2-Column Section: Active Cases & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Cases */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <h2 className="font-black text-white text-base">Active Clinical Cases</h2>
                </div>
                <Link to="/patient/cases" className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                  <span>View All ({activeCases.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeCases.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <FileBadge className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>No active health cases right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeCases.map((c) => (
                    <Link
                      key={c._id || c.id}
                      to={`/patient/cases/${c._id || c.id}`}
                      className="block p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:border-teal-500/50 hover:bg-slate-950/90 transition group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-teal-400">{c.caseNumber}</span>
                        <Badge variant={c.status}>{c.status.replace('_', ' ')}</Badge>
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-teal-300 transition">
                        {c.mainProblem}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                        <span>Specialty: <strong className="text-slate-300">{c.matchedSpecialization}</strong></span>
                        <span>
                          {c.assignedDoctorId
                            ? `Dr. ${c.assignedDoctorId.fullName}`
                            : 'Pending Doctor'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to="/patient/submit-concern"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Another Concern</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h2 className="font-black text-white text-base">Upcoming Appointments</h2>
                </div>
                <Link to="/patient/appointments" className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>No upcoming appointments scheduled.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((app) => (
                    <div
                      key={app._id || app.id}
                      className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {app.doctorId?.fullName?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">
                            {app.doctorId?.fullName}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                            <span>{new Date(app.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-semibold text-teal-300 font-mono">{app.timeSlot}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={app.status}>{app.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to="/patient/appointments"
                className="w-full py-3 rounded-xl border border-slate-700 hover:border-teal-500 text-slate-200 hover:text-white hover:bg-slate-800/60 font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Schedule New Consultation</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Prevent Accidental SOS Trigger */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-red-500/50">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 text-red-400 border border-red-500/40 flex items-center justify-center font-bold mx-auto">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-black text-white text-xl">Confirm Emergency Distress SOS</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Triggering this will immediately broadcast emergency notifications with your current GPS coordinates to your registered emergency contacts and authorized guardians.
              </p>
            </div>

            <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/50 text-xs text-amber-200">
              <strong className="text-amber-100">Immediate Danger:</strong> If you are in immediate life-threatening physical danger, dial 112 (Pan-India ERSS) or 108 (Ambulance) directly.
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerSOS}
                disabled={sosLoading}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-black text-xs text-white shadow-lg shadow-red-900/50 transition flex items-center justify-center space-x-2"
                id="confirm-sos-btn"
              >
                {sosLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Yes, Broadcast SOS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
