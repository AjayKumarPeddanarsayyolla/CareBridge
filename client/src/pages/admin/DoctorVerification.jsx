import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Check, X, ShieldCheck, AlertCircle, ArrowLeft, Building, Award, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as adminService from '../../services/adminService';

export const DoctorVerification = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPendingDoctors();
      if (res.success) {
        setPendingDoctors(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (docProfileId) => {
    setActionLoading(true);
    try {
      const res = await adminService.verifyDoctor(docProfileId);
      if (res.success) {
        fetchPending();
      }
    } catch (err) {
      alert('Verification failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (docProfileId) => {
    const reason = window.prompt('Please enter the reason for rejecting this application:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await adminService.rejectDoctor(docProfileId, reason);
      if (res.success) {
        fetchPending();
      }
    } catch (err) {
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-amber-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Overview</span>
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Credentialing & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Doctor Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Validate physician medical licenses and approve doctor accounts for clinical consultations.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Checking credential requests..." />
        ) : pendingDoctors.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">All Applications Reviewed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no pending doctor verification applications currently awaiting administrative review.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDoctors.map((doc) => (
              <motion.div
                key={doc._id || doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {doc.userId?.fullName?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-white text-base">{doc.userId?.fullName}</h3>
                      <Badge variant="PENDING">Pending Review</Badge>
                      <span className="font-bold text-amber-300 text-xs px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 font-mono">
                        {doc.specialization}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Email: <span className="font-mono text-slate-300 font-semibold">{doc.userId?.email}</span> • Mobile:{' '}
                      <span className="font-mono text-slate-300 font-semibold">{doc.userId?.mobile}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-3 font-mono">
                      <span className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
                        License: <strong className="text-white">{doc.licenseNumber}</strong>
                      </span>
                      <span className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
                        Degree: <strong className="text-white">{doc.qualification}</strong>
                      </span>
                      <span className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
                        Hospital: <strong className="text-white">{doc.hospitalAffiliation}</strong>
                      </span>
                      <span className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
                        Exp: <strong className="text-white">{doc.experienceYears} Years</strong>
                      </span>
                    </div>

                    {doc.biography && (
                      <p className="text-xs text-slate-300 mt-3 italic bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                        "{doc.biography}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-2 md:pt-0">
                  <button
                    onClick={() => handleReject(doc._id || doc.id)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 border border-rose-800/60 text-rose-400 hover:bg-rose-950/60 rounded-xl text-xs font-bold transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerify(doc._id || doc.id)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-teal-500/25 transition flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
