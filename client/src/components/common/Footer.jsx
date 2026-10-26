import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Shield, AlertTriangle, Phone, ExternalLink, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-10 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Callout Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 mb-12 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl flex-shrink-0 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm tracking-wide uppercase flex items-center gap-2">
                <span>Important Clinical Safety & Legal Protocol</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                CareBridge provides rule-directed preliminary health guidance, safe first-aid references, and direct scheduling with verified medical specialists.
                <strong className="text-slate-200"> CareBridge does NOT provide definitive clinical diagnoses, dispense prescription pharmaceuticals, or replace emergency in-person medical care.</strong> If you or someone under your care experiences severe chest pain, loss of consciousness, stroke symptoms, or severe shortness of breath, please immediately dial your emergency hotline (dial 112 for Pan-India ERSS or 108 for Ambulance).
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Care<span className="text-teal-400">Bridge</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connecting patients, guardians, and verified medical specialists through safe triage, PostgreSQL data sovereignty, and secure telehealth workflows.
            </p>
            <div className="flex items-center space-x-2 text-xs text-teal-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Role-Based Access & Encrypted Sessions</span>
            </div>
          </div>

          {/* Clinical Resources */}
          <div>
            <h5 className="text-white text-xs font-extrabold uppercase tracking-wider mb-4">Clinical Guidance</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/first-aid" className="text-slate-400 hover:text-teal-400 transition">First Aid Knowledge Base</Link>
              </li>
              <li>
                <Link to="/emergency" className="text-rose-400 hover:text-rose-300 transition font-semibold">Emergency SOS Protocols</Link>
              </li>
              <li>
                <Link to="/doctors" className="text-slate-400 hover:text-teal-400 transition">Verified Specialist Directory</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-400 hover:text-teal-400 transition">Safe Triage Architecture</Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h5 className="text-white text-xs font-extrabold uppercase tracking-wider mb-4">Portals & Access</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-teal-400 transition">Secure Portal Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-teal-400 transition">Family & Patient Onboarding</Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-teal-400 transition">Doctor Credential Application</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-teal-400 transition">Clinical Governance & Ethics</Link>
              </li>
            </ul>
          </div>

          {/* Indian Emergency Hotlines */}
          <div>
            <h5 className="text-white text-xs font-extrabold uppercase tracking-wider mb-4">India Emergency Response</h5>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span>Pan-India Emergency (ERSS)</span>
                <a href="tel:112" className="text-rose-400 hover:underline font-extrabold text-sm font-mono">112</a>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span>Ambulance (Telangana / Regional)</span>
                <a href="tel:108" className="text-rose-400 hover:underline font-extrabold text-sm font-mono">108</a>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span>National Ambulance (Transport)</span>
                <a href="tel:102" className="text-rose-400 hover:underline font-extrabold text-sm font-mono">102</a>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span>Tele-MANAS (Mental Health)</span>
                <a href="tel:14416" className="text-amber-400 hover:underline font-bold font-mono">14416</a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareBridge Healthcare Platform. Built exclusively with PostgreSQL.</p>
          <div className="flex space-x-6 mt-3 sm:mt-0 font-medium">
            <span className="hover:text-slate-400 transition cursor-pointer">HIPAA Compliant Practices</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
