import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, PlusCircle, ArrowRight, Calendar, User, Clock, FileText, Activity } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import * as caseService from '../../services/caseService';

export const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const res = await caseService.getCases({
          status: filterStatus === 'ALL' ? undefined : filterStatus
        });
        if (res.success) {
          setCases(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [filterStatus]);

  const statuses = ['ALL', 'SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW', 'RESOLVED'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Clinical Registry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Health Cases
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Historical ledger of submitted concerns, triage outputs, and doctor guidance.
            </p>
          </div>
          <Link
            to="/patient/submit-concern"
            className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Health Concern</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 w-fit backdrop-blur-md">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === st
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {st === 'ALL' ? 'All Cases' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Cases List */}
        {loading ? (
          <LoadingSpinner message="Retrieving your health cases..." />
        ) : cases.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">No Health Cases Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You currently have no recorded cases matching the "{filterStatus.replace('_', ' ')}" criteria.
              </p>
            </div>
            <Link
              to="/patient/submit-concern"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-teal-500 text-slate-950 font-black rounded-xl text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit a Health Concern</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cases.map((c, idx) => (
              <motion.div
                key={c._id || c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-teal-500/50 hover:shadow-teal-950/20 transition flex flex-col justify-between group backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-teal-400">{c.caseNumber}</span>
                    <Badge variant={c.status}>{c.status.replace('_', ' ')}</Badge>
                  </div>

                  <h3 className="font-bold text-white text-base mb-3 line-clamp-2 group-hover:text-teal-300 transition">
                    {c.mainProblem}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-400 mb-5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <div className="flex justify-between items-center">
                      <span>Triage Urgency:</span>
                      <Badge variant={c.recommendedCareLevel} size="sm">
                        {c.recommendedCareLevel?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Discipline:</span>
                      <span className="font-bold text-teal-300">{c.matchedSpecialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned Doctor:</span>
                      <span className="font-semibold text-slate-300">
                        {c.assignedDoctorId?.fullName ? `Dr. ${c.assignedDoctorId.fullName}` : 'Pending assignment'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/patient/cases/${c._id || c.id}`}
                    className="font-black text-teal-400 hover:text-teal-300 flex items-center space-x-1.5 group-hover:translate-x-1 transition"
                  >
                    <span>View Case File</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
