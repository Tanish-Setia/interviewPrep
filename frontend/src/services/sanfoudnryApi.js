import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const sanfoundryApi = {
  // Get all topics
  getTopics: async () => {
    const response = await axios.get(`${API_BASE}/sanfoundry/topics`);
    return response.data;
  },

  // Get questions for a topic
  getQuestions: async (topic, page = 1, limit = 20) => {
    const response = await axios.get(
      `${API_BASE}/sanfoundry/questions/${topic}`,
      { params: { page, limit } }
    );
    return response.data;
  },

  // Import topic to database
  importTopic: async (topic) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE}/sanfoundry/import/${topic}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Search topics
  searchTopics: async (query) => {
    const response = await axios.get(`${API_BASE}/sanfoundry/search`, {
      params: { q: query }
    });
    return response.data;
  }
};

export default sanfoundryApi;