import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  
  // Check if token exists in localStorage and initialize user
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      // Set the token state
      setToken(accessToken);
      // Get user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await axios.get('/users/me/');
      console.log('User profile fetched successfully:', response.data);
      
      // Update user state with the fetched data and set isAuthenticated flag
      setUser({
        ...response.data,
        isAuthenticated: true
      });
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        console.log('Authentication token is invalid or expired');
        // Logout if token is invalid
        logout();
      } else {
        // For other errors, keep the user logged in but update state
        setUser({
          isAuthenticated: true,
          error: 'Failed to fetch profile'
        });
      }
      
      setLoading(false);
      return false;
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate credentials object
      if (!credentials || typeof credentials !== 'object') {
        console.error('Invalid credentials format:', credentials);
        setError('Invalid credentials format. Please provide a valid email and password.');
        setLoading(false);
        return false;
      }
      
      if (!credentials.email || !credentials.password) {
        console.error('Missing email or password in credentials');
        setError('Email and password are required.');
        setLoading(false);
        return false;
      }
      
      console.log('Sending login request with credentials:', { email: credentials.email, password: '[REDACTED]' });
      
      const response = await axios.post('/token/', credentials);
      const { access, refresh } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Set token state
      setToken(access);
      
      // Make sure the axios instance immediately gets the new token
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      console.log('Login successful, tokens stored and axios headers updated');
      console.log('Current axios headers:', axios.defaults.headers.common);
      
      // Fetch user profile after successful login
      await fetchUserProfile();
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Server response error:', error.response.status, error.response.data);
        
        // Handle different types of errors
        if (error.response.data) {
          if (typeof error.response.data === 'object') {
            // Format field errors
            const errorMessages = Object.entries(error.response.data)
              .map(([field, messages]) => {
                // Handle array of messages or single message
                const message = Array.isArray(messages) ? messages.join(', ') : messages;
                return `${field}: ${message}`;
              })
              .join('\n');
            
            setError(errorMessages);
          } else {
            // Direct error message
            setError(error.response.data);
          }
        } else {
          // Generic error based on status
          setError(`Login failed (${error.response.status}). Please check your credentials.`);
        }
      } else if (error.request) {
        // Network error
        console.error('Network error - No response received:', error.request);
        setError('Network error. Please check your internet connection.');
      } else {
        // Other errors
        setError(error.message || 'Failed to login. Please try again.');
      }
      
      setLoading(false);
      return false;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Registering user with data:', { ...userData, password: '[REDACTED]' });
      const response = await axios.post('/users/', userData);
      console.log('Registration successful:', response.data);
      
      // Automatically log in the user after successful registration
      const loginSuccess = await login({ 
        email: userData.email, 
        password: userData.password 
      });
      
      if (!loginSuccess) {
        console.log('Registration succeeded but automatic login failed. User should log in manually.');
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error', error);
      console.error('Registration error details:', error.response?.data || error.message);
      
      // Improved error handling to better display validation errors
      if (error.response?.data) {
        // Check if the error is an object with field-specific errors
        if (typeof error.response.data === 'object') {
          // Format the error messages for display
          const errorMessages = Object.entries(error.response.data)
            .map(([field, messages]) => {
              // If messages is an array, join them
              const message = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${message}`;
            })
            .join('\n');
          
          setError(errorMessages);
        } else {
          // If it's a string or other format, use it directly
          setError(error.response.data);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
      
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 