import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, X, CheckCircle2, MessageSquare, Video, MapPin, User, Activity } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as appointmentService from '../../services/appointmentService';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({
        status: filter === 'ALL' ? undefined : filter
      });
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await appointmentService.updateAppointmentStatus(id, { status: newStatus });
      if (res.success) {
        fetchAppointments();
      }
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Physician Schedule Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Doctor Appointment Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review consultation requests from patients, confirm booking slots, and mark consultations completed.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 w-fit backdrop-blur-md">
          {['ALL', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === st
                  ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {st === 'ALL' ? 'All Slots' : st}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving appointments..." />
        ) : appointments.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">No Appointments Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are currently no patient consultation requests matching this filter criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <motion.div
                key={app._id || app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 backdrop-blur-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {app.patientId?.fullName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-white text-base">
                        {app.patientId?.fullName}
                      </h3>
                      <Badge variant={app.status}>{app.status}</Badge>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Phone: <span className="font-mono text-slate-300 font-semibold">{app.patientId?.mobile || 'N/A'}</span> • Reason:{' '}
                      <span className="font-medium text-slate-200">{app.reason || 'General clinical review'}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2.5 font-mono">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{new Date(app.date).toLocaleDateString()}</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-teal-300">{app.timeSlot}</span>
                      <span>•</span>
                      <span className="text-slate-300">Mode: {app.consultationMode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-2 md:pt-0">
                  {app.status === 'REQUESTED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app._id || app.id, 'CONFIRMED')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition flex items-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Slot</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app._id || app.id, 'CANCELLED')}
                        className="px-4 py-2.5 border border-rose-800/60 text-rose-400 hover:bg-rose-950/60 rounded-xl text-xs font-bold transition"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {app.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app._id || app.id, 'COMPLETED')}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app._id || app.id, 'CANCELLED')}
                        className="px-4 py-2.5 border border-slate-700 text-slate-400 hover:bg-slate-800 rounded-xl text-xs font-bold transition"
                      >
                        Cancel Slot
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
