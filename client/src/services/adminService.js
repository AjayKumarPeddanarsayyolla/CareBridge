import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getPendingDoctors = async () => {
  const response = await api.get('/admin/doctors/pending');
  return response.data;
};

export const verifyDoctor = async (doctorId) => {
  const response = await api.put(`/admin/doctors/${doctorId}/verify`);
  return response.data;
};

export const rejectDoctor = async (doctorId, reason) => {
  const response = await api.put(`/admin/doctors/${doctorId}/reject`, { reason });
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const toggleUserStatus = async (userId, status) => {
  const response = await api.put(`/admin/users/${userId}/status`, { status });
  return response.data;
};

export const createFirstAidGuide = async (guideData) => {
  const response = await api.post('/admin/first-aid', guideData);
  return response.data;
};

export const updateFirstAidGuide = async (id, guideData) => {
  const response = await api.put(`/admin/first-aid/${id}`, guideData);
  return response.data;
};

export const deleteFirstAidGuide = async (id) => {
  const response = await api.delete(`/admin/first-aid/${id}`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs');
  return response.data;
};

export const getClientDetails = async (params = {}) => {
  const response = await api.get('/admin/clients', { params });
  return response.data;
};

export const getGuardianDetails = async (params = {}) => {
  const response = await api.get('/admin/guardians', { params });
  return response.data;
};

export const getDoctorDetails = async (params = {}) => {
  const response = await api.get('/admin/doctors/details', { params });
  return response.data;
};
