import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  ArrowLeft,
  PhoneCall,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as firstAidService from '../../services/firstAidService';

export const FirstAidDetail = () => {
  const { slugOrId } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await firstAidService.getFirstAidGuideByIdOrSlug(slugOrId);
        if (res.success) {
          setGuide(res.data);
        }
      } catch (err) {
        console.error('Fetch guide error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [slugOrId]);

  if (loading) return <LoadingSpinner message="Retrieving first-aid clinical protocol..." />;
  if (!guide) {
    return (
      <div className="min-h-screen py-24 text-center px-4">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-slate-500 text-sm">First-aid guide not found.</p>
          <Link to="/first-aid">
            <Button variant="primary" size="sm">
              <span>Back to First Aid Directory</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/first-aid"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to First Aid Directory</span>
        </Link>

        {/* Emergency Callout Card Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start space-x-3.5">
            <AlertTriangle className="w-6 h-6 text-amber-300 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-200">
                Immediate Emergency Warning
              </h3>
              <p className="text-xs text-red-100 mt-1 leading-relaxed">
                {guide.emergencyWarning ||
                  'If the individual is unconscious, having severe breathing difficulties, experiencing crushing chest pain, or uncontrolled bleeding, immediately seek emergency medical care.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
            <a
              href="tel:112"
              className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-700 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 112 (ERSS)</span>
            </a>
            <a
              href="tel:108"
              className="px-3.5 py-2.5 bg-red-950/60 hover:bg-red-950 border border-white/20 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition"
            >
              <span>108 (Amb)</span>
            </a>
          </div>
        </div>

        {/* Article Document Card */}
        <Card variant="glass" className="p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="border-b border-slate-100 pb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning" size="sm">{guide.category}</Badge>
              <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Reviewed: {new Date(guide.lastReviewedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {guide.title}
            </h1>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="font-extrabold text-slate-900 mr-2">Clinical Scenario:</span>
              {guide.situation}
            </div>
          </div>

          {/* Section 1: Safe Immediate Steps */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-950 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Safe Immediate Steps</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {guide.safeImmediateSteps?.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3.5 p-4 rounded-2xl bg-teal-50/40 border border-teal-100"
                >
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Things to Avoid */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-950 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xs">
                <XCircle className="w-4 h-4" />
              </div>
              <span>Things to Avoid (Harm Prevention)</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {guide.thingsToAvoid?.map((avoid, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3.5 p-4 rounded-2xl bg-rose-50/40 border border-rose-100"
                >
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-rose-950 leading-relaxed font-semibold">{avoid}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Warning Signs */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-950 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span>Red Flags & Critical Signs</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guide.warningSigns?.map((sign, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs text-amber-950 font-bold flex items-start gap-2"
                >
                  <span className="text-amber-600 mt-0.5">⚠️</span>
                  <span>{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: When to Seek Professional Care */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-950 flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span>When to Seek Immediate In-Person Hospitalization</span>
            </h2>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {guide.whenToSeekProfessionalCare?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviewer Stamp */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>
                Clinically Reviewed & Approved by: <strong className="text-slate-900">{guide.reviewedByDoctor}</strong>
              </span>
            </div>
            <span className="text-teal-700 font-bold">Standard Medical Advisory</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
