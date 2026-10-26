import React from 'react';
import { HeartPulse, ShieldCheck, AlertTriangle, Users, Award, BookOpen, CheckCircle, Database, Lock, Stethoscope } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';

export const About = () => {
  const principles = [
    {
      icon: ShieldCheck,
      title: 'Safety Above All',
      desc: 'We never fabricate clinical conclusions. Every symptom intake is cross-referenced with emergency criteria and red-flag warnings.'
    },
    {
      icon: Users,
      title: 'Family-Centered Delegation',
      desc: 'Caregivers and family members can securely assist elderly relatives and dependents with explicit, auditable permission controls.'
    },
    {
      icon: Award,
      title: 'Stringent Credentialing',
      desc: 'Doctors undergo credential checks, medical license confirmation, and specialty verification before opening appointment availability.'
    },
    {
      icon: Database,
      title: 'ACID Data Sovereignty',
      desc: 'Our persistence engine uses PostgreSQL 18 with relational constraints, zero MongoDB fallback, and tamper-resistant audit logs.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="lg">Clinical Governance & Ethics</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Transparent, Safe & Compassionate Healthcare Navigation
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            CareBridge was designed to eliminate the anxiety and misinformation of online health searches by pairing verified physicians with rule-based safety triage.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card key={idx} variant="glass" className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </Card>
            );
          })}
        </div>

        {/* Clinical Disclaimer & Scope */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-amber-950 uppercase tracking-wide">
                Non-Diagnostic Clinical Protocol Notice
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-normal">
                CareBridge operates within strict legal and clinical guardrails. The platform does not issue definitive diagnoses or replace comprehensive in-person medical consultations. Clinical guidance provided by doctors represents supportive triage recommendations, first-aid measures, and appropriate facility referrals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
