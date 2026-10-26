import api from './api';

export const createCase = async (caseData) => {
  const response = await api.post('/cases', caseData);
  return response.data;
};

export const getCases = async (params = {}) => {
  const response = await api.get('/cases', { params });
  return response.data;
};

export const getCaseById = async (id) => {
  const response = await api.get(`/cases/${id}`);
  return response.data;
};

export const uploadCaseReport = async (caseId, formData) => {
  const response = await api.post(`/cases/${caseId}/reports`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getReportDownloadUrl = (reportId) => {
  const token = localStorage.getItem('carebridge_token');
  return `/api/cases/reports/${reportId}/download?token=${token}`;
};
