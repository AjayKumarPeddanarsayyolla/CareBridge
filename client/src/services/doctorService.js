import api from './api';

export const getVerifiedDoctors = async (params = {}) => {
  const response = await api.get('/doctors', { params });
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
};

export const getDoctorDashboardSummary = async () => {
  const response = await api.get('/doctors/portal/dashboard-summary');
  return response.data;
};

export const acceptCase = async (caseId) => {
  const response = await api.post(`/doctors/cases/${caseId}/accept`);
  return response.data;
};

export const provideGuidance = async (caseId, guidanceData) => {
  const response = await api.post(`/doctors/cases/${caseId}/guidance`, guidanceData);
  return response.data;
};

export const updateDoctorProfile = async (profileData) => {
  const response = await api.put('/doctors/portal/profile', profileData);
  return response.data;
};
