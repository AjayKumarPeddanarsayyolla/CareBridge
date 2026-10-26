import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  AlertTriangle,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Stethoscope,
  Clock,
  ShieldCheck,
  Calendar,
  X,
  Plus,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import * as caseService from '../../services/caseService';
import * as api from '../../services/api';

export const SubmitConcern = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preload patient profile baseline if available
  const [patientBaseline, setPatientBaseline] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.default.get('/patients/profile');
        if (res.data.success) {
          const { profile } = res.data.data;
          setPatientBaseline(profile);
          if (profile) {
            setFormData((prev) => ({
              ...prev,
              allergies: profile.allergies || [],
              currentMedications: profile.currentMedications || [],
              medicalHistorySummary: profile.medicalHistory || ''
            }));
          }
        }
      } catch (e) {
        // Not fatal if baseline fails
      }
    };
    loadProfile();
  }, []);

  const [formData, setFormData] = useState({
    mainProblem: '',
    severity: 'MODERATE',
    age: '35',
    symptoms: [{ name: '', startedAt: '2 days ago', severity: 'MODERATE' }],
    medicalHistorySummary: '',
    currentMedications: [],
    allergies: [],
    additionalInfo: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState('');

  // Triage Result after submission
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleSymptomChange = (index, field, value) => {
    const updated = [...formData.symptoms];
    updated[index][field] = value;
    setFormData({ ...formData, symptoms: updated });
  };

  const addSymptomRow = () => {
    setFormData({
      ...formData,
      symptoms: [...formData.symptoms, { name: '', startedAt: '1 day ago', severity: 'MODERATE' }]
    });
  };

  const removeSymptomRow = (index) => {
    if (formData.symptoms.length > 1) {
      setFormData({
        ...formData,
        symptoms: formData.symptoms.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmitCase = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!formData.mainProblem.trim()) {
        setError('Please describe your main health concern.');
        setLoading(false);
        return;
      }

      const validSymptoms = formData.symptoms.filter((s) => s.name.trim());
      if (validSymptoms.length === 0) {
        setError('Please add at least one specific symptom.');
        setLoading(false);
        return;
      }

      const payload = {
        mainProblem: formData.mainProblem,
        symptoms: validSymptoms,
        severity: formData.severity,
        age: Number(formData.age) || 30,
        medicalHistorySummary: formData.medicalHistorySummary,
        currentMedications: formData.currentMedications,
        allergies: formData.allergies,
        additionalInfo: formData.additionalInfo
      };

      const res = await caseService.createCase(payload);

      if (res.success) {
        const createdCase = res.data.healthCase;

        // If file was attached, upload report
        if (selectedFile) {
          const fileData = new FormData();
          fileData.append('reportFile', selectedFile);
          fileData.append('description', fileDescription || 'Patient uploaded clinical report');
          try {
            await caseService.uploadCaseReport(createdCase._id || createdCase.id, fileData);
          } catch (uploadErr) {
            console.error('Report upload warning:', uploadErr);
          }
        }

        setSubmissionResult(res.data);
        setStep(4); // Move to final assessment summary step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit health concern.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Step Indicator Header */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Structured Health Intake Wizard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Describe Your Health Concern
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Our clinical engine matches your symptoms to safe specialist categories with immediate supportive advice.
          </p>

          {/* Stepper bar */}
          <div className="flex items-center justify-center space-x-2.5 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-12 bg-gradient-to-r from-teal-400 to-cyan-400 shadow-sm shadow-teal-400/40'
                    : step > s
                    ? 'w-6 bg-teal-600'
                    : 'w-4 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* STEP 1: Main Problem & Symptoms */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-9 shadow-2xl space-y-6 backdrop-blur-xl"
          >
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-black text-white">Step 1: Main Concern & Symptoms</h2>
              <p className="text-xs text-slate-400 mt-1">
                Describe the symptoms you are experiencing as accurately as possible.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Chief Health Concern / Main Problem *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Throbbing pain in right temple with light sensitivity and nausea"
                value={formData.mainProblem}
                onChange={(e) => setFormData({ ...formData, mainProblem: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Patient Age *</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Severity Level</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-bold"
                >
                  <option value="MILD">Mild (Manageable discomfort)</option>
                  <option value="MODERATE">Moderate (Interfering with daily routine)</option>
                  <option value="SEVERE">Severe (Intense pain or rapidly progressing)</option>
                  <option value="EMERGENCY">Emergency (Acute distress, chest heaviness)</option>
                </select>
              </div>
            </div>

            {/* Symptoms Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-teal-400">
                  Individual Symptom Breakdown *
                </label>
                <button
                  type="button"
                  onClick={addSymptomRow}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Symptom</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.symptoms.map((sym, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="e.g. Skin rash, Dizziness, Cough..."
                        value={sym.name}
                        onChange={(e) => handleSymptomChange(idx, 'name', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Onset (e.g. 2 days ago)"
                        value={sym.startedAt}
                        onChange={(e) => handleSymptomChange(idx, 'startedAt', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={sym.severity}
                        onChange={(e) => handleSymptomChange(idx, 'severity', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-teal-500"
                      >
                        <option value="MILD">Mild</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="SEVERE">Severe</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      {formData.symptoms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSymptomRow(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  if (!formData.mainProblem.trim()) {
                    setError('Please specify your main health concern.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                className="px-7 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center space-x-2"
              >
                <span>Continue to Medical Baseline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Medical History & Medications */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-9 shadow-2xl space-y-6 backdrop-blur-xl"
          >
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-black text-white">Step 2: Medical Baseline Context</h2>
              <p className="text-xs text-slate-400 mt-1">
                Help physicians understand your health context to avoid adverse contraindications.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Relevant Medical Background & Conditions
              </label>
              <textarea
                rows="3"
                value={formData.medicalHistorySummary}
                onChange={(e) => setFormData({ ...formData, medicalHistorySummary: e.target.value })}
                placeholder="Past surgeries, hypertension, diabetes, asthma, previous reactions..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Additional Observations for the Consulting Doctor
              </label>
              <textarea
                rows="3"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Recent travel history, measured body temperature, changes in diet or work..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-between pt-5 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-7 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center space-x-2"
              >
                <span>Continue to Attachments</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Optional Medical Reports & Submit */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-9 shadow-2xl space-y-6 backdrop-blur-xl"
          >
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-black text-white">Step 3: Attach Reports & Submit</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload lab results, imaging scans, or rash photographs (PDF, PNG, JPG).
              </p>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-800 hover:border-teal-500/60 rounded-3xl p-8 text-center bg-slate-950/60 transition group">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {selectedFile ? selectedFile.name : 'Select Clinical Record or Document'}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Accepted: PDF, PNG, JPG, JPEG (Max 10MB)
              </p>
              <input
                type="file"
                id="medical-report-file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="medical-report-file"
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 hover:border-teal-500/50 font-bold text-xs rounded-xl cursor-pointer shadow-md inline-block transition"
              >
                {selectedFile ? 'Choose Different File' : 'Browse Local Files'}
              </label>

              {selectedFile && (
                <div className="mt-4 text-xs text-teal-300 font-mono font-medium">
                  Attached: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {selectedFile && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Record Description</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC) test from City Lab"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {/* Non-diagnostic notice */}
            <div className="p-4 bg-teal-950/40 border border-teal-800/50 rounded-2xl text-xs text-teal-200 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Clinical Protocol Notice:</strong>
                Submissions trigger automated rule-based urgency evaluation and direct your case to board-certified physicians for thorough review.
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmitCase}
                className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <HeartPulse className="w-4 h-4" />
                <span>{loading ? 'Evaluating & Submitting...' : 'Analyze & Submit Case'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Instant Triage Assessment & Next Steps */}
        {step === 4 && submissionResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6 backdrop-blur-xl"
          >
            {/* Case Submission Success Banner */}
            <div className="text-center pb-6 border-b border-slate-800/80 space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Health Concern Safely Logged
              </h2>
              <p className="text-xs text-slate-400">
                Case Identifier:{' '}
                <span className="font-mono font-bold text-teal-400 text-sm">
                  {submissionResult.healthCase?.caseNumber}
                </span>
              </p>
            </div>

            {/* Emergency Red Flag Notice if Detected */}
            {submissionResult.triageResult?.isEmergency && (
              <div className="p-6 rounded-3xl bg-red-600 text-white shadow-xl space-y-3 border border-red-400">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-amber-300 animate-pulse" />
                  <span className="font-black text-sm uppercase tracking-wider">
                    Emergency Triage Alert Detected
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-red-50 leading-relaxed font-medium">
                  {submissionResult.triageResult.firstAidAdviceSummary}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="tel:112"
                    className="inline-flex items-center space-x-2 px-5 py-3 bg-white text-red-700 font-black text-xs rounded-xl shadow-lg hover:bg-red-50 transition"
                  >
                    <span>Call 112 (National ERSS)</span>
                  </a>
                  <a
                    href="tel:108"
                    className="inline-flex items-center space-x-2 px-5 py-3 bg-red-950/70 border border-white/20 text-white font-black text-xs rounded-xl shadow-lg hover:bg-red-900 transition"
                  >
                    <span>Ambulance 108</span>
                  </a>
                </div>
              </div>
            )}

            {/* Clinical Assessment Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Recommended Care Urgency
                </span>
                <Badge variant={submissionResult.triageResult?.recommendedCareLevel}>
                  {submissionResult.triageResult?.recommendedCareLevel?.replace('_', ' ')}
                </Badge>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Evaluated using standard clinical triage thresholds.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-950/50 border border-teal-800/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                  Matched Clinical Specialization
                </span>
                <span className="font-black text-teal-200 text-lg block">
                  {submissionResult.matchedSpecialization}
                </span>
                <p className="text-xs text-teal-300/80 leading-relaxed">
                  Recommended physician specialty category for this case.
                </p>
              </div>
            </div>

            {/* Immediate First Aid & Self Care Guidance */}
            <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-800/50 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Supportive First-Aid Guidance</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                {submissionResult.triageResult?.firstAidAdviceSummary ||
                  'Rest in a well-ventilated space, maintain hydration, and monitor for sudden escalation.'}
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-500 italic text-center leading-relaxed">
              {submissionResult.triageResult?.disclaimer}
            </p>

            {/* Action Buttons */}
            <div className="pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                to={`/patient/cases/${submissionResult.healthCase?._id || submissionResult.healthCase?.id}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs text-center transition"
              >
                View Case Timeline & Discussion
              </Link>
              <Link
                to={`/patient/appointments?caseId=${submissionResult.healthCase?._id || submissionResult.healthCase?.id}&specialization=${submissionResult.matchedSpecialization}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs text-center shadow-lg shadow-teal-500/25 transition flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation With Specialist</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
