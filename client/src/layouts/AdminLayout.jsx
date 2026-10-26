import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  UserCheck,
  FileText,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Database,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'System Overview', path: '/admin', icon: Layers },
    { name: 'Doctor Approvals', path: '/admin/doctors/pending', icon: UserCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'First Aid CMS', path: '/admin/first-aid', icon: FileText },
    { name: 'Audit & Security Logs', path: '/admin/audit-logs', icon: Activity }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/70 font-sans text-slate-900">
      {/* Admin Operations Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                    Care<span className="text-amber-400">Bridge</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded-sm tracking-wide mt-0.5 self-start">
                    Platform Administration
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isActive(item.path)
                        ? 'text-white bg-slate-800 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {/* System Health Status */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>PostgreSQL 18: Healthy</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                    ADM
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold truncate">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/admin/audit-logs"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span>Security & Audit Logs</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Exit Admin Session</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive(item.path) ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-center py-2 rounded-xl text-sm font-bold text-red-400 bg-red-950/60"
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

      {/* Admin Governance Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>CareBridge Administrative Control Plane. All actions are logged to immutable AuditLog records.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Role: System Administrator</span>
            <span className="text-slate-600">|</span>
            <span>Version: 2.0.0-pg</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
