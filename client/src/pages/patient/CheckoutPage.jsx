import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MinimalLayout } from '../../layouts/MinimalLayout';
import * as appointmentService from '../../services/appointmentService';
import * as paymentService from '../../services/paymentService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  ArrowRight,
  RefreshCw,
  Lock,
  FileCheck,
  Receipt,
  Sparkles
} from 'lucide-react';

export const CheckoutPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, RAZORPAY
  const [simulationScenario, setSimulationScenario] = useState('SUCCESS'); // SUCCESS, FAILURE, PENDING
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null); // 'COMPLETED', 'FAILED', 'PENDING'

  useEffect(() => {
    const fetchCheckoutData = async () => {
      setLoading(true);
      setError('');
      try {
        const appRes = await appointmentService.getAppointmentById(appointmentId);
        if (!appRes.success || !appRes.data) {
          throw new Error('Appointment details could not be loaded');
        }
        setAppointment(appRes.data);

        // Fetch server-calculated fee estimate
        const doctorId = appRes.data.doctorId?._id || appRes.data.doctorId?.id || appRes.data.doctorId;
        const feeRes = await paymentService.getFeeEstimate(doctorId);
        if (feeRes.success) {
          setFeeDetails(feeRes.data);
        }

        // If appointment is already confirmed and paid, show completed
        if (appRes.data.status === 'CONFIRMED' && appRes.data.payment?.status === 'COMPLETED') {
          setCompletedOrder(appRes.data.payment);
          setPaymentStatus('COMPLETED');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to initialize checkout');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchCheckoutData();
    }
  }, [appointmentId]);

  const handlePay = async () => {
    setProcessing(true);
    setPaymentError('');

    try {
      // 1. Create or retrieve payment order on backend
      const orderRes = await paymentService.createPaymentOrder(appointmentId, paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'SIMULATED');
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize payment order');
      }

      const activeOrder = orderRes.data.order;

      // 2. Process verification based on provider mode
      const verifyRes = await paymentService.verifyPayment({
        orderId: activeOrder.id,
        scenario: simulationScenario,
        providerPaymentId: `pay_sim_${Date.now()}`
      });

      if (verifyRes.success && verifyRes.data.status === 'COMPLETED') {
        setCompletedOrder(verifyRes.data.order);
        setPaymentStatus('COMPLETED');
      } else if (verifyRes.data?.status === 'PENDING') {
        setPaymentStatus('PENDING');
        setCompletedOrder(verifyRes.data.order);
      } else {
        setPaymentStatus('FAILED');
        setPaymentError(verifyRes.message || 'Payment transaction was declined by the payment provider.');
      }
    } catch (err) {
      setPaymentStatus('FAILED');
      setPaymentError(err.response?.data?.message || err.message || 'Transaction processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MinimalLayout backUrl="/patient/appointments">
        <div className="max-w-md mx-auto p-12 text-center text-slate-100">
          <LoadingSpinner message="Calculating verified healthcare fees..." />
        </div>
      </MinimalLayout>
    );
  }

  if (error || !appointment) {
    return (
      <MinimalLayout backUrl="/patient/appointments">
        <div className="max-w-md mx-auto p-8 bg-slate-900 rounded-3xl shadow-2xl border border-red-500/40 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Checkout Error</h2>
          <p className="text-sm text-slate-400 mb-6">{error || 'Appointment record not found'}</p>
          <Link
            to="/patient/appointments"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition"
          >
            Return to Appointments
          </Link>
        </div>
      </MinimalLayout>
    );
  }

  // Success Confirmation Receipt View
  if (paymentStatus === 'COMPLETED' && completedOrder) {
    return (
      <MinimalLayout backUrl="/patient/appointments">
        <div className="max-w-xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-emerald-500/40 text-center backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs uppercase font-black text-emerald-300 tracking-widest bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
              Payment & Consultation Confirmed
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">
              Appointment Booked!
            </h1>
            <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto">
              Your telehealth consultation slot has been confirmed and paid. Both you and your physician have received encrypted confirmation notices.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 text-left mb-6 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80 text-xs">
                <span className="text-slate-400">Appointment Reference</span>
                <span className="font-mono font-bold text-teal-400">{appointment.id ? appointment.id.slice(0, 10) : 'REF-APT'}...</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80 text-xs">
                <span className="text-slate-400">Payment Order ID</span>
                <span className="font-mono font-bold text-slate-200">{completedOrder.providerOrderId}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80 text-xs">
                <span className="text-slate-400">Consulting Physician</span>
                <span className="font-bold text-white">{appointment.doctorId?.fullName || 'Clinical Specialist'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80 text-xs">
                <span className="text-slate-400">Date & Slot</span>
                <span className="font-bold text-teal-300 font-mono">
                  {new Date(appointment.date).toLocaleDateString()} • {appointment.timeSlot}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm font-bold">
                <span className="text-white">Total Amount Paid</span>
                <span className="text-emerald-400 text-lg font-black font-mono">₹{(completedOrder.amount / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/patient/appointments"
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/25 transition text-center"
              >
                View Consultation Schedule
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </motion.div>
        </div>
      </MinimalLayout>
    );
  }

  return (
    <MinimalLayout backUrl="/patient/appointments">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-slate-100">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Confirm & Pay for Consultation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your appointment breakdown and select your preferred payment mode.
          </p>
        </div>

        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-200">Transaction Status: Declined</p>
              <p className="text-xs text-rose-300 mt-0.5">{paymentError}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Breakdown & Doctor Summary */}
          <div className="lg:col-span-7 space-y-6">
            {/* Consultation Summary Card */}
            <div className="bg-slate-900/90 rounded-3xl p-6 shadow-xl border border-slate-800 backdrop-blur-md">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                <span>Consultation Summary</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Consulting Physician</span>
                  <span className="text-sm font-bold text-white">
                    {appointment.doctorId?.fullName || 'Verified Doctor'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Clinical Specialty</span>
                  <span className="text-xs font-bold text-teal-300 bg-teal-950/60 border border-teal-800 px-2.5 py-0.5 rounded-full">
                    {feeDetails?.specialization || 'Clinical Specialist'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Date & Slot</span>
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    {new Date(appointment.date).toLocaleDateString()} • {appointment.timeSlot}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Consultation Mode</span>
                  <span className="text-xs font-bold uppercase text-slate-200 bg-slate-800 px-2.5 py-0.5 rounded-md">
                    {appointment.consultationMode}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-900/90 rounded-3xl p-6 shadow-xl border border-slate-800 backdrop-blur-md">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-400" />
                <span>Select Payment Mode</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    paymentMethod === 'UPI'
                      ? 'border-teal-500 bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">UPI / Instant QR</p>
                    <p className="text-xs text-slate-400 mt-0.5">Google Pay, PhonePe, BHIM</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    paymentMethod === 'CARD'
                      ? 'border-teal-500 bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">Credit / Debit Card</p>
                    <p className="text-xs text-slate-400 mt-0.5">Visa, Mastercard, RuPay</p>
                  </div>
                </button>
              </div>

              {/* Simulation Test Controls */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Testing Controls (Safe Sandbox)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Zero Live Billing</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulationScenario('SUCCESS')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition ${
                      simulationScenario === 'SUCCESS'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationScenario('FAILURE')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition ${
                      simulationScenario === 'FAILURE'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Simulate Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationScenario('PENDING')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition ${
                      simulationScenario === 'PENDING'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Simulate Pending
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fee Breakdown & Pay Button */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 rounded-3xl p-6 shadow-2xl border border-teal-500/30 sticky top-24 backdrop-blur-xl">
              <h2 className="text-base font-bold text-white mb-4">Payment Summary</h2>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Physician Consultation Fee</span>
                  <span className="font-semibold text-white font-mono">
                    ₹{((feeDetails?.baseConsultationPaise || 50000) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>CareBridge Clinical Platform Fee</span>
                  <span className="font-semibold text-white font-mono">
                    ₹{((feeDetails?.platformFeePaise || 5000) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>GST (18% Telehealth Regulation)</span>
                  <span className="font-semibold text-white font-mono">
                    ₹{((feeDetails?.gstPaise || 9900) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-extrabold text-white">
                  <span>Total Payable</span>
                  <span className="text-teal-400 text-2xl font-black font-mono">
                    {feeDetails?.formattedTotal || '₹649.00'}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                disabled={processing}
                onClick={handlePay}
                className="w-full py-4 px-6 rounded-2xl text-base font-black text-slate-950 bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 active:scale-98 shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {feeDetails?.formattedTotal || '₹649.00'} Securely</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Simulated Mode Enabled • Instant Database Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MinimalLayout>
  );
};
