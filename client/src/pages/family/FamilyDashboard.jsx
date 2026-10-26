import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, HeartPulse, PlusCircle, Shield, FileText, Calendar, ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as familyService from '../../services/familyService';

export const FamilyDashboard = () => {
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinked = async () => {
      setLoading(true);
      try {
        const res = await familyService.getLinkedPatients();
        if (res.success) {
          setLinkedPatients(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinked();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-950/90 via-slate-900/90 to-indigo-950/80 rounded-3xl p-6 sm:p-9 border border-purple-500/30 shadow-2xl backdrop-blur-xl"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Family Caregiver Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Family Caregiver Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl mt-2 leading-relaxed">
            CareBridge enables authorized family members and designated guardians to assist loved ones with health submissions, reviewing clinical advice, and consulting doctors.
          </p>
        </motion.div>

        {/* Linked Patients Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Authorized Family Dependents</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Total: {linkedPatients.length} Linked
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Checking authorized family patients..." />
          ) : linkedPatients.length === 0 ? (
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">No Dependents Linked Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Ask your loved one to log into CareBridge, navigate to "Guardian Access", and enter your email address to authorize you as their designated caregiver.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {linkedPatients.map(({ relationship, patient, medicalProfile }) => (
                <motion.div
                  key={relationship._id || relationship.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-purple-500/50 transition flex flex-col justify-between backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-lg">
                          {patient?.fullName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{patient?.fullName}</h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <Badge variant="primary">{relationship.relationshipType}</Badge>
                            <span className="text-xs text-slate-400 font-mono">{patient?.email}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="success">Authorized</Badge>
                    </div>

                    {/* Authorized Medical Info if permitted */}
                    {relationship.permissions?.viewMedicalHistory && medicalProfile && (
                      <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Blood Group:</span>
                          <span className="font-bold text-white font-mono">{medicalProfile.bloodGroup || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Known Allergies:</span>
                          <span className="font-semibold text-rose-400">
                            {medicalProfile.allergies?.length ? medicalProfile.allergies.join(', ') : 'None recorded'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Diagnosed Conditions:</span>
                          <span className="font-semibold text-amber-300">
                            {medicalProfile.existingConditions?.length ? medicalProfile.existingConditions.join(', ') : 'None recorded'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Permissions summary */}
                    <div className="mt-4 text-xs space-y-2">
                      <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">Delegated Privileges:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {relationship.permissions?.submitConcerns && (
                          <span className="px-2.5 py-1 bg-purple-950/70 border border-purple-800 text-purple-300 rounded-full text-[11px] font-semibold">
                            Submit Concerns
                          </span>
                        )}
                        {relationship.permissions?.viewCases && (
                          <span className="px-2.5 py-1 bg-blue-950/70 border border-blue-800 text-blue-300 rounded-full text-[11px] font-semibold">
                            View Cases
                          </span>
                        )}
                        {relationship.permissions?.viewAppointments && (
                          <span className="px-2.5 py-1 bg-teal-950/70 border border-teal-800 text-teal-300 rounded-full text-[11px] font-semibold">
                            Appointments
                          </span>
                        )}
                        {relationship.permissions?.participateChat && (
                          <span className="px-2.5 py-1 bg-indigo-950/70 border border-indigo-800 text-indigo-300 rounded-full text-[11px] font-semibold">
                            Doctor Chat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    {relationship.permissions?.submitConcerns ? (
                      <Link
                        to={`/patient/submit-concern?patientId=${patient?._id || patient?.id}`}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center space-x-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Submit Concern For {patient?.fullName?.split(' ')[0]}</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500 italic py-2">
                        Concern submission not delegated by patient
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
