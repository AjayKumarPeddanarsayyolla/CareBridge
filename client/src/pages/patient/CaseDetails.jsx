import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  AlertTriangle,
  FileText,
  MessageSquare,
  Upload,
  Send,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  User,
  PlusCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as caseService from '../../services/caseService';
import * as api from '../../services/api';

export const CaseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [healthCase, setHealthCase] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Report Upload in Case State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [reportDesc, setReportDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchCaseDetails = async () => {
    try {
      const res = await caseService.getCaseById(id);
      if (res.success) {
        setHealthCase(res.data.healthCase);
        setConsultations(res.data.consultations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.default.get(`/messages/case/${id}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
    fetchMessages();
  }, [id]);

  // Socket.IO Room setup for Real-time messaging
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_case', { caseId: id });

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.emit('leave_case', { caseId: id });
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      caseId: id,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportFile) return;
    setUploading(true);

    try {
      const data = new FormData();
      data.append('reportFile', reportFile);
      data.append('description', reportDesc);

      const res = await caseService.uploadCaseReport(id, data);
      if (res.success) {
        setReportFile(null);
        setReportDesc('');
        setUploadOpen(false);
        fetchCaseDetails();
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving clinical case file..." />;
  if (!healthCase) {
    return (
      <div className="min-h-screen bg-slate-900 py-16 text-center text-slate-100">
        <p className="text-slate-400 text-sm">Health case not found.</p>
        <Link to="/patient/cases" className="mt-4 inline-block text-teal-400 font-bold text-xs">
          &larr; Back to My Cases
        </Link>
      </div>
    );
  }

  const doctorIdVal = healthCase.assignedDoctorId?._id || healthCase.assignedDoctorId?.id;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            to="/patient/cases"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-teal-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Case Ledger</span>
          </Link>

          <div className="flex items-center space-x-2 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Case ID:</span>
            <span className="text-xs font-black font-mono text-teal-400">{healthCase.caseNumber}</span>
          </div>
        </div>

        {/* Case Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={healthCase.status}>{healthCase.status.replace('_', ' ')}</Badge>
              <Badge variant={healthCase.recommendedCareLevel}>
                {healthCase.recommendedCareLevel?.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-slate-400">
                Opened {new Date(healthCase.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {healthCase.mainProblem}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Matched Specialist Discipline:{' '}
              <strong className="text-teal-300 font-black">{healthCase.matchedSpecialization}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {healthCase.assignedDoctorId ? (
              <Link
                to={`/patient/appointments?doctorId=${doctorIdVal}&caseId=${healthCase._id || healthCase.id}`}
                className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment with {healthCase.assignedDoctorId.fullName?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to={`/patient/appointments?caseId=${healthCase._id || healthCase.id}&specialization=${healthCase.matchedSpecialization}`}
                className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Specialist Slot</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* 2-Column Layout: Clinical File Details & Live Doctor Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Symptoms, Doctor Guidance, Reports */}
          <div className="lg:col-span-7 space-y-6">
            {/* Symptoms Card */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-400">
                Reported Clinical Profile
              </h2>

              <div className="grid grid-cols-1 gap-2.5">
                {healthCase.symptoms?.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <span className="text-slate-400 ml-2.5 text-xs">Onset: {s.startedAt}</span>
                    </div>
                    <Badge variant={s.severity} size="sm">
                      {s.severity}
                    </Badge>
                  </div>
                ))}
              </div>

              {healthCase.medicalHistorySummary && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    Medical Background Summary:
                  </span>
                  <p className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
                    {healthCase.medicalHistorySummary}
                  </p>
                </div>
              )}
            </div>

            {/* Doctor Clinical Guidance Section */}
            <div className="bg-slate-900/90 rounded-3xl border border-teal-500/30 p-6 shadow-xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Physician Consultation & Guidance</span>
                </h2>
                {consultations.length > 0 && (
                  <Badge variant={consultations[0].status}>{consultations[0].status}</Badge>
                )}
              </div>

              {consultations.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  A verified physician is reviewing your intake data. Clinical guidance will appear here once formulated.
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((c) => (
                    <div key={c._id || c.id} className="space-y-3">
                      <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/50 space-y-1.5">
                        <span className="text-[11px] font-black text-teal-300 uppercase tracking-wider">
                          General Clinical Guidance
                        </span>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {c.generalGuidance}
                        </p>
                      </div>

                      {c.firstAidInstructions && (
                        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 space-y-1.5">
                          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
                            First-Aid Instructions
                          </span>
                          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                            {c.firstAidInstructions}
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 space-y-1.5">
                        <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wider">
                          Recommended Next Steps
                        </span>
                        <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                          {c.recommendedNextSteps}
                        </p>
                      </div>

                      {c.inPersonRecommended && (
                        <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-purple-200 text-xs font-semibold">
                          🏥 <strong>Doctor Referral:</strong> An in-person physical clinical consultation is strongly recommended for diagnostic clarity.
                        </div>
                      )}

                      {c.emergencyEvaluationRecommended && (
                        <div className="p-4 rounded-2xl bg-red-600 text-white text-xs font-black shadow-lg">
                          🚨 <strong>Immediate Emergency Department Referral:</strong> Consulting physician advises proceeding to the nearest emergency facility.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attached Medical Reports Card */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Medical Reports ({healthCase.uploadedReports?.length || 0})
                </h2>
                <button
                  type="button"
                  onClick={() => setUploadOpen(!uploadOpen)}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300"
                >
                  {uploadOpen ? 'Cancel' : '+ Attach Report'}
                </button>
              </div>

              {uploadOpen && (
                <form
                  onSubmit={handleUploadReport}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                >
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setReportFile(e.target.files[0] || null)}
                    className="text-xs text-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Short description (e.g. CBC lab result)"
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={uploading || !reportFile}
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black disabled:opacity-50 transition"
                  >
                    {uploading ? 'Uploading...' : 'Upload Report File'}
                  </button>
                </form>
              )}

              {healthCase.uploadedReports?.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No medical reports uploaded for this case.</p>
              ) : (
                <div className="space-y-2">
                  {healthCase.uploadedReports?.map((rep) => (
                    <div
                      key={rep._id || rep.id}
                      className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-teal-400" />
                        <div>
                          <span className="font-bold text-white">{rep.originalName}</span>
                          <span className="text-slate-400 ml-2 font-mono">
                            ({(rep.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </div>
                      <a
                        href={`/api/cases/reports/${rep._id || rep.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-teal-300 font-bold flex items-center space-x-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Real-time Doctor Chat via Socket.IO */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[620px] overflow-hidden backdrop-blur-xl">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-white">Doctor Case Discussion</h3>
                  <p className="text-[11px] text-teal-400">Encrypted Clinical Channel</p>
                </div>
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  Start the discussion with your consulting physician.
                </div>
              ) : (
                messages.map((msg) => {
                  const myUserId = user?.id || user?._id;
                  const senderIdVal = msg.senderId?._id || msg.senderId?.id || msg.senderId;
                  const isMe = senderIdVal === myUserId;
                  const isDoctor = msg.senderRole === 'DOCTOR';
                  return (
                    <div
                      key={msg._id || msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1 mb-1 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300">
                          {msg.senderId?.fullName || (isMe ? 'You' : 'Doctor')}
                        </span>
                        {isDoctor && (
                          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded font-bold">
                            MD
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-medium rounded-br-xs shadow-md'
                            : isDoctor
                            ? 'bg-slate-800 border border-teal-500/40 text-white rounded-bl-xs shadow-md'
                            : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Type clinical query or symptom update..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center space-x-1.5 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
