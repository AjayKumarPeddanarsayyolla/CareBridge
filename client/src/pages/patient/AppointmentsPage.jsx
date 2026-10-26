import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  MapPin,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as appointmentService from '../../services/appointmentService';
import * as doctorService from '../../services/doctorService';

export const AppointmentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedDoctorId = searchParams.get('doctorId');
  const preselectedCaseId = searchParams.get('caseId');

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(Boolean(preselectedDoctorId || preselectedCaseId));

  const [bookingData, setBookingData] = useState({
    doctorId: preselectedDoctorId || '',
    caseId: preselectedCaseId || '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    timeSlot: '10:00 - 10:30',
    consultationMode: 'CHAT',
    reason: ''
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const timeSlots = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '16:00 - 16:30'
  ];

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([
        appointmentService.getAppointments(),
        doctorService.getVerifiedDoctors()
      ]);
      if (appRes.success) setAppointments(appRes.data);
      if (docRes.success) {
        setDoctors(docRes.data);
        if (!bookingData.doctorId && docRes.data.length > 0) {
          const firstDocId = docRes.data[0].userId?._id || docRes.data[0].userId?.id || docRes.data[0].user?.id;
          setBookingData((prev) => ({ ...prev, doctorId: firstDocId }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);

    try {
      const res = await appointmentService.bookAppointment(bookingData);
      if (res.success) {
        setBookingSuccess('Appointment requested! Redirecting to secure checkout...');
        const apptId = res.data?.id || res.data?._id;
        setTimeout(() => {
          setBookingOpen(false);
          navigate(`/checkout/${apptId}`);
        }, 800);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.updateAppointmentStatus(id, {
        status: 'CANCELLED',
        cancellationReason: 'Cancelled by patient'
      });
      fetchAppointments();
    } catch (err) {
      alert('Cancellation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Consultation Schedule</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Appointments
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Book and manage your telehealth consultations with verified physicians.
            </p>
          </div>

          <button
            onClick={() => setBookingOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>

        {/* Booking Modal / Dialog */}
        <AnimatePresence>
          {bookingOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-teal-400" />
                    <span>Schedule Doctor Consultation</span>
                  </h2>
                  <button
                    onClick={() => setBookingOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {bookingError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {bookingSuccess && (
                  <div className="p-3.5 rounded-xl bg-teal-950/70 border border-teal-800 text-teal-200 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>{bookingSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Physician *</label>
                    <select
                      required
                      value={bookingData.doctorId}
                      onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-semibold"
                    >
                      {doctors.map((doc) => {
                        const docUserId = doc.userId?._id || doc.userId?.id || doc.user?.id;
                        const docName = doc.userId?.fullName || doc.user?.fullName;
                        return (
                          <option key={doc._id || doc.id} value={docUserId}>
                            {docName} - {doc.specialization} (${doc.consultationFee})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Time Slot *</label>
                      <select
                        value={bookingData.timeSlot}
                        onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Consultation Mode</label>
                    <select
                      value={bookingData.consultationMode}
                      onChange={(e) => setBookingData({ ...bookingData, consultationMode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="CHAT">In-App Live Chat (CareBridge)</option>
                      <option value="VIDEO_LINK">Video Telehealth Call</option>
                      <option value="IN_PERSON_OFFLINE">In-Person Clinic Visit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Reason for Consultation</label>
                    <textarea
                      rows="2"
                      placeholder="Brief description of symptoms or follow-up query..."
                      value={bookingData.reason}
                      onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setBookingOpen(false)}
                      className="px-4 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition disabled:opacity-50"
                    >
                      {bookingLoading ? 'Checking Availability...' : 'Confirm & Proceed'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Appointments List */}
        {loading ? (
          <LoadingSpinner message="Retrieving appointments..." />
        ) : appointments.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">No Scheduled Appointments</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You do not have any upcoming consultation slots. Schedule with any verified CareBridge physician.
              </p>
            </div>
            <button
              onClick={() => setBookingOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-teal-500 text-slate-950 font-black rounded-xl text-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Consultation</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <motion.div
                key={app._id || app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 backdrop-blur-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {app.doctorId?.fullName?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-white text-base">
                        {app.doctorId?.fullName}
                      </h3>
                      <Badge variant={app.status}>{app.status}</Badge>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Reason: <span className="font-medium text-slate-300">{app.reason || 'General clinical consultation'}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2.5">
                      <span className="flex items-center space-x-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{new Date(app.date).toLocaleDateString()}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1.5 font-bold text-teal-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{app.timeSlot}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1.5">
                        {app.consultationMode === 'CHAT' ? (
                          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                        ) : app.consultationMode === 'VIDEO_LINK' ? (
                          <Video className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <span>{app.consultationMode.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                  {['REQUESTED', 'PENDING_PAYMENT'].includes(app.status) && (
                    <button
                      onClick={() => navigate(`/checkout/${app._id || app.id}`)}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center space-x-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay & Confirm</span>
                    </button>
                  )}

                  {app.status === 'CONFIRMED' && (
                    <button
                      onClick={() => navigate(`/checkout/${app._id || app.id}`)}
                      className="px-4 py-2 border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-bold rounded-xl transition"
                    >
                      Receipt
                    </button>
                  )}

                  {['REQUESTED', 'PENDING_PAYMENT', 'CONFIRMED'].includes(app.status) && (
                    <button
                      onClick={() => handleCancel(app._id || app.id)}
                      className="px-4 py-2 border border-rose-800/60 text-rose-400 hover:bg-rose-950/60 text-xs font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
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
