import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  FileText,
  Download,
  Send,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  User,
  Check,
  Building,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as caseService from '../../services/caseService';
import * as doctorService from '../../services/doctorService';
import * as api from '../../services/api';

export const DoctorCaseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [healthCase, setHealthCase] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor Form State
  const [guidanceData, setGuidanceData] = useState({
    generalGuidance: '',
    firstAidInstructions: '',
    recommendedNextSteps: '',
    inPersonRecommended: false,
    emergencyEvaluationRecommended: false,
    consultationNotes: '',
    markResolved: false
  });
  const [submittingGuidance, setSubmittingGuidance] = useState(false);
  const [guidanceSuccess, setGuidanceSuccess] = useState('');
  const [guidanceError, setGuidanceError] = useState('');

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const fetchCaseDetails = async () => {
    try {
      const res = await caseService.getCaseById(id);
      if (res.success) {
        setHealthCase(res.data.healthCase);
        setConsultations(res.data.consultations || []);

        if (res.data.consultations && res.data.consultations.length > 0) {
          const c = res.data.consultations[0];
          setGuidanceData({
            generalGuidance: c.generalGuidance || '',
            firstAidInstructions: c.firstAidInstructions || '',
            recommendedNextSteps: c.recommendedNextSteps || '',
            inPersonRecommended: Boolean(c.inPersonRecommended),
            emergencyEvaluationRecommended: Boolean(c.emergencyEvaluationRecommended),
            consultationNotes: c.consultationNotes || '',
            markResolved: c.status === 'COMPLETED'
          });
        }
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

  // Real-time chat socket
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

  const handleAcceptCase = async () => {
    try {
      const res = await doctorService.acceptCase(id);
      if (res.success) {
        fetchCaseDetails();
      }
    } catch (err) {
      alert('Failed to accept case: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGuidanceSubmit = async (e) => {
    e.preventDefault();
    setGuidanceError('');
    setGuidanceSuccess('');
    setSubmittingGuidance(true);

    try {
      const res = await doctorService.provideGuidance(id, guidanceData);
      if (res.success) {
        setGuidanceSuccess('Clinical consultation guidance submitted successfully!');
        fetchCaseDetails();
      }
    } catch (err) {
      setGuidanceError(err.response?.data?.message || 'Failed to submit guidance.');
    } finally {
      setSubmittingGuidance(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      caseId: id,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  if (loading) return <LoadingSpinner message="Loading patient case file..." />;
  if (!healthCase) {
    return (
      <div className="min-h-screen bg-slate-900 py-16 text-center text-slate-100">
        <p className="text-slate-400 text-sm">Case file not found.</p>
        <Link to="/doctor" className="mt-4 inline-block text-teal-400 font-bold text-xs">
          &larr; Back to Doctor Portal
        </Link>
      </div>
    );
  }

  const assignedDocId = healthCase.assignedDoctorId?._id || healthCase.assignedDoctorId?.id;
  const myUserId = user?.id || user?._id;
  const isAssignedToMe = assignedDocId === myUserId;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/doctor"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-teal-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Physician Dashboard</span>
          </Link>

          <span className="font-mono text-xs font-bold text-teal-400 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
            Case Ref: {healthCase.caseNumber}
          </span>
        </div>

        {/* Case Header */}
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
                Patient: <strong className="text-white">{healthCase.patientId?.fullName}</strong> (Age {healthCase.ageAtSubmission})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {healthCase.mainProblem}
            </h1>
          </div>

          {!isAssignedToMe && healthCase.status === 'SUBMITTED' && (
            <button
              onClick={handleAcceptCase}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Accept & Review Case</span>
            </button>
          )}
        </motion.div>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Patient Profile, Symptoms, Doctor Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clinical Symptoms & Baseline */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-400">
                Reported Clinical Symptoms
              </h2>

              <div className="space-y-2.5">
                {healthCase.symptoms?.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <span className="text-slate-400 ml-2.5 font-mono text-xs">Onset: {s.startedAt}</span>
                    </div>
                    <Badge variant={s.severity} size="sm">
                      {s.severity}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Baseline Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Known Allergies:</span>
                  <span className="text-rose-400 font-semibold">
                    {healthCase.allergies?.length ? healthCase.allergies.join(', ') : 'None stated'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Active Prescriptions:</span>
                  <span className="text-teal-300 font-semibold">
                    {healthCase.currentMedications?.length
                      ? healthCase.currentMedications.join(', ')
                      : 'None stated'}
                  </span>
                </div>
              </div>

              {healthCase.medicalHistorySummary && (
                <div className="pt-2 text-xs">
                  <span className="text-slate-400 font-bold block mb-1">Medical Background:</span>
                  <p className="text-slate-300 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
                    {healthCase.medicalHistorySummary}
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Reports View */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3 backdrop-blur-md">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Uploaded Patient Reports & Diagnostic Imaging
              </h2>
              {healthCase.uploadedReports?.length === 0 ? (
                <p className="text-xs text-slate-500">No medical reports uploaded for this case.</p>
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
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-teal-300 font-bold flex items-center space-x-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctor Clinical Advice & Triage Form */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-5 backdrop-blur-md">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-teal-400" />
                  <span>Physician Consultation Notes & Clinical Directive</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Formulate supportive guidance, first-aid measures, and in-person referral decisions.
                </p>
              </div>

              {/* Notice */}
              <div className="p-4 bg-amber-950/40 border border-amber-800/50 rounded-2xl text-xs text-amber-200 leading-relaxed">
                <strong className="text-amber-100">Clinical Protocol Notice:</strong> Pharmacological prescription generation is restricted. Provide supportive home care, lifestyle recommendations, and emergency triage instructions.
              </div>

              {guidanceSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-teal-950/70 border border-teal-800 text-teal-200 text-xs flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>{guidanceSuccess}</span>
                </motion.div>
              )}

              {guidanceError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{guidanceError}</span>
                </motion.div>
              )}

              <form onSubmit={handleGuidanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    General Clinical Impressions *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Clinical evaluation regarding reported symptoms and physiological baseline..."
                    value={guidanceData.generalGuidance}
                    onChange={(e) =>
                      setGuidanceData({ ...guidanceData, generalGuidance: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    First-Aid & Self-Care Instructions
                  </label>
                  <textarea
                    rows="2"
                    placeholder="At-home supportive measures (e.g. cold compresses, hydration, elevation)..."
                    value={guidanceData.firstAidInstructions}
                    onChange={(e) =>
                      setGuidanceData({ ...guidanceData, firstAidInstructions: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Recommended Next Steps *
                  </label>
                  <textarea
                    rows="2"
                    required
                    placeholder="Monitoring duration, criteria for red flags, and follow-up timeline..."
                    value={guidanceData.recommendedNextSteps}
                    onChange={(e) =>
                      setGuidanceData({ ...guidanceData, recommendedNextSteps: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>

                {/* Direct Referrals Checkboxes */}
                <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <label className="flex items-center space-x-2.5 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={guidanceData.inPersonRecommended}
                      onChange={(e) =>
                        setGuidanceData({ ...guidanceData, inPersonRecommended: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-0"
                    />
                    <span>Recommend formal in-person physical clinical examination</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer text-red-400 font-bold">
                    <input
                      type="checkbox"
                      checked={guidanceData.emergencyEvaluationRecommended}
                      onChange={(e) =>
                        setGuidanceData({
                          ...guidanceData,
                          emergencyEvaluationRecommended: e.target.checked
                        })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-red-500 focus:ring-0"
                    />
                    <span>🚨 Recommend immediate Emergency Department evaluation (Acute Red Flag)</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer text-emerald-400 font-bold pt-1">
                    <input
                      type="checkbox"
                      checked={guidanceData.markResolved}
                      onChange={(e) =>
                        setGuidanceData({ ...guidanceData, markResolved: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Mark health case as RESOLVED and conclude consultation session</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingGuidance}
                    className="px-7 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submittingGuidance ? 'Updating Guidance...' : 'Publish Clinical Guidance'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Real-Time Patient Messaging */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">Telehealth Consultation Chat</h3>
                  <p className="text-[10px] text-teal-400">Patient: {healthCase.patientId?.fullName}</p>
                </div>
              </div>
            </div>

            {/* Chat Transcript */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  No messages exchanged yet. Send an opening greeting to the patient.
                </div>
              ) : (
                messages.map((msg) => {
                  const senderIdVal = msg.senderId?._id || msg.senderId?.id || msg.senderId;
                  const isMe = senderIdVal === myUserId;
                  return (
                    <div
                      key={msg._id || msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1 mb-1 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300">
                          {msg.senderId?.fullName || (isMe ? 'You (Doctor)' : 'Patient')}
                        </span>
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
                            : 'bg-slate-800 border border-slate-700 text-white rounded-bl-xs shadow-md'
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
                placeholder="Type your response to the patient..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center space-x-1 disabled:opacity-40"
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
