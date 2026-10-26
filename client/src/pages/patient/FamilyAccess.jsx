import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Check, X, AlertCircle, CheckCircle2, Trash2, HeartHandshake } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as familyService from '../../services/familyService';

export const FamilyAccess = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const [inviteData, setInviteData] = useState({
    email: '',
    relationshipType: 'Spouse',
    permissions: {
      viewMedicalHistory: true,
      viewCases: true,
      viewAppointments: true,
      participateChat: true,
      submitConcerns: true
    }
  });

  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await familyService.getFamilyMembers();
      if (res.success) {
        setFamilyMembers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviteLoading(true);

    try {
      const res = await familyService.inviteFamilyMember(inviteData);
      if (res.success) {
        setSuccess('Family caregiver authorized successfully!');
        setInviteData({
          email: '',
          relationshipType: 'Spouse',
          permissions: {
            viewMedicalHistory: true,
            viewCases: true,
            viewAppointments: true,
            participateChat: true,
            submitConcerns: true
          }
        });
        fetchMembers();
        setTimeout(() => {
          setInviteOpen(false);
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link family member.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handlePermissionToggle = async (relId, permKey, currentValue) => {
    try {
      await familyService.updateFamilyPermissions(relId, {
        permissions: { [permKey]: !currentValue }
      });
      fetchMembers();
    } catch (err) {
      alert('Failed to update permissions: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRevoke = async (relId) => {
    if (!window.confirm('Are you sure you want to revoke caregiver access for this family member?'))
      return;
    try {
      await familyService.revokeFamilyRelationship(relId);
      fetchMembers();
    } catch (err) {
      alert('Failed to revoke access: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Caregiver Consent Delegation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Authorized Family Caregivers
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Grant trusted family members granular authorization to monitor records, submit concerns, and consult doctors.
            </p>
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Link Family Member</span>
          </button>
        </div>

        {/* Invite Dialog */}
        <AnimatePresence>
          {inviteOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>Authorize Family Caregiver</span>
                  </h2>
                  <button onClick={() => setInviteOpen(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3.5 rounded-xl bg-teal-950/70 border border-teal-800 text-teal-200 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Family Member Registered Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. mary.doe@carebridge.com"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      The family caregiver must have an active CareBridge account.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Relationship</label>
                    <select
                      value={inviteData.relationshipType}
                      onChange={(e) => setInviteData({ ...inviteData, relationshipType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-semibold"
                    >
                      <option value="Spouse">Spouse / Partner</option>
                      <option value="Child">Child (Adult)</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Other">Other Caregiver</option>
                    </select>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-800">
                    <label className="block text-xs font-black uppercase tracking-wider text-purple-300">
                      Permission Delegation:
                    </label>

                    <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteData.permissions.viewMedicalHistory}
                        onChange={(e) =>
                          setInviteData({
                            ...inviteData,
                            permissions: { ...inviteData.permissions, viewMedicalHistory: e.target.checked }
                          })
                        }
                        className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>View medical history, allergies & baseline medications</span>
                    </label>

                    <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteData.permissions.viewCases}
                        onChange={(e) =>
                          setInviteData({
                            ...inviteData,
                            permissions: { ...inviteData.permissions, viewCases: e.target.checked }
                          })
                        }
                        className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>View submitted health cases and doctor advice notes</span>
                    </label>

                    <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteData.permissions.submitConcerns}
                        onChange={(e) =>
                          setInviteData({
                            ...inviteData,
                            permissions: { ...inviteData.permissions, submitConcerns: e.target.checked }
                          })
                        }
                        className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>Submit health concerns & symptoms on my behalf</span>
                    </label>

                    <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteData.permissions.viewAppointments}
                        onChange={(e) =>
                          setInviteData({
                            ...inviteData,
                            permissions: { ...inviteData.permissions, viewAppointments: e.target.checked }
                          })
                        }
                        className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>View upcoming and scheduled doctor appointments</span>
                    </label>

                    <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteData.permissions.participateChat}
                        onChange={(e) =>
                          setInviteData({
                            ...inviteData,
                            permissions: { ...inviteData.permissions, participateChat: e.target.checked }
                          })
                        }
                        className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>Participate in doctor chat communication</span>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setInviteOpen(false)}
                      className="px-4 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl text-xs font-black shadow-md transition disabled:opacity-50"
                    >
                      {inviteLoading ? 'Authorizing...' : 'Grant Access'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Family Members List */}
        {loading ? (
          <LoadingSpinner message="Checking caregiver records..." />
        ) : familyMembers.length === 0 ? (
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">No Family Caregivers Linked</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have not delegated health access to any family members. You can authorize your spouse, child, or parent anytime.
              </p>
            </div>
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-purple-500 text-white font-black rounded-xl text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Link a Family Member</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {familyMembers.map((rel) => (
              <motion.div
                key={rel._id || rel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {rel.familyMemberId?.fullName?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-white text-base">
                        {rel.familyMemberId?.fullName}
                      </h3>
                      <Badge variant="primary">{rel.relationshipType}</Badge>
                      <Badge variant={rel.status}>{rel.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{rel.familyMemberId?.email}</p>

                    {/* Permissions Badges */}
                    <div className="flex flex-wrap gap-2 mt-3.5">
                      <button
                        onClick={() =>
                          handlePermissionToggle(rel._id || rel.id, 'viewMedicalHistory', rel.permissions?.viewMedicalHistory)
                        }
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border transition ${
                          rel.permissions?.viewMedicalHistory
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                        }`}
                      >
                        Medical History
                      </button>

                      <button
                        onClick={() =>
                          handlePermissionToggle(rel._id || rel.id, 'viewCases', rel.permissions?.viewCases)
                        }
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border transition ${
                          rel.permissions?.viewCases
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                        }`}
                      >
                        View Cases
                      </button>

                      <button
                        onClick={() =>
                          handlePermissionToggle(rel._id || rel.id, 'submitConcerns', rel.permissions?.submitConcerns)
                        }
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border transition ${
                          rel.permissions?.submitConcerns
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                        }`}
                      >
                        Submit Concerns
                      </button>

                      <button
                        onClick={() =>
                          handlePermissionToggle(rel._id || rel.id, 'viewAppointments', rel.permissions?.viewAppointments)
                        }
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border transition ${
                          rel.permissions?.viewAppointments
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                        }`}
                      >
                        Appointments
                      </button>

                      <button
                        onClick={() =>
                          handlePermissionToggle(rel._id || rel.id, 'participateChat', rel.permissions?.participateChat)
                        }
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border transition ${
                          rel.permissions?.participateChat
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-slate-950 text-slate-500 border-slate-800 line-through'
                        }`}
                      >
                        Doctor Chat
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleRevoke(rel._id || rel.id)}
                    className="px-4 py-2 border border-rose-800/60 text-rose-400 hover:bg-rose-950/60 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Access</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
