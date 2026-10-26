
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const redirectUrl = new URLSearchParams(location.search).get('redirect');

  const demoAccounts = [
    {
      label: 'Admin Portal',
      email: 'admin@carebridge.com',
      password: 'Admin_CB#2026!',
    },
    {
      label: 'Doctor (Cardiology)',
      email: 'dr.sarah@carebridge.com',
      password: 'Doctor_CB#2026!',
    },
    {
      label: 'Patient (John)',
      email: 'john.doe@carebridge.com',
      password: 'Patient_CB#2026!',
    },
    {
      label: 'Family Member (Mary)',
      email: 'mary.doe@carebridge.com',
      password: 'Family_CB#2026!',
    },
  ];

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setSelectedDemo(demoEmail);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result?.success || !result?.user) {
        setError('Login failed. Please check your email and password.');
        return;
      }

      if (redirectUrl) {
        // Accept only internal relative paths to prevent external redirects.
        if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
          navigate(redirectUrl);
          return;
        }
      }

      switch (result.user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'DOCTOR':
          navigate('/doctor');
          break;
        case 'GUARDIAN':
        case 'FAMILY_MEMBER':
          navigate('/family');
          break;
        case 'PATIENT':
        default:
          navigate('/patient');
          break;
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials or login failure.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30 mb-3">
            <HeartPulse className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to CareBridge
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Access your secure health dashboard, cases, and doctor consultations
          </p>
        </header>

        <section
          aria-labelledby="demo-profiles-heading"
          className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="demo-profiles-heading"
              className="text-[11px] font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-300"
            >
              One-Click Demo Profiles
            </h2>
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">Click to populate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoAccounts.map((account) => {
              const isSelected = selectedDemo === account.email && email === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email, account.password)}
                  className={`px-3 py-2.5 text-left rounded-xl transition border relative ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 hover:bg-teal-100/60 dark:hover:bg-teal-900/40 border-teal-200 dark:border-teal-900/60 text-slate-800 dark:text-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`block text-xs font-bold ${isSelected ? 'text-white' : 'text-teal-700 dark:text-teal-300'}`}>
                      {account.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-100" />}
                  </div>
                  <span className={`block text-[11px] mt-0.5 break-all font-mono ${isSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {account.email}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (selectedDemo && selectedDemo !== event.target.value) {
                      setSelectedDemo(null);
                    }
                  }}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition
                    bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-4
                    disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]
                    dark:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#1e293b_inset] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#f8fafc]
                    ${
                      error
                        ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-teal-500/20'
                    }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm font-medium transition
                    bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-4
                    disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed
                    [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]
                    dark:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#1e293b_inset] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#f8fafc]
                    ${
                      error
                        ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-teal-500/20'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                  className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
