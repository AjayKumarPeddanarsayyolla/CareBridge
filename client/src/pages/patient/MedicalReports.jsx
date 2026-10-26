import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, ArrowLeft, PlusCircle, FileCheck, Search } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as api from '../../services/api';

export const MedicalReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.default.get('/cases');
      if (res.data.success) {
        const allReports = [];
        res.data.data.forEach((c) => {
          if (c.uploadedReports && c.uploadedReports.length > 0) {
            c.uploadedReports.forEach((r) => {
              allReports.push({ ...r, caseNumber: c.caseNumber, mainProblem: c.mainProblem });
            });
          }
        });
        setReports(allReports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    (rep) =>
      rep.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Diagnostic Repository</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Medical Reports & Imaging
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Encrypted patient laboratory test documents, radiology scans, and pathology notes.
            </p>
          </div>

          {/* Search box */}
          {reports.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving documents from encrypted storage..." />
        ) : filteredReports.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">No Medical Reports Attached</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm
                  ? 'No documents matched your search filter.'
                  : 'When you attach clinical files to an intake concern or case discussion, your medical records will automatically appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((rep, idx) => (
              <motion.div
                key={rep._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl flex items-center justify-between gap-4 backdrop-blur-md hover:border-teal-500/40 transition group"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-teal-300 transition">
                      {rep.originalName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Case: <strong className="text-teal-400">{rep.caseNumber}</strong> • {(rep.fileSize / 1024).toFixed(1)} KB
                    </p>
                    {rep.description && (
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rep.description}</p>
                    )}
                  </div>
                </div>

                <a
                  href={`/api/cases/reports/${rep._id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500 rounded-xl text-xs font-bold text-teal-300 flex items-center space-x-1.5 flex-shrink-0 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View</span>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
