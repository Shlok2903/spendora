import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.svg';
import './Login.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });
  
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and token from location state
  const email = location.state?.email;
  const token = location.state?.token;
  
  useEffect(() => {
    if (!email || !token) {
      toast.error('Missing information for password reset.');
      navigate('/forgot-password');
    }
  }, [email, token, navigate, toast]);
  
  const checkPasswordStrength = (password) => {
    // Password strength criteria
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Calculate strength score (0-4)
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase && hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    
    // Determine message and color based on score
    let message = '';
    let color = '';
    
    switch (score) {
      case 0:
        message = 'Very Weak';
        color = '#FF4136'; // Red
        break;
      case 1:
        message = 'Weak';
        color = '#FF851B'; // Orange
        break;
      case 2:
        message = 'Medium';
        color = '#FFDC00'; // Yellow
        break;
      case 3:
        message = 'Strong';
        color = '#2ECC40'; // Green
        break;
      case 4:
        message = 'Very Strong';
        color = '#3D9970'; // Dark Green
        break;
      default:
        message = '';
        color = '';
    }
    
    return { score, message, color };
  };
  
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength({ score: 0, message: '', color: '' });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 2) {
      setError('Please choose a stronger password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await resetPassword({
        email,
        token,
        password,
        password_confirm: confirmPassword
      });
      
      if (result.success) {
        toast.success('Password has been reset successfully!');
        navigate('/login');
      } else {
        setError(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
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
          <h1 className="login-heading">Create New Password</h1>
          <p className="login-subheading">
            Your new password must be different from previous passwords
          </p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
                required
                style={{ 
                  border: '1px solid #1E1E1E',
                  borderRadius: '30px'
                }}
              />
              {passwordStrength.message && (
                <div className="password-strength">
                  <div 
                    className="strength-meter"
                    style={{ 
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.message}
                  </span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword; 