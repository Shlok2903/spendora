import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.svg';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });
  
  const { register, error } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' });
      return;
    }
    
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
    
    setPasswordStrength({ score, message, color });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (passwordStrength.score < 2) {
      newErrors.password = 'Please choose a stronger password';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('Please fix the errors in the form before submitting.');
      return;
    }
    
    setLoading(true);
    
    const userData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    };
    
    const result = await register(userData);
    setLoading(false);
    
    if (result && result.success) {
      if (result.requiresOTP) {
        // Navigate to OTP verification page
        toast.info('Please verify your email with the code sent to your inbox.');
        navigate('/verify-otp', {
          state: {
            email: result.email,
            verificationType: result.verificationType,
            userData: userData // Pass user data for account creation
          }
        });
      } else {
        // Regular registration success
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      }
    } else {
      // Only show toast error if there's no inline error from AuthContext
      if (!error) {
        toast.error('Registration failed. Please try again.');
      }
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-content-section">
        <div className="logo-container">
          <img src={logo} alt="Spendora Logo" className="logo" />
        </div>
        
        <div className="login-form-content">
          <h1 className="login-heading">Create an Account</h1>
          <p className="login-subheading">
            Join Spendora and take control of your finances
          </p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group form-group-half">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={{ 
                    border: '1px solid #1E1E1E',
                    borderRadius: '30px'
                  }}
                />
                {errors.first_name && <div className="input-error">{errors.first_name}</div>}
              </div>
              
              <div className="form-group form-group-half">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={{ 
                    border: '1px solid #1E1E1E',
                    borderRadius: '30px'
                  }}
                />
                {errors.last_name && <div className="input-error">{errors.last_name}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ 
                  border: '1px solid #1E1E1E',
                  borderRadius: '30px'
                }}
              />
              {errors.email && <div className="input-error">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
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
              {errors.password && <div className="input-error">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ 
                  border: '1px solid #1E1E1E',
                  borderRadius: '30px'
                }}
              />
              {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              <span className="login-button-text">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </span>
              <span className="login-arrow">→</span>
            </button>
            
            <div className="register-link">
              Already have an account? <RouterLink to="/login" style={{ color: '#0FBAE5' }}>Login</RouterLink>
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

export default Register; 