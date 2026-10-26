import api from './api';

export const getFamilyMembers = async () => {
  const response = await api.get('/family/members');
  return response.data;
};

export const inviteFamilyMember = async (inviteData) => {
  const response = await api.post('/family/invite', inviteData);
  return response.data;
};

export const updateFamilyPermissions = async (id, permissionData) => {
  const response = await api.put(`/family/permissions/${id}`, permissionData);
  return response.data;
};

export const revokeFamilyRelationship = async (id) => {
  const response = await api.delete(`/family/relationship/${id}`);
  return response.data;
};

export const getLinkedPatients = async () => {
  const response = await api.get('/family/linked-patients');
  return response.data;
};
