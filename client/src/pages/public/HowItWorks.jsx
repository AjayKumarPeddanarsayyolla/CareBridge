import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, FileCheck, Stethoscope, MessageSquare, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Register & Complete Health Profile',
      desc: 'Patients or authorized family members register and create an encrypted medical profile including known allergies, chronic conditions, and emergency contacts.',
      icon: UserPlus,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      num: '02',
      title: 'Describe Your Health Concern',
      desc: 'Detail your primary symptoms, onset time, and severity. Optionally upload laboratory reports or diagnostic photos with zero clinical jargon required.',
      icon: FileCheck,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    },
    {
      num: '03',
      title: 'Rule-Directed Triage & Routing',
      desc: 'The safety engine evaluates concerns for life-threatening red-flag indicators, provides immediate first-aid guidance, and matches the proper physician specialization.',
      icon: Stethoscope,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      num: '04',
      title: 'Consult With a Verified Physician',
      desc: 'A verified doctor reviews your case history, formulates clinical guidance, and discusses next steps via appointment consultation or real-time messaging.',
      icon: MessageSquare,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="lg">Clinical Roadmap</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            How CareBridge Works
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            A safe, structured pathway from initial symptom description to verified medical guidance.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.num}
                variant="glass"
                className="p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs ${step.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-4xl font-black text-slate-200/90 tracking-tighter">{step.num}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-black">Ready to get trusted healthcare guidance?</h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Create your account in under 2 minutes. CareBridge is available 24/7 for all patients and families.
            </p>
          </div>
          <Link to="/register" className="flex-shrink-0">
            <Button variant="brand" size="lg" className="shadow-lg shadow-black/20">
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
