import api from './api';

export const getEmergencyWarnings = async () => {
  const response = await api.get('/emergency/warnings');
  return response.data;
};
