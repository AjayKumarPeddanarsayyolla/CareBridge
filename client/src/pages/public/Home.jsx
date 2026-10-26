import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Clock,
  Users,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  Award,
  Activity,
  FileCheck2,
  Check
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { MedicalHero3D } from '../../components/common/MedicalHero3D';
import * as doctorService from '../../services/doctorService';
import * as firstAidService from '../../services/firstAidService';

export const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [firstAidGuides, setFirstAidGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, faRes] = await Promise.all([
          doctorService.getVerifiedDoctors(),
          firstAidService.getFirstAidGuides()
        ]);
        if (docRes.success) setFeaturedDoctors(docRes.data.slice(0, 3));
        if (faRes.success) setFirstAidGuides(faRes.data.slice(0, 3));
      } catch (err) {
        console.error('Home data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const specializations = [
    { name: 'Cardiology', icon: '❤️', desc: 'Chest tightness, palpitations & hypertension triage' },
    { name: 'Dermatology', icon: '🔬', desc: 'Rashes, skin allergies, burns & acute dermatitis' },
    { name: 'General Medicine', icon: '🩺', desc: 'Fevers, viral symptoms, acute fatigue & body aches' },
    { name: 'Orthopedics', icon: '🦴', desc: 'Joint sprains, spinal strain & musculoskeletal trauma' },
    { name: 'Pediatrics', icon: '👶', desc: 'Infant wellness, pediatric fevers & immunization' },
    { name: 'Psychiatry', icon: '🧠', desc: 'Stress management, sleep disorders & acute anxiety' },
    { name: 'Ophthalmology', icon: '👁️', desc: 'Eye irritation, vision blur & conjunctivitis care' },
    { name: 'Dentistry', icon: '🦷', desc: 'Toothaches, gum inflammation & oral emergency relief' }
  ];

  const metrics = [
    { label: 'Verified Physicians', value: '100%', subtext: 'Board-Certified Specialists' },
    { label: 'Triage Accuracy', value: 'Rule-Directed', subtext: 'Zero Clinical Hallucinations' },
    { label: 'Emergency Response', value: '< 30s', subtext: 'Immediate Outbox & Hotlines' },
    { label: 'Database Integrity', value: 'PostgreSQL 18', subtext: 'ACID Relational Security' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Top Banner: Quick Demo Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-teal-100 py-2.5 px-4 text-xs border-b border-teal-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Live Interactive Demo
            </span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              Pre-configured profiles ready for Patient, Doctor, Family & Admin accounts.
            </span>
          </div>
          <Link
            to="/login"
            className="text-teal-300 hover:text-white font-bold flex items-center space-x-1 hover:underline transition"
          >
            <span>One-Click Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Doctor-Verified • Clinical Triage • Family Care</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              Compassionate Healthcare,{' '}
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Connected & Verified
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              CareBridge connects patients, guardians, and board-certified physicians for structured symptom triage, safe first-aid guidance, and trusted video consultations.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/patient/submit-concern" className="w-full sm:w-auto">
                <Button variant="brand" size="lg" className="w-full shadow-lg shadow-teal-600/25">
                  <span>Start Preliminary Triage</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/doctors" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  <span>Find a Doctor</span>
                </Button>
              </Link>
              <Link to="/emergency" className="w-full sm:w-auto">
                <Button variant="dangerOutline" size="lg" className="w-full">
                  <PhoneCall className="w-4 h-4 mr-2" />
                  <span>Emergency SOS</span>
                </Button>
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-teal-600 font-bold" />
                <span>Zero Diagnostic Hallucination</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-teal-600 font-bold" />
                <span>Encrypted Telehealth</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-teal-600 font-bold" />
                <span>Transparent Pricing</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Medical Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <MedicalHero3D />
          </div>
        </div>
      </section>

      {/* Metrics Counter Section */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((m, idx) => (
            <div key={idx} className="text-center sm:text-left space-y-1">
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-teal-400 tracking-tight">
                {m.value}
              </span>
              <span className="block text-xs sm:text-sm font-bold text-slate-200">
                {m.label}
              </span>
              <span className="block text-[11px] text-slate-400">
                {m.subtext}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <Badge variant="primary" size="lg">Platform Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built on Safety, Medical Rigor & Ethics
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Every clinical feature is deliberately bounded by safety directives to assist patients responsibly without compromising standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="glass" className="p-6 space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Rule-Directed Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant rule-based matching classifies patient concerns into routine, urgent, or emergency tiers, automatically directing them to the proper specialty.
            </p>
          </Card>

          <Card variant="glass" className="p-6 space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Physicians</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every doctor undergoes administrative license verification before consulting patients, offering genuine clinical notes and care advice.
            </p>
          </Card>

          <Card variant="glass" className="p-6 space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Emergency SOS Protocols</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single-tap emergency broadcast system notifies linked family members, generates situational alerts, and displays global emergency hotline numbers.
            </p>
          </Card>

          <Card variant="glass" className="p-6 space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Guardian & Family Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Delegated permissions allow caring relatives to book appointments, review triage notes, and track elderly or dependent family members safely.
            </p>
          </Card>
        </div>
      </section>

      {/* Specialty Grid */}
      <section className="bg-slate-100/70 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Specialist Disciplines</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Consult With Verified Specialists
              </h2>
            </div>
            <Link to="/doctors">
              <Button variant="outline" size="sm">
                <span>View Full Doctor Directory</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {specializations.map((spec, idx) => (
              <Link
                key={idx}
                to={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                className="group"
              >
                <div className="h-full bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-300 hover:shadow-glass-hover transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="text-3xl mb-3">{spec.icon}</div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {spec.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {spec.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
                    <span>Explore Specialists</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section (from real backend) */}
      {featuredDoctors.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <Badge variant="primary" size="md">Medical Staff</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Verified Physicians Available for Teleconsultation
              </h2>
            </div>
            <Link to="/doctors">
              <Button variant="outline" size="sm">
                <span>All Doctors</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <Card key={doc.id || doc._id} variant="glass" className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-cyan-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                      {doc.user?.fullName?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.user?.fullName}</h3>
                      <Badge variant="VERIFIED" size="sm" className="mt-1">
                        Verified MD
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                      {doc.specialization}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {doc.hospitalAffiliation || 'CareBridge Certified Specialist'}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.biography || 'Specialist available for comprehensive telehealth review and clinical guidance.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Consultation Fee</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{doc.consultationFee || 500}
                    </span>
                  </div>
                  <Link to={`/doctors/${doc.id || doc._id}`}>
                    <Button variant="primary" size="sm">
                      <span>Book Slot</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Featured First Aid Knowledge Base */}
      {firstAidGuides.length > 0 && (
        <section className="bg-slate-100/70 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Immediate Care</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Doctor-Approved First Aid Protocols
                </h2>
              </div>
              <Link to="/first-aid">
                <Button variant="outline" size="sm">
                  <span>Browse All First Aid Guides</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {firstAidGuides.map((guide) => (
                <Link
                  key={guide.id || guide._id}
                  to={`/first-aid/${guide.slug || guide.id || guide._id}`}
                  className="group"
                >
                  <Card variant="glass" className="p-6 h-full flex flex-col justify-between group-hover:border-teal-300 transition">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="warning" size="sm">{guide.category}</Badge>
                        <span className="text-[10px] text-slate-400 font-medium">Physician Reviewed</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {guide.situation}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
                      <span>Read Emergency Steps</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Emergency Callout Card Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-4xl p-8 sm:p-12 text-white shadow-2xl shadow-red-900/20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full inline-block tracking-wider">
              Life-Threatening Symptoms
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Experiencing Severe Chest Pain or Loss of Consciousness?
            </h2>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-normal">
              Do not wait for an online appointment. Severe emergencies require immediate hospitalization. Dial your local emergency medical hotline immediately.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link to="/emergency" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-red-700 font-extrabold text-sm hover:bg-red-50 transition shadow-lg shadow-black/10 flex items-center justify-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-600" />
                <span>View Emergency Protocols</span>
              </button>
            </Link>
            <a href="tel:112" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-950/40 hover:bg-red-950/60 border border-white/20 text-white font-extrabold text-sm transition flex items-center justify-center gap-2">
                <span>Dial 112 (Emergency)</span>
              </button>
            </a>
            <a href="tel:108" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-sm transition flex items-center justify-center gap-2">
                <span>Ambulance (108)</span>
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
