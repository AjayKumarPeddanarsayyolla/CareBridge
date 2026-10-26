import api from './api';

export const getFeeEstimate = async (doctorId) => {
  const response = await api.get(`/payments/fee-estimate/${doctorId}`);
  return response.data;
};

export const createPaymentOrder = async (appointmentId, preferredProvider = 'SIMULATED') => {
  const response = await api.post('/payments/create-order', {
    appointmentId,
    preferredProvider,
    idempotencyKey: `idem_cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  });
  return response.data;
};

export const verifyPayment = async ({ orderId, providerPaymentId, signature, scenario = 'SUCCESS' }) => {
  const response = await api.post('/payments/verify', {
    orderId,
    providerPaymentId,
    signature,
    scenario
  });
  return response.data;
};

export const getReceipt = async (orderId) => {
  const response = await api.get(`/payments/receipt/${orderId}`);
  return response.data;
};

export const getMyPayments = async () => {
  const response = await api.get('/payments/my-history');
  return response.data;
};
