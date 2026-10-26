import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export const MinimalLayout = ({ children, backUrl = '/', title = 'Secure Telehealth Transaction' }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-teal-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Minimal Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 py-3.5 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/25 group-hover:scale-105 transition">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              Care<span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Bridge</span>
            </span>
          </Link>

          {/* Center Trust Tag */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/60 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted Healthcare Portal</span>
          </div>

          {/* Back Action */}
          <button
            type="button"
            onClick={() => (backUrl ? navigate(backUrl) : navigate(-1))}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white py-2 px-3.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center py-8 relative z-10">
        {children}
      </main>

      {/* Minimal Trust Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800 py-4 text-center text-xs text-slate-400 backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>CareBridge Telehealth Privacy: Zero payment credential retention.</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Link to="/about" className="hover:text-white transition">Privacy Governance</Link>
            <span>•</span>
            <Link to="/emergency" className="hover:text-red-300 text-red-400 font-bold transition">Emergency Hotline</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
