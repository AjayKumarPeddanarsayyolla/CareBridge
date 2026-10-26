import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  User,
  Users,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Calendar,
  Building,
  Award,
  DollarSign,
  FileBadge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('PATIENT');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    // Patient
    dateOfBirth: '',
    gender: 'PREFER_NOT_TO_SAY',
    bloodGroup: 'UNKNOWN',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Doctor
    specialization: 'General Medicine',
    qualification: '',
    experienceYears: '',
    licenseNumber: '',
    hospitalAffiliation: '',
    consultationFee: '50',
    biography: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        role,
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      };

      if (role === 'PATIENT') {
        payload.dateOfBirth = formData.dateOfBirth || null;
        payload.gender = formData.gender;
        payload.bloodGroup = formData.bloodGroup;
        payload.emergencyContact = {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone
        };
      } else if (role === 'DOCTOR') {
        payload.specialization = formData.specialization;
        payload.qualification = formData.qualification;
        payload.experienceYears = Number(formData.experienceYears) || 0;
        payload.licenseNumber = formData.licenseNumber;
        payload.hospitalAffiliation = formData.hospitalAffiliation;
        payload.consultationFee = Number(formData.consultationFee) || 0;
        payload.biography = formData.biography;
      }

      const res = await register(payload);
      if (res.success) {
        if (role === 'DOCTOR') {
          setSuccessNotice(
            'Physician registration received. Your credentials will be reviewed by platform medical governance before clinical triage activations.'
          );
        } else if (role === 'FAMILY_MEMBER') {
          navigate('/family');
        } else {
          navigate('/patient');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-teal-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-2xl w-full mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/25 group-hover:scale-105 transition">
              <HeartPulse className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Create Your <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">CareBridge</span> Account
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Join the verified telehealth network connecting patients, certified physicians, and caregivers
          </p>
        </div>

        {/* Role Selection Segmented Control */}
        <div className="bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-3 gap-1.5 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              role === 'PATIENT'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('FAMILY_MEMBER')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              role === 'FAMILY_MEMBER'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Family Member</span>
            <span className="sm:hidden">Family</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
              role === 'DOCTOR'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor (MD)</span>
          </button>
        </div>

        {/* Card Form Container */}
        <motion.div
          layout
          className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-9 shadow-2xl relative"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successNotice ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-white text-xl">Physician Credential Review In Progress</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">{successNotice}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition"
                >
                  <span>Go to Sign In Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Basic Info */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400 block">
                  Core Account Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Dr. John Doe / Jane Smith"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        name="mobile"
                        required
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@healthcare.org"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Fields */}
              {role === 'PATIENT' && (
                <div className="pt-5 border-t border-slate-800/80 space-y-4">
                  <div className="flex items-center space-x-2">
                    <HeartPulse className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-teal-400">
                      Medical Profile Baseline
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-medium"
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
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-medium"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Emergency Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        placeholder="e.g. Mary Doe (Spouse)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        placeholder="+1 (555) 999-9999"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Fields */}
              {role === 'DOCTOR' && (
                <div className="pt-5 border-t border-slate-800/80 space-y-4">
                  <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-xs text-amber-200 flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-100 block mb-0.5">Clinical Credential Verification</strong>
                      Physician registrations are assigned <strong>PENDING</strong> verification status. Our medical director verifies licenses against national registries before patient appointment booking is enabled.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Clinical Specialization</label>
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-semibold"
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Psychiatry">Psychiatry</option>
                        <option value="Ophthalmology">Ophthalmology</option>
                        <option value="Dentistry">Dentistry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Medical Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        required
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g. MD, MBBS, FACC"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">License Registration #</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        required
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="e.g. MED-88291"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Experience (Years)</label>
                      <input
                        type="number"
                        name="experienceYears"
                        required
                        min="0"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Fee ($ / INR)</label>
                      <input
                        type="number"
                        name="consultationFee"
                        min="0"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Hospital / Health Center Affiliation</label>
                    <input
                      type="text"
                      name="hospitalAffiliation"
                      value={formData.hospitalAffiliation}
                      onChange={handleChange}
                      placeholder="e.g. Metropolitan University Hospital"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Clinical Biography</label>
                    <textarea
                      name="biography"
                      rows="2"
                      value={formData.biography}
                      onChange={handleChange}
                      placeholder="Brief summary of clinical specialties, fellowships, and consultation focus..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{loading ? 'Creating Account & Initializing Records...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have a CareBridge account?{' '}
            <Link to="/login" className="font-bold text-teal-400 hover:underline">
              Sign In to Your Portal
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
