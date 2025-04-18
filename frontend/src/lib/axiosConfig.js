import axios from 'axios';

// We'll create an event for auth errors that can be listened to
export const authEvents = {
  onAuthError: new CustomEvent('auth-error'),
  onTokenRefreshFailed: new CustomEvent('token-refresh-failed')
};

// Configure axios defaults
axios.defaults.baseURL = 'https://backend.spendora.space/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Log the baseURL for debugging
console.log('Axios baseURL configured as:', axios.defaults.baseURL);

// Set up authentication token from localStorage if available
const accessToken = localStorage.getItem('access_token');
if (accessToken) {
  console.log('Found access token in localStorage, setting Authorization header');
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
} else {
  console.warn('No access token found in localStorage - user may not be authenticated');
}

// Log the current headers for debugging
console.log('Current axios headers:', axios.defaults.headers.common);

// Add request interceptor for logging
axios.interceptors.request.use(
  (config) => {
    // Add more detailed logging for requests
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params || {},
      headers: config.headers,
      data: config.data
    });
    
    // Check for authentication header
    if (!config.headers['Authorization'] && localStorage.getItem('access_token')) {
      console.warn('Authorization header missing but token exists - fixing');
      config.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors and token refresh
axios.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`API Error: ${originalRequest?.method?.toUpperCase() || 'UNKNOWN'} ${originalRequest?.url || 'UNKNOWN'}`, {
      status: error.response?.status,
      data: error.response?.data
    });
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, clear auth
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete axios.defaults.headers.common['Authorization'];
          
          // Dispatch event instead of redirecting
          window.dispatchEvent(authEvents.onAuthError);
          return Promise.reject(error);
        }
        
        console.log('Attempting to refresh token...');
        const response = await axios.post('/token/refresh/', {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        
        // Update the access token
        localStorage.setItem('access_token', access);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        console.log('Token refreshed successfully, retrying original request');
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
        
        // Dispatch event instead of redirecting
        window.dispatchEvent(authEvents.onTokenRefreshFailed);
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios; 