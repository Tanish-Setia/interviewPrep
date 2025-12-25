import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ ADD TOKEN TO ALL REQUESTS
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/signup';
      const isAuthCheck = error.config?.url === '/auth/me';
      
      if (!isAuthPage && !isAuthCheck) {
        // Clear invalid token
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getMCQQuestions = async (params) => {
  const response = await api.get('/questions/mcq', { params });
  return response.data;
};

export const getSanfoundryCategories = async () => {
  const response = await api.get('/questions/sanfoundry/categories');
  return response.data;
};

export const importSanfoundryQuestions = async (categoryTitle, limit = 50) => {
  const response = await api.post('/questions/sanfoundry/import', {
    categoryTitle,
    limit
  });
  return response.data;
};

export default api;