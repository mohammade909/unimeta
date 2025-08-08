// services/api/adminApi.js
import { adminApiClient } from './client';

export const adminApi = {
  // User Management
  getAllUsers: (params) => 
    adminApiClient.get('/users', { params }),
  
  getUserById: (userId) => 
    adminApiClient.get(`/users/${userId}`),
  
  updateUserStatus: (userId, status) => 
    adminApiClient.patch(`/users/${userId}/status`, { status }),
  
  deleteUser: (userId) => 
    adminApiClient.delete(`/users/${userId}`),
  
  // System Analytics
  getSystemStats: () => 
    adminApiClient.get('/analytics/system'),
  
  getIncomeAnalytics: (period) => 
    adminApiClient.get('/analytics/income', { params: { period } }),
  
  getUserGrowthStats: () => 
    adminApiClient.get('/analytics/growth'),
  
  // Reports
  generateIncomeReport: (params) => 
    adminApiClient.post('/reports/income', params),
  
  getSystemHealth: () => 
    adminApiClient.get('/system/health')
};