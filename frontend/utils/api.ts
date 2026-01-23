import axios from 'axios';
import { auth } from '../lib/firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      console.error('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const chatAPI = {
  sendMessage: async (message: string, sessionId?: string) => {
    const response = await api.post('/chat/nyayai', { message, session_id: sessionId });
    return response.data;
  },
  
  getChatHistory: async (sessionId: string) => {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  },
  
  getUserChats: async () => {
    const response = await api.get('/chat/user-chats');
    return response.data;
  },
};

export const lawyerAPI = {
  listLawyers: async (filters?: any) => {
    const response = await api.get('/lawyers/list', { params: filters });
    return response.data;
  },
  
  getLawyer: async (lawyerId: string) => {
    const response = await api.get(`/lawyers/${lawyerId}`);
    return response.data;
  },
};

export const bookingAPI = {
  createBooking: async (bookingData: any) => {
    const response = await api.post('/bookings/create', bookingData);
    return response.data;
  },
  
  verifyPayment: async (paymentData: any) => {
    const response = await api.post('/bookings/verify-payment', null, { params: paymentData });
    return response.data;
  },
  
  listBookings: async () => {
    const response = await api.get('/bookings/list');
    return response.data;
  },
};

export const documentAPI = {
  generateDocument: async (documentData: any) => {
    const response = await api.post('/documents/generate', documentData);
    return response.data;
  },
  
  listDocuments: async () => {
    const response = await api.get('/documents/list');
    return response.data;
  },
};

export const caseAPI = {
  createCase: async (caseData: any) => {
    const response = await api.post('/cases/create', caseData);
    return response.data;
  },
  
  listCases: async () => {
    const response = await api.get('/cases/list');
    return response.data;
  },
  
  getCase: async (caseId: string) => {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
  },
  
  addNote: async (caseId: string, note: string) => {
    const response = await api.put(`/cases/${caseId}/notes`, { content: note });
    return response.data;
  },
};

export const lawAPI = {
  listLaws: async (filters?: any) => {
    const response = await api.get('/laws/list', { params: filters });
    return response.data;
  },
  
  getLaw: async (lawId: string) => {
    const response = await api.get(`/laws/${lawId}`);
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.post('/users/profile', profileData);
    return response.data;
  },
};
