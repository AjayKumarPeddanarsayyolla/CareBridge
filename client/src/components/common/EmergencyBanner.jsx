import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PhoneCall, ArrowRight } from 'lucide-react';

export const EmergencyBanner = () => {
  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white px-4 py-2 text-sm shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-center sm:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 animate-pulse" />
          <span className="font-medium text-xs sm:text-sm">
            <span className="font-bold tracking-wide uppercase text-amber-300 mr-1.5">Emergency Warning:</span>
            Experiencing severe chest pain, breathing collapse, or signs of stroke? Call emergency services immediately.
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <a
            href="tel:112"
            className="inline-flex items-center space-x-1.5 bg-white text-red-700 font-bold px-3 py-1 rounded-full text-xs hover:bg-red-50 transition shadow-sm"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call 112 (ERSS)</span>
          </a>
          <a
            href="tel:108"
            className="inline-flex items-center space-x-1 bg-red-950/60 border border-white/20 text-white font-bold px-2.5 py-1 rounded-full text-xs hover:bg-red-900 transition"
          >
            <span>108 (Amb)</span>
          </a>
          <Link
            to="/emergency"
            className="inline-flex items-center space-x-1 text-xs text-rose-100 hover:text-white underline underline-offset-2 transition"
          >
            <span>Emergency Guidelines</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
