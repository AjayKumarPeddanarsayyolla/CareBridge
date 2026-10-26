import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Stethoscope, Calendar, Clock, Award, ArrowRight, Star, ShieldCheck, MapPin } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import * as doctorService from '../../services/doctorService';

export const DoctorsDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');

  const specializations = [
    'ALL',
    'Cardiology',
    'Dermatology',
    'General Medicine',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Ophthalmology',
    'Dentistry'
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getVerifiedDoctors({
        specialization: selectedSpecialization === 'ALL' ? undefined : selectedSpecialization,
        search: search.trim() || undefined
      });
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error('Fetch doctors error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <Badge variant="primary" size="md">Verified Clinical Faculty</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Consult Verified Medical Specialists
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Every physician on CareBridge has passed administrative medical licensing verification.
          </p>
        </div>

        {/* Search & Specialization Filters */}
        <Card variant="glass" className="p-5 sm:p-6 space-y-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search by physician name, clinical specialty, or hospital affiliation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="sm:w-36">
              <span>Filter Results</span>
            </Button>
          </form>

          {/* Specialization Filter Pills */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Filter by Discipline:
            </span>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSpecialization === spec
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No physicians found"
            description="No verified doctors match the selected specialization or search criteria."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedSpecialization('ALL');
                  setSearch('');
                }}
              >
                Reset All Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => {
              const docUser = doc.user || doc.userId || {};
              const docId = doc.id || doc._id;
              const userId = docUser.id || docUser._id;
              return (
                <Card
                  key={docId}
                  variant="glass"
                  className="p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-cyan-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                        {docUser.fullName?.charAt(0) || 'D'}
                      </div>
                      <Badge variant="VERIFIED" size="sm">
                        Verified MD
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-950 text-base">{docUser.fullName}</h3>
                      <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mt-0.5">
                        {doc.specialization}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {doc.qualification}
                      </p>
                    </div>

                    {doc.hospitalAffiliation && (
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{doc.hospitalAffiliation}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {doc.biography || 'Specialist available for telehealth consultations and clinical triage reviews.'}
                    </p>

                    <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-400">
                          <Award className="w-3.5 h-3.5" />
                          <span>Experience:</span>
                        </span>
                        <span className="font-bold text-slate-900">{doc.experienceYears} Years</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Available:</span>
                        </span>
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                          {doc.availableDays?.join(', ') || 'Monday - Friday'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                      <span className="text-base font-black text-slate-900">
                        ₹{doc.consultationFee || 500}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/doctors/${docId}`}>
                        <Button variant="outline" size="sm">
                          <span>Profile</span>
                        </Button>
                      </Link>
                      <Link to={`/patient/appointments?doctorId=${userId}`}>
                        <Button variant="primary" size="sm">
                          <span>Book</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
