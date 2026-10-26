import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Menu, X, ArrowRight, ShieldCheck, PhoneCall } from 'lucide-react';
import { EmergencyBanner } from '../components/common/EmergencyBanner';
import { Footer } from '../components/common/Footer';

export const PublicLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin';
      case 'DOCTOR': return '/doctor';
      case 'GUARDIAN':
      case 'FAMILY_MEMBER': return '/family';
      case 'PATIENT':
      default: return '/patient';
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctors', path: '/doctors' },
    { name: 'First Aid', path: '/first-aid' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Emergency', path: '/emergency' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      <EmergencyBanner />

      {/* Public Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition duration-200">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  Care<span className="text-teal-600">Bridge</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Healthcare Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive(item.path)
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Action / Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition hover:-translate-y-0.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100/80 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/30 transition hover:-translate-y-0.5"
                  >
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-semibold ${
                  isActive(item.path) ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl text-base font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-base font-bold text-slate-700 border border-slate-200 hover:bg-slate-50"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-base font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Comprehensive Public Marketing Footer */}
      <Footer />
    </div>
  );
};
