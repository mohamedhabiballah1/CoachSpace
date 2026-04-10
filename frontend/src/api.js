const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  // Health check endpoint
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.error('API health check error:', error);
      throw error;
    }
  },

  // Generic GET request
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  // Generic POST request
  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },
};
