import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Shield, Plus, X, AlertCircle, CheckCircle2, Save, Activity } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as api from '../../services/api';

export const PatientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    fullName: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'PREFER_NOT_TO_SAY',
    bloodGroup: 'UNKNOWN',
    allergies: [],
    existingConditions: [],
    currentMedications: [],
    medicalHistory: '',
    emergencyContact: { name: '', relation: '', phone: '' }
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.default.get('/patients/profile');
        if (res.data.success) {
          const { user, profile: p } = res.data.data;
          setProfile({
            fullName: user.fullName || '',
            mobile: user.mobile || '',
            dateOfBirth: p?.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
            gender: p?.gender || 'PREFER_NOT_TO_SAY',
            bloodGroup: p?.bloodGroup || 'UNKNOWN',
            allergies: p?.allergies || [],
            existingConditions: p?.existingConditions || [],
            currentMedications: p?.currentMedications || [],
            medicalHistory: p?.medicalHistory || '',
            emergencyContact: p?.emergencyContact || { name: '', relation: '', phone: '' }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile((prev) => ({ ...prev, allergies: [...prev.allergies, newAllergy.trim()] }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (idx) => {
    setProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== idx)
    }));
  };

  const handleAddCondition = () => {
    if (newCondition.trim() && !profile.existingConditions.includes(newCondition.trim())) {
      setProfile((prev) => ({
        ...prev,
        existingConditions: [...prev.existingConditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (idx) => {
    setProfile((prev) => ({
      ...prev,
      existingConditions: prev.existingConditions.filter((_, i) => i !== idx)
    }));
  };

  const handleAddMedication = () => {
    if (newMedication.trim() && !profile.currentMedications.includes(newMedication.trim())) {
      setProfile((prev) => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (idx) => {
    setProfile((prev) => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.default.put('/patients/profile', profile);
      if (res.data.success) {
        setSuccess('Health baseline profile updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading health profile..." />;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Clinical Health Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            My Health & Medical Baseline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keep your health information up to date so consulting physicians have the full clinical context.
          </p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-teal-950/70 border border-teal-800 text-teal-200 text-xs sm:text-sm flex items-center space-x-2.5"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-center space-x-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Demographic Information */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Personal & Contact Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Blood Group</label>
                <select
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-bold"
                >
                  <option value="UNKNOWN">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinical Allergies & Medications */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-md">
            <h2 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Allergies, Medications & Chronic Conditions</span>
            </h2>

            {/* Allergies Tag Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Known Drug & Environmental Allergies</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Latex..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies?.length === 0 ? (
                  <span className="text-xs text-slate-500">No allergies recorded</span>
                ) : (
                  profile.allergies?.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-950/60 text-rose-300 border border-rose-800/60 text-xs rounded-full font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(idx)}
                        className="hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Existing Medical Conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Existing Medical Diagnoses</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Asthma, Hypertension, Diabetes..."
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.existingConditions?.length === 0 ? (
                  <span className="text-xs text-slate-500">No chronic conditions recorded</span>
                ) : (
                  profile.existingConditions?.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/60 text-xs rounded-full font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        className="hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Active Prescribed Medications</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Lisinopril 10mg once daily..."
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.currentMedications?.length === 0 ? (
                  <span className="text-xs text-slate-500">No active medications recorded</span>
                ) : (
                  profile.currentMedications?.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-950/60 text-teal-300 border border-teal-800/60 text-xs rounded-full font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Medical History */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Surgical History & Clinical Notes</label>
              <textarea
                rows="3"
                value={profile.medicalHistory}
                onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })}
                placeholder="Include past operations, hospitalizations, or family cardiac history..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Emergency Contact Information */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Designated Primary Emergency Contact</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Contact Name</label>
                <input
                  type="text"
                  value={profile.emergencyContact?.name || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergencyContact: { ...profile.emergencyContact, name: e.target.value }
                    })
                  }
                  placeholder="e.g. Mary Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Relationship</label>
                <input
                  type="text"
                  value={profile.emergencyContact?.relation || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergencyContact: { ...profile.emergencyContact, relation: e.target.value }
                    })
                  }
                  placeholder="e.g. Spouse, Mother"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={profile.emergencyContact?.phone || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emergencyContact: { ...profile.emergencyContact, phone: e.target.value }
                    })
                  }
                  placeholder="+1 (555) 999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-teal-500/25 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Health Baseline...' : 'Save Health Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
