import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stethoscope, Award, Building, Calendar, Clock, ArrowLeft, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as doctorService from '../../services/doctorService';

export const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await doctorService.getDoctorById(id);
        if (res.success) {
          setDoctor(res.data);
        }
      } catch (err) {
        console.error('Fetch doctor error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) return <LoadingSpinner message="Retrieving physician clinical credentials..." />;
  if (!doctor) {
    return (
      <div className="min-h-screen py-24 text-center px-4">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-slate-500 text-sm">Physician profile could not be located.</p>
          <Link to="/doctors">
            <Button variant="primary" size="sm">
              <span>Return to Doctor Directory</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const docUser = doctor.user || doctor.userId || {};
  const userId = docUser.id || docUser._id;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/doctors"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>

        {/* Profile Header Card */}
        <Card variant="glass" className="p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-start space-x-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-700 via-teal-600 to-cyan-600 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-teal-700/20 flex-shrink-0">
                {docUser.fullName?.charAt(0) || 'D'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    {docUser.fullName}
                  </h1>
                  <Badge variant="VERIFIED" size="sm">
                    Verified Physician
                  </Badge>
                </div>
                <p className="text-sm font-bold text-teal-700 uppercase tracking-wider">{doctor.specialization}</p>
                <p className="text-xs text-slate-500 font-medium">{doctor.qualification}</p>
              </div>
            </div>

            <Link
              to={`/patient/appointments?doctorId=${userId}`}
              className="flex-shrink-0"
            >
              <Button variant="brand" size="lg" className="w-full sm:w-auto shadow-md shadow-teal-600/25">
                <span>Book Slot (₹{doctor.consultationFee || 500})</span>
              </Button>
            </Link>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">
                Clinical Experience
              </span>
              <span className="font-black text-slate-900 text-base">{doctor.experienceYears} Years Active</span>
            </div>
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">
                Medical License
              </span>
              <span className="font-black text-slate-900 text-base font-mono">{doctor.licenseNumber}</span>
            </div>
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1">
                Hospital Affiliation
              </span>
              <span className="font-black text-slate-900 text-base truncate block">
                {doctor.hospitalAffiliation || 'CareBridge Certified Network'}
              </span>
            </div>
          </div>

          {/* Professional Biography */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-950 text-base">Professional Biography</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {doctor.biography || 'Specialist doctor committed to compassionate telehealth evaluations, accurate medical triage, and post-emergency clinical guidance.'}
            </p>
          </div>

          {/* Availability Schedule */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="font-extrabold text-slate-950 text-base">Consultation Hours & Availability</h3>
            <div className="flex flex-wrap gap-2">
              {doctor.availableDays?.map((day) => (
                <span
                  key={day}
                  className="px-3.5 py-1.5 bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-teal-100"
                >
                  {day}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Consultation Operating Window: {doctor.availableHours?.start || '09:00'} - {doctor.availableHours?.end || '17:00'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
