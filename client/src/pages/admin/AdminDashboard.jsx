import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Stethoscope,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as adminService from '../../services/adminService';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getAdminStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating platform metrics..." />;

  const {
    totalPatients = 0,
    totalDoctors = 0,
    pendingVerifications = 0,
    activeCases = 0,
    completedConsultations = 0,
    totalFirstAidGuides = 0,
    recentUsers = [],
    recentCases = []
  } = stats || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 rounded-3xl p-6 sm:p-9 border border-amber-500/30 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Operations Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              CareBridge Governance & Metrics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              Medical credential validation, clinical safety triage oversight, and emergency knowledge base curation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/doctors/pending"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center space-x-2"
            >
              <span>Verify Doctors ({pendingVerifications})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Patients
            </span>
            <div className="text-2xl font-black text-white font-mono">{totalPatients}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Physicians
            </span>
            <div className="text-2xl font-black text-teal-400 font-mono">{totalDoctors}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
              Pending Verification
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">{pendingVerifications}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Cases
            </span>
            <div className="text-2xl font-black text-cyan-400 font-mono">{activeCases}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Consultations
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{completedConsultations}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              First-Aid CMS
            </span>
            <div className="text-2xl font-black text-purple-400 font-mono">{totalFirstAidGuides}</div>
          </motion.div>
        </div>

        {/* Admin Quick Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/doctors/pending"
            className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl hover:border-amber-500/50 hover:bg-slate-800/60 transition group backdrop-blur-md"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition">Doctor Verification</h3>
            <p className="text-[11px] text-slate-400 mt-1">Approve physician licenses</p>
          </Link>

          <Link
            to="/admin/users"
            className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl hover:border-blue-500/50 hover:bg-slate-800/60 transition group backdrop-blur-md"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition">User Directory</h3>
            <p className="text-[11px] text-slate-400 mt-1">Manage & suspend accounts</p>
          </Link>

          <Link
            to="/admin/first-aid"
            className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl hover:border-purple-500/50 hover:bg-slate-800/60 transition group backdrop-blur-md"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition">First Aid Library</h3>
            <p className="text-[11px] text-slate-400 mt-1">Curate emergency content</p>
          </Link>

          <Link
            to="/admin/audit-logs"
            className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl hover:border-teal-500/50 hover:bg-slate-800/60 transition group backdrop-blur-md"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-teal-300 transition">Audit Logs</h3>
            <p className="text-[11px] text-slate-400 mt-1">Compliance & action ledger</p>
          </Link>
        </div>

        {/* Recent Cases & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Cases */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-black text-amber-400 uppercase tracking-wider">
              Recent Clinical Cases
            </h2>
            <div className="space-y-2.5">
              {recentCases.map((c) => (
                <div
                  key={c._id || c.id}
                  className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-teal-400 font-bold block">{c.caseNumber}</span>
                    <span className="font-bold text-white line-clamp-1 mt-0.5">{c.mainProblem}</span>
                    <span className="text-[11px] text-slate-400">
                      Patient: {c.patientId?.fullName} • {c.matchedSpecialization}
                    </span>
                  </div>
                  <Badge variant={c.status}>{c.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-black text-blue-400 uppercase tracking-wider">
              Recent User Registrations
            </h2>
            <div className="space-y-2.5">
              {recentUsers.map((u) => (
                <div
                  key={u._id || u.id}
                  className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{u.fullName}</span>
                    <span className="text-slate-400 block text-[11px] font-mono">{u.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary">{u.role?.replace('_', ' ')}</Badge>
                    <Badge variant={u.status}>{u.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
