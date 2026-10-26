import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, ArrowLeft, ShieldAlert, CheckCircle2, UserX, UserCheck, Shield } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as adminService from '../../services/adminService';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: search.trim() || undefined
      });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (
      !window.confirm(
        `Are you sure you want to change the status of ${user.fullName} to ${newStatus}?`
      )
    )
      return;

    try {
      const res = await adminService.toggleUserStatus(user._id || user.id, newStatus);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Overview</span>
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Directory & Access Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review registered patients, caregivers, physicians, and adjust account access permissions.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchUsers();
            }}
            className="w-full sm:w-80 relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </form>

          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'PATIENT', 'FAMILY_MEMBER', 'DOCTOR', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  roleFilter === r
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner message="Retrieving user database..." />
        ) : (
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Registered</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-white text-sm">{u.fullName}</td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-slate-300">{u.email}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{u.mobile}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary">{u.role?.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            u.status === 'ACTIVE'
                              ? 'success'
                              : u.status === 'SUSPENDED'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/80'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/80'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
