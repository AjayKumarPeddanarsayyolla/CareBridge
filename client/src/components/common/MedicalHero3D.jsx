import React from 'react';
import { ShieldCheck, HeartPulse, Activity, Stethoscope, Sparkles } from 'lucide-react';

export const MedicalHero3D = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center select-none ${className}`}>
      {/* Ambient gradient glow circles */}
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-cyan-400/20 to-blue-600/10 rounded-full blur-3xl animate-pulse-subtle" />
      <div className="absolute w-3/4 h-3/4 bg-teal-400/15 rounded-full blur-2xl" />

      {/* Outer 3D Gyroscopic Rings */}
      <div className="absolute w-[92%] h-[92%] rounded-full border border-teal-300/30 animate-[spin_30s_linear_infinite] [border-dasharray:10_10]" />
      <div className="absolute w-[80%] h-[80%] rounded-full border border-cyan-400/20 animate-[spin_20s_linear_infinite_reverse]" />

      {/* Central 3D Floating Glass Pod */}
      <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-br from-white/95 via-teal-50/90 to-cyan-50/80 backdrop-blur-xl border border-white/80 shadow-2xl shadow-teal-900/15 flex flex-col items-center justify-center p-6 text-center transform hover:rotate-1 hover:scale-105 transition-all duration-500 ease-out">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Real-Time Clinical Telehealth</span>
        </div>

        {/* Central Pulse Icon with layered 3D depth */}
        <div className="relative my-2">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-teal-600/35 transform -rotate-3 hover:rotate-0 transition-transform">
            <HeartPulse className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-teal-100 shadow-md flex items-center justify-center text-teal-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <h4 className="text-base font-extrabold text-slate-900 mt-3 tracking-tight">CareBridge Core</h4>
        <p className="text-xs text-slate-500 mt-1">Verified Doctors • 24/7 Triage • Safe RAG</p>

        {/* Live metric mini bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 w-full flex justify-around text-center">
          <div>
            <span className="block text-xs font-extrabold text-teal-700">100%</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">PostgreSQL</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div>
            <span className="block text-xs font-extrabold text-emerald-600">&lt; 30s</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Emergency SOS</span>
          </div>
        </div>
      </div>

      {/* Orbiting Satellite Card 1: Physician Badge */}
      <div className="absolute -top-3 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-teal-100/80 flex items-center space-x-2.5 animate-float-slow">
        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-900">Dr. Sarah Jenkins</span>
          <span className="text-[10px] text-teal-600 font-semibold">Chief Cardiologist</span>
        </div>
      </div>

      {/* Orbiting Satellite Card 2: SOS Shield */}
      <div className="absolute -bottom-2 -left-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-emerald-100/80 flex items-center space-x-2.5 animate-float-slow [animation-delay:2s]">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-xs font-bold text-slate-900">Clinical Safety Directives</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Zero-Hallucination Safe Triage</span>
        </div>
      </div>
    </div>
  );
};
