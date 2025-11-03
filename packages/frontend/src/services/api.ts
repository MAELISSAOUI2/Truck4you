import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth-storage');
  if (auth) {
    const { state } = JSON.parse(auth);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
  getMe: () =>
    api.get('/auth/me'),
};

// Shipments
export const shipmentAPI = {
  getAll: (params?: any) =>
    api.get('/shipments', { params }),
  getById: (id: string) =>
    api.get(`/shipments/${id}`),
  create: (data: any) =>
    api.post('/shipments', data),
  updateStatus: (id: string, data: any) =>
    api.put(`/shipments/${id}/status`, data),
  submitProof: (id: string, data: any) =>
    api.post(`/shipments/${id}/proof`, data),
  acceptBid: (shipmentId: string, bidId: string) =>
    api.post(`/shipments/${shipmentId}/accept-bid/${bidId}`),
};

// Transporters
export const transporterAPI = {
  submitBid: (data: any) =>
    api.post('/transporters/bids', data),
  getProfile: () =>
    api.get('/transporters/profile'),
  updateProfile: (data: any) =>
    api.put('/transporters/profile', data),
  getVehicles: () =>
    api.get('/transporters/vehicles'),
  addVehicle: (data: any) =>
    api.post('/transporters/vehicles', data),
  getDeposit: () =>
    api.get('/transporters/deposit'),
  submitDeposit: (amount: number) =>
    api.post('/transporters/deposit', { amount }),
};

// Payments
export const paymentAPI = {
  create: (data: any) =>
    api.post('/payments', data),
  getAll: () =>
    api.get('/payments'),
  releaseEscrow: (id: string) =>
    api.post(`/payments/${id}/release`),
  payInstallment: (id: string) =>
    api.post(`/payments/installments/${id}/pay`),
};

// Reviews
export const reviewAPI = {
  create: (data: any) =>
    api.post('/reviews', data),
  getByCompany: (companyId: string) =>
    api.get(`/reviews/company/${companyId}`),
};

// Notifications
export const notificationAPI = {
  getAll: () =>
    api.get('/notifications'),
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
};

export default api;
