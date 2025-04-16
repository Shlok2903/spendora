import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios, { authEvents } from '../lib/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  
  // Define logout function with useCallback
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);
  
  // Listen for auth errors from axios interceptors
  useEffect(() => {
    const handleAuthError = () => {
      console.log('Auth error event received');
      logout();
      setError('Your session has expired. Please log in again.');
    };
    
    const handleTokenRefreshFailed = () => {
      console.log('Token refresh failed event received');
      logout();
      setError('Authentication failed. Please log in again.');
    };
    
    // Add event listeners
    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener('token-refresh-failed', handleTokenRefreshFailed);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('token-refresh-failed', handleTokenRefreshFailed);
    };
  }, [logout]);
  
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
      
      // Direct login without OTP - using the correct URL path
      const response = await axios.post('/auth/login/', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Check for tokens in response
      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens;
        
        // Store tokens in localStorage
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Set token state
        setToken(access);
        
        // Make sure the axios instance immediately gets the new token
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Fetch user profile
        await fetchUserProfile();
        
        setLoading(false);
        return { success: true };
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data) {
        setError(error.response.data.error || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
      
      setLoading(false);
      return false;
    }
  };

  const verifyOTP = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create request data with OTP verification details
      const requestData = {
        email: data.email,
        otp_code: data.otp,
        verification_type: data.verification_type
      };
      
      // For registration, include all user data to create account
      if (data.verification_type === 'registration' && data.userData) {
        requestData.first_name = data.userData.first_name;
        requestData.last_name = data.userData.last_name;
        requestData.password = data.userData.password;
        
        console.log('Verification with user data:', { 
          email: data.email, 
          first_name: data.userData.first_name,
          last_name: data.userData.last_name,
          hasPassword: !!data.userData.password
        });
      }
      
      // Using the correct URL path
      const response = await axios.post('/auth/verify-otp/', requestData);
      
      // If tokens are returned (for login or registration)
      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens;
        
        // Store tokens in localStorage
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Set token state
        setToken(access);
        
        // Make sure the axios instance immediately gets the new token
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        // Fetch user profile after successful OTP verification
        await fetchUserProfile();
      }
      
      return {
        success: true,
        token: response.data.token || null
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.response?.data) {
        setError(error.response.data.error || 'OTP verification failed. Please try again.');
      } else {
        setError('OTP verification failed. Please try again.');
      }
      
      return {
        success: false,
        message: error.response?.data?.error || 'OTP verification failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting registration process for:', { ...userData, password: '[REDACTED]' });
      
      // Rename password_confirm to match backend if needed
      if (userData.confirmPassword) {
        userData.password_confirm = userData.confirmPassword;
        delete userData.confirmPassword;
      }
      
      // Request OTP for registration verification - using the correct URL path
      const otpResponse = await axios.post('/auth/request-otp/', {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        verification_type: 'registration'
      });
      
      setLoading(false);
      
      // Return data for OTP verification including all user data for later creation
      return {
        success: true,
        requiresOTP: true,
        email: userData.email,
        verificationType: 'registration',
        userData: userData  // Include full user data to create account after verification
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data) {
        setError(error.response.data.error || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
      
      setLoading(false);
      return false;
    }
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using the correct URL path
      const response = await axios.post('/auth/request-otp/', {
        email,
        verification_type: 'password_reset'
      });
      
      setLoading(false);
      return {
        success: true,
        email,
        verificationType: 'password_reset'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      
      if (error.response?.data) {
        setError(error.response.data.error || 'Failed to request password reset. Please try again.');
      } else {
        setError('Failed to request password reset. Please try again.');
      }
      
      setLoading(false);
      return false;
    }
  };

  const requestOTP = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/auth/request-otp/', {
        email: data.email,
        verification_type: data.verification_type,
        first_name: data.first_name,
        last_name: data.last_name
      });
      
      setLoading(false);
      return {
        success: true,
        email: data.email,
        verificationType: data.verification_type
      };
    } catch (error) {
      console.error('OTP request error:', error);
      
      if (error.response?.data) {
        setError(error.response.data.error || 'Failed to send verification code. Please try again.');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
      
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to send verification code'
      };
    }
  };

  const resetPassword = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using the correct URL path
      const response = await axios.post('/auth/reset-password/', {
        email: data.email,
        otp_code: data.token,
        new_password: data.password,
        new_password_confirm: data.password_confirm
      });
      
      setLoading(false);
      return {
        success: true
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response?.data) {
        setError(error.response.data.error || 'Failed to reset password. Please try again.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
      
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to reset password'
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    token,
    login,
    register,
    logout,
    verifyOTP,
    requestPasswordReset,
    resetPassword,
    fetchUserProfile,
    requestOTP,
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