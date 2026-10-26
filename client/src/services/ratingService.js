import api from './api';

export const submitDoctorRating = async (doctorId, data) => {
  const res = await api.post(`/ratings/doctors/${doctorId}`, data);
  return res.data;
};

export const getDoctorRatings = async (doctorId, params = {}) => {
  const res = await api.get(`/ratings/doctors/${doctorId}`, { params });
  return res.data;
};

export const getMyRating = async (doctorId) => {
  const res = await api.get(`/ratings/doctors/${doctorId}/my-rating`);
  return res.data;
};

export const getAllRatingsAdmin = async (params = {}) => {
  const res = await api.get('/ratings/admin/all', { params });
  return res.data;
};
