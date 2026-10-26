import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  HeartPulse,
  Calendar,
  FileText,
  Users,
  AlertTriangle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  CheckCircle,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { ChatbotWidget } from '../components/common/ChatbotWidget';

export const PatientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/patient', icon: HeartPulse },
    { name: 'Find Doctors', path: '/doctors', icon: Stethoscope },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Submit Concern', path: '/patient/submit-concern', icon: AlertTriangle },
    { name: 'My Cases', path: '/patient/cases', icon: FileText },
    { name: 'Medical Reports', path: '/patient/reports', icon: FileText },
    { name: 'Family & Guardians', path: '/patient/family', icon: Users }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Patient Specific Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand + Role Badge */}
            <div className="flex items-center space-x-3">
              <Link to="/patient" className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                    Care<span className="text-teal-600">Bridge</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-sm tracking-wide mt-0.5 self-start">
                    Patient Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive(item.path)
                        ? 'text-teal-800 bg-teal-50 shadow-xs'
                        : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Notifications & Profile */}
            <div className="flex items-center space-x-3">
              {/* Emergency Fast Dial */}
              <Link
                to="/emergency"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency 112 / 108</span>
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition relative"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-900">Notifications</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No notifications right now
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                              !n.read ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900 leading-snug">{n.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                  aria-label="User profile menu"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                    {user?.fullName?.charAt(0) || 'P'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/patient/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Medical Baseline Profile</span>
                    </Link>
                    <Link
                      to="/patient/appointments"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>My Consultation Schedule</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive(item.path) ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/patient/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-xl text-sm font-bold text-slate-700 border border-slate-200"
              >
                My Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-center py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating Local AI Healthcare Assistant */}
      <ChatbotWidget />

      {/* Compact Patient Healthcare Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Patient data encrypted with AES-256 and stored in compliant PostgreSQL persistence.</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/emergency" className="text-red-600 hover:underline font-bold flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency Dial: 112 / 108
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/about" className="hover:text-slate-700">Governance & Disclaimers</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
