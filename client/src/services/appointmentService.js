import api from './api';

export const bookAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getAppointments = async (params = {}) => {
  const response = await api.get('/appointments', { params });
  return response.data;
};

export const updateAppointmentStatus = async (id, statusData) => {
  const response = await api.put(`/appointments/${id}/status`, statusData);
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

