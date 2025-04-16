import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.svg';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { requestOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const result = await requestOTP({
        email: email.trim(),
        verification_type: 'password_reset'
      });
      
      if (result.success) {
        setSuccess(true);
        toast.success('Reset instructions sent to your email');
        
        // Navigate to OTP verification with necessary state
        navigate('/verify-otp', {
          state: {
            email: email.trim(),
            verificationType: 'password_reset'
          }
        });
      } else {
        setError(result.message || 'Failed to process your request. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-content-section">
        <div className="logo-container">
          <img src={logo} alt="Spendora Logo" className="logo" />
        </div>
        
        <div className="login-form-content">
          <h1 className="login-heading">Reset Password</h1>
          <p className="login-subheading">
            Enter your email address and we'll send you a code to reset your password
          </p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              Verification code has been sent to your email
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  border: '1px solid #1E1E1E',
                  borderRadius: '30px'
                }}
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              <span className="login-button-text">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </span>
              <span className="login-arrow">→</span>
            </button>
            
            <div className="register-link">
              Remember your password? <RouterLink to="/login" style={{ color: '#0FBAE5' }}>Back to Login</RouterLink>
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

export default ForgotPassword; 