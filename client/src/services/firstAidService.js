import api from './api';

export const getFirstAidGuides = async (params = {}) => {
  const response = await api.get('/first-aid', { params });
  return response.data;
};

export const getFirstAidGuideByIdOrSlug = async (slugOrId) => {
  const response = await api.get(`/first-aid/${slugOrId}`);
  return response.data;
};
