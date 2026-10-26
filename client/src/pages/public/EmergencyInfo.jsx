import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  PhoneCall,
  Activity,
  Heart,
  Brain,
  Wind,
  ShieldAlert,
  Clock,
  ArrowRight,
  Ambulance,
  LifeBuoy,
  PhoneForwarded,
  Info,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import * as emergencyService from '../../services/emergencyService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const EmergencyInfo = () => {
  const [warnings, setWarnings] = useState([]);
  const [hotlines, setHotlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedNumber, setCopiedNumber] = useState(null);

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        const res = await emergencyService.getEmergencyWarnings();
        if (res.success) {
          setWarnings(res.data.warnings || []);
          setHotlines(res.data.emergencyHotlines || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmergencyData();
  }, []);

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 relative overflow-hidden">
      {/* Background ambient red glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Emergency Red Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-red-650 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-10 shadow-2xl mb-10 text-white border border-red-500/80 shadow-red-900/30"
        >
          {/* Subtle emergency strobe watermark */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-start space-x-5">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl flex-shrink-0 animate-pulse border border-white/30 shadow-inner">
                <AlertOctagon className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-red-100 mb-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Immediate Life-Threatening Condition Protocol</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm">
                  Emergency Medical Protocols
                </h1>
                <p className="text-sm sm:text-base text-red-50/90 mt-3 max-w-2xl leading-relaxed font-medium">
                  CareBridge is a telehealth and triage advisory system. If you or someone nearby is experiencing acute trauma, severe shortness of breath, sudden numbness, or unconsciousness, <strong className="text-white underline decoration-red-300">do NOT wait for a digital response</strong>. Call local emergency responders immediately.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-shrink-0">
              <a
                href="tel:112"
                className="w-full sm:w-auto px-7 py-4 bg-white text-red-700 rounded-2xl font-black text-base shadow-xl hover:bg-red-50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-3 group"
              >
                <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition">
                  <PhoneCall className="w-5 h-5 text-red-700" />
                </div>
                <span>Dial 112 (National ERSS)</span>
              </a>
              <a
                href="tel:108"
                className="w-full sm:w-auto px-7 py-4 bg-red-950/80 border border-red-400/60 text-white rounded-2xl font-black text-base shadow-xl hover:bg-red-900 transition flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="p-1.5 bg-red-800/80 rounded-lg">
                  <Ambulance className="w-5 h-5 text-white" />
                </div>
                <span>Dial 108 (Ambulance)</span>
              </a>
              <a
                href="tel:102"
                className="w-full sm:w-auto px-5 py-4 bg-red-950/50 border border-red-500/40 text-red-100 rounded-2xl font-bold text-sm shadow-md hover:bg-red-900/60 transition flex items-center justify-center space-x-2"
              >
                <span>102 (Transport)</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Verified Indian Emergency Response Systems */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span>India National & Regional Emergency Services</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified against official Indian Government emergency response frameworks.
              </p>
            </div>
            <span className="text-xs text-slate-400">Click hotline number to copy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotlines.map((h, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider line-clamp-1">
                      {h.country}
                    </span>
                    <button
                      onClick={() => handleCopy(h.emergency)}
                      title="Copy number"
                      className="text-slate-500 hover:text-teal-400 transition"
                    >
                      {copiedNumber === h.emergency ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <a
                      href={`tel:${h.emergency}`}
                      className="text-3xl font-black text-red-400 hover:text-red-300 transition block font-mono"
                    >
                      {h.emergency}
                    </a>
                    {h.ambulance && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                        Amb: {h.ambulance}
                      </span>
                    )}
                  </div>
                  {h.description && (
                    <p className="text-[11px] text-slate-400 leading-snug mb-3">
                      {h.description}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs">
                  {h.portal && (
                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <span className="text-[11px]">Official Portal:</span>
                      <a
                        href={h.portal}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:underline flex items-center gap-1 text-[11px] font-mono"
                      >
                        <span>{h.portal.replace('https://', '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {h.womenHelpline && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Women Helpline:</span>
                      <a href={`tel:${h.womenHelpline}`} className="text-purple-400 font-bold hover:underline font-mono">
                        {h.womenHelpline}
                      </a>
                    </div>
                  )}
                  {h.childline && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Childline:</span>
                      <a href={`tel:${h.childline}`} className="text-blue-400 font-bold hover:underline font-mono">
                        {h.childline}
                      </a>
                    </div>
                  )}
                  {h.mentalHealth && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Tele-MANAS:</span>
                      <a href="tel:14416" className="text-teal-400 font-bold hover:underline font-mono">
                        14416
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Red Flag Conditions by System */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Red Flag Symptoms Warranting Immediate Emergency Care</span>
            </h2>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading emergency warning categories..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {warnings.map((w, idx) => (
                <motion.div
                  key={w._id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800/90 hover:border-rose-900/50 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/40">
                        {w.category}
                      </span>
                      <AlertOctagon className="w-4 h-4 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-4">{w.title}</h3>

                    <div className="space-y-2 mb-6">
                      <span className="text-xs font-bold text-rose-300 block uppercase tracking-wider">
                        Critical Red Flags:
                      </span>
                      {w.redFlags?.map((rf, rfIdx) => (
                        <div key={rfIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <span className="text-rose-400 font-bold leading-none mt-1">●</span>
                          <span className="leading-relaxed">{rf}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-800">
                      <span className="text-xs font-bold text-teal-300 block uppercase tracking-wider">
                        Immediate Steps:
                      </span>
                      {w.immediateActions?.map((act, actIdx) => (
                        <div key={actIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* What to Tell the Emergency Dispatcher */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden"
        >
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 bg-teal-500/20 rounded-xl text-teal-400 border border-teal-500/30">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                How to Speak with Emergency Dispatchers (S-BAR Protocol)
              </h3>
              <p className="text-xs text-slate-400">Clear communication accelerates ambulance dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-black flex items-center justify-center mb-2.5 border border-teal-500/30">
                1
              </div>
              <span className="font-bold text-teal-300 block mb-1 text-sm">State Location First</span>
              <p className="leading-relaxed text-slate-400">
                Provide building number, street, unit, or landmark immediately before describing the issue in case the call drops.
              </p>
            </div>

            <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-black flex items-center justify-center mb-2.5 border border-teal-500/30">
                2
              </div>
              <span className="font-bold text-teal-300 block mb-1 text-sm">Describe Chief Problem</span>
              <p className="leading-relaxed text-slate-400">
                Specify if the individual is breathing, conscious, or experiencing uncontrollable bleeding or severe chest tightness.
              </p>
            </div>

            <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-black flex items-center justify-center mb-2.5 border border-teal-500/30">
                3
              </div>
              <span className="font-bold text-teal-300 block mb-1 text-sm">Remain on the Line</span>
              <p className="leading-relaxed text-slate-400">
                Do not hang up until instructed. Dispatchers can guide you through life-saving CPR rhythms and hemorrhage control.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
