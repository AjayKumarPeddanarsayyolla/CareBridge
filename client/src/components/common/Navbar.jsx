import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  HeartPulse,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronDown,
  CheckCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Determine dashboard link based on role
  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'DOCTOR':
        return '/doctor';
      case 'GUARDIAN':
      case 'FAMILY_MEMBER':
        return '/family';
      case 'PATIENT':
      default:
        return '/patient';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-700/25 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                Care<span className="text-teal-600">Bridge</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                Clinical Telehealth
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5" aria-label="Main Navigation">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                isActive('/') ? 'text-teal-800 bg-teal-50/80 shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                isActive('/doctors') ? 'text-teal-800 bg-teal-50/80 shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              Doctors
            </Link>
            <Link
              to="/first-aid"
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                isActive('/first-aid') ? 'text-teal-800 bg-teal-50/80 shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              First Aid
            </Link>
            <Link
              to="/how-it-works"
              className={`px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                isActive('/how-it-works') ? 'text-teal-800 bg-teal-50/80 shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              How It Works
            </Link>

            {/* Emergency Info Link with subtle alert badge */}
            <Link
              to="/emergency"
              className={`px-2.5 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center space-x-1 ${
                isActive('/emergency') ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-rose-600 hover:bg-rose-50/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency</span>
            </Link>

            {/* Authenticated Role Portal Shortcuts */}
            {user && (
              <Link
                to={getDashboardPath()}
                className="ml-1 px-3 py-1.5 rounded-xl text-xs lg:text-sm font-bold text-teal-800 bg-teal-100/70 hover:bg-teal-200/70 border border-teal-200/60 transition flex items-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                <span>Dashboard</span>
              </Link>
            )}

            {user?.role === 'PATIENT' && (
              <Link
                to="/patient/submit-concern"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-sm shadow-teal-600/30 transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit Concern</span>
              </Link>
            )}
          </nav>

          {/* Right Action Area: Auth / Notifications / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 relative transition focus:outline-none focus:ring-2 focus:ring-teal-500"
                    title="Notifications"
                    aria-label="View Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-teal-100 text-teal-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-teal-600 hover:text-teal-700 font-bold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-slate-400 text-xs">
                            No notifications at this time
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((notif) => (
                            <div
                              key={notif._id || notif.id}
                              onClick={() => {
                                markAsRead(notif._id || notif.id);
                                if (notif.link) {
                                  navigate(notif.link);
                                  setNotificationsOpen(false);
                                }
                              }}
                              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition flex items-start space-x-3 ${
                                !notif.read && !notif.isRead ? 'bg-teal-50/50' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                !notif.read && !notif.isRead ? 'bg-teal-500' : 'bg-slate-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill & Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="User Menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <div className="text-xs font-bold text-slate-800">{user.fullName?.split(' ')[0]}</div>
                      <div className="text-[10px] text-teal-700 uppercase font-bold tracking-wider">
                        {user.role.replace('_', ' ')}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-1.5 bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                        >
                          <Layers className="w-4 h-4 text-teal-600" />
                          <span>Portal Dashboard</span>
                        </Link>

                        {user.role === 'PATIENT' && (
                          <>
                            <Link
                              to="/patient/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                            >
                              <FileText className="w-4 h-4 text-teal-600" />
                              <span>Medical Profile</span>
                            </Link>
                            <Link
                              to="/patient/appointments"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                            >
                              <Calendar className="w-4 h-4 text-teal-600" />
                              <span>My Appointments</span>
                            </Link>
                          </>
                        )}

                        {user.role === 'DOCTOR' && (
                          <Link
                            to="/doctor/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800"
                          >
                            <User className="w-4 h-4 text-teal-600" />
                            <span>Doctor Profile & Hours</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-sm shadow-teal-600/30 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            Doctor Directory
          </Link>
          <Link
            to="/first-aid"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            First Aid & Triage
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            How CareBridge Works
          </Link>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-rose-600 bg-rose-50/80"
          >
            Emergency Protocols & SOS
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-teal-800 bg-teal-50"
              >
                Dashboard ({user.role.replace('_', ' ')})
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm shadow-teal-600/30"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
