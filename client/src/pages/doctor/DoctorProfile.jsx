import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Award, Building, DollarSign, Calendar, Clock, Save, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as doctorService from '../../services/doctorService';

export const DoctorProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    specialization: 'General Medicine',
    qualification: '',
    experienceYears: 5,
    licenseNumber: '',
    hospitalAffiliation: '',
    consultationFee: 50,
    biography: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableHours: { start: '09:00', end: '17:00' }
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await doctorService.getDoctorById(user.id);
        if (res.success) {
          const doc = res.data;
          setFormData({
            fullName: doc.userId?.fullName || doc.user?.fullName || '',
            mobile: doc.userId?.mobile || doc.user?.mobile || '',
            specialization: doc.specialization || 'General Medicine',
            qualification: doc.qualification || '',
            experienceYears: doc.experienceYears || 0,
            licenseNumber: doc.licenseNumber || '',
            hospitalAffiliation: doc.hospitalAffiliation || '',
            consultationFee: doc.consultationFee || 0,
            biography: doc.biography || '',
            availableDays: doc.availableDays || [],
            availableHours: doc.availableHours || { start: '09:00', end: '17:00' }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [user.id]);

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await doctorService.updateDoctorProfile(formData);
      if (res.success) {
        setSuccess('Doctor profile & clinical schedule updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading doctor credentials..." />;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Physician Credentials</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Doctor Profile & Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain your clinical specialization details, consultation fees, and working hours.
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
          {/* Identity & Contact */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-black text-teal-400 uppercase tracking-wider">Identity & Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Clinical Credentials */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-black text-teal-400 uppercase tracking-wider">Clinical Credentials</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Medical Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-bold"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Dentistry">Dentistry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Degrees / Qualifications</label>
                <input
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">License Registration #</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Consultation Fee ($ / ₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Primary Hospital / Clinic Affiliation</label>
              <input
                type="text"
                value={formData.hospitalAffiliation}
                onChange={(e) => setFormData({ ...formData, hospitalAffiliation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Professional Clinical Biography</label>
              <textarea
                rows="3"
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4 backdrop-blur-md">
            <h2 className="text-xs font-black text-teal-400 uppercase tracking-wider">Working Schedule & Shifts</h2>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Available Consultation Days</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => {
                  const isSelected = formData.availableDays?.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Shift Start Time</label>
                <input
                  type="time"
                  value={formData.availableHours?.start || '09:00'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableHours: { ...formData.availableHours, start: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Shift End Time</label>
                <input
                  type="time"
                  value={formData.availableHours?.end || '17:00'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableHours: { ...formData.availableHours, end: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
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
              <span>{saving ? 'Updating Credentials...' : 'Update Doctor Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
