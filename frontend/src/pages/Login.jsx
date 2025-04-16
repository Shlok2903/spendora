import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.svg';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, error: authError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear errors when component mounts or user changes input
  useEffect(() => {
    setLocalError('');
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ensure this is called to prevent form submission
    
    // Client-side validation
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    
    setLoading(true);
    setLocalError('');
    
    const credentials = {
      email: email.trim(),
      password: password
    };
    
    console.log('Submitting login credentials as object:', { email });
    try {
      const result = await login(credentials);
      
      if (result && result.success) {
        if (result.requiresOTP) {
          // Navigate to OTP verification page
          toast.info('Please verify your identity with the code sent to your email.');
          navigate('/verify-otp', {
            state: {
              email: result.email,
              verificationType: result.verificationType
            }
          });
        } else {
          // Regular login success
          toast.success('Login successful! Welcome back.');
          
          // Check if there's a redirect path in location state
          const from = location.state?.from?.pathname || '/app';
          navigate(from);
        }
      } else {
        // Only show toast error if there's no inline error
        if (!authError && !localError) {
          setLocalError('Login failed. Please check your credentials.');
          toast.error('Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('An unexpected error occurred. Please try again.');
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Display error from auth context or local error
  const displayError = authError || localError;

  return (
    <div className="login-container">
      <div className="login-content-section">
        <div className="logo-container">
          <img src={logo} alt="Spendora Logo" className="logo" />
        </div>
        
        <div className="login-form-content">
          <h1 className="login-heading">Hello Again!</h1>
          <p className="login-subheading">Welcome Back!</p>
          
          {displayError && (
            <div className="error-message">
              {displayError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Id</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="forgot-password">
                <RouterLink to="/forgot-password">Forgot password?</RouterLink>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              <span className="login-button-text">{loading ? 'Logging in...' : 'Login'}</span>
              <span className="login-arrow">→</span>
            </button>
            
            <div className="register-link">
              Don't have an account? <RouterLink to="/register">Sign up</RouterLink>
            </div>
          </form>
        </div>
      </div>
      
      <div className="dashboard-preview">
        {/* Dashboard preview is handled by CSS */}
      </div>
    </div>
  );
};

export default Login; 