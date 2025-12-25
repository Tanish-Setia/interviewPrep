import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',  // ✅ Fixed
  withCredentials: true,
  // ✅ Removed default Content-Type - axios will auto-detect
});

// ✅ ADD TOKEN TO ALL REQUESTS
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - good as is
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/signup';
      const isAuthCheck = error.config?.url === '/auth/me';
      
      if (!isAuthPage && !isAuthCheck) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ✅ API methods - good as is
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