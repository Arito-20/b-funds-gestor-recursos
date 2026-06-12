import axios from 'axios';
import type { CreateResourcePayload, PurchaseOrder } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: BASE_URL,
});

// Inyecta el usuario demo en cada request
api.interceptors.request.use((config) => {
  const demoUser = localStorage.getItem('demoUser') || 'manager-peru';
  config.headers['x-demo-user'] = demoUser;
  return config;
});

// Recursos
export const resourcesApi = {
  getAll: () => api.get('/api/resources'),
  getOne: (id: number) => api.get(`/api/resources/${id}`),
  create: (data: CreateResourcePayload) => api.post('/api/resources', data),
  update: (id: number, data: Partial<CreateResourcePayload>) => api.put(`/api/resources/${id}`, data),
  delete: (id: number) => api.delete(`/api/resources/${id}`),
  generatePOs: (id: number) => api.post(`/api/resources/${id}/generate-purchase-orders`),
};

// OCs
export const purchaseOrdersApi = {
  getAll: () => api.get('/api/purchase-orders'),
  getPending: () => api.get('/api/purchase-orders/pending'),
  getByResource: (resourceId: number) => api.get(`/api/resources/${resourceId}/purchase-orders`),
  update: (id: number, data: Partial<Pick<PurchaseOrder, 'status' | 'poNumber' | 'comments'>>) =>
    api.put(`/api/purchase-orders/${id}`, data),
};

// Dashboard
export const dashboardApi = {
  getSummary: () => api.get('/api/dashboard/summary'),
};

// Catálogos
export const catalogApi = {
  getManagers: () => api.get('/api/managers'),
  getProviders: () => api.get('/api/providers'),
  getInitiatives: () => api.get('/api/initiatives'),
  getExchangeRates: () => api.get('/api/exchange-rates'),
};