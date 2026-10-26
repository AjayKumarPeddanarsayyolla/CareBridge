import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, ArrowLeft, Clock, User, ShieldAlert, KeyRound } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as adminService from '../../services/adminService';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await adminService.getAuditLogs();
        if (res.success) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-teal-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Overview</span>
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Compliance & Security Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Platform Administrative Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable log of credential verification, user suspensions, and clinical content updates.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving security logs..." />
        ) : logs.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center text-slate-500 text-xs">
            No administrative security events recorded yet.
          </div>
        ) : (
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
            <div className="divide-y divide-slate-800/80">
              {logs.map((log, idx) => (
                <motion.div
                  key={log._id || log.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-5 flex items-start space-x-4 hover:bg-slate-800/40 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-teal-300 uppercase tracking-wider text-xs">
                        {log.actionType?.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200 mt-1.5 leading-relaxed font-medium">{log.details}</p>
                    <div className="text-[11px] text-slate-400 mt-2 font-mono">
                      Admin: <strong className="text-white">{log.adminId?.fullName}</strong> ({log.adminId?.email})
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
