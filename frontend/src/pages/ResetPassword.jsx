import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFromStorage, setEmailFromStorage] = useState('');
  const [otpFromStorage, setOtpFromStorage] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { resetPassword, error: authError } = useAuth();
  
  // Get email and OTP from location state or localStorage
  useEffect(() => {
    // Try to get from location state first
    let emailValue = location.state?.email || '';
    let otpValue = location.state?.otp_code || '';
    
    // If not in location state, try localStorage
    if (!emailValue || !otpValue) {
      const verified = localStorage.getItem('password_reset_verified') === 'true';
      const timestamp = parseInt(localStorage.getItem('password_reset_timestamp') || '0', 10);
      const expiryTime = 10 * 60 * 1000; // 10 minutes in milliseconds
      const isValid = verified && (Date.now() - timestamp < expiryTime);
      
      if (isValid) {
        emailValue = localStorage.getItem('password_reset_email') || '';
        otpValue = localStorage.getItem('password_reset_otp') || '';
        setEmailFromStorage(emailValue);
        setOtpFromStorage(otpValue);
      } else {
        // Clear invalid localStorage items
        localStorage.removeItem('password_reset_verified');
        localStorage.removeItem('password_reset_email');
        localStorage.removeItem('password_reset_otp');
        localStorage.removeItem('password_reset_timestamp');
      }
    }
    
    // If we still don't have valid values, redirect
    if (!emailValue || !otpValue) {
      toast.error('Missing required information. Please go through the verification process again.');
      navigate('/forgot-password');
    }
  }, [location.state, navigate, toast]);
  
  // Clean up localStorage on component unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('password_reset_verified');
      localStorage.removeItem('password_reset_email');
      localStorage.removeItem('password_reset_otp');
      localStorage.removeItem('password_reset_timestamp');
    };
  }, []);
  
  // Display auth context errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const validatePassword = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Get email and OTP from location state or local storage
    const email = location.state?.email || emailFromStorage;
    const otpCode = location.state?.otp_code || otpFromStorage;
    
    if (!email || !otpCode) {
      setError('Missing verification information. Please go through the process again.');
      setLoading(false);
      return;
    }
    
    // Use the resetPassword function from AuthContext
    const success = await resetPassword(email, otpCode, password, confirmPassword);
    
    setLoading(false);
    
    if (success) {
      // Clear localStorage on success
      localStorage.removeItem('password_reset_verified');
      localStorage.removeItem('password_reset_email');
      localStorage.removeItem('password_reset_otp');
      localStorage.removeItem('password_reset_timestamp');
      
      toast.success('Password reset successfully. Please login with your new password.');
      navigate('/login');
    } else if (!authError) {
      // Only show this error if there's no auth context error (which would be shown by the effect)
      setError('Failed to reset password. Please try again.');
    }
  };
  
  return (
    <Container maxWidth="sm" className="reset-container">
      <Paper elevation={3} className="reset-card">
        <Box className="reset-header">
          <Typography variant="h4" component="h1">
            Reset Your Password
          </Typography>
          <Typography variant="body1" className="reset-subtitle">
            Enter a new password for <strong>{location.state?.email || emailFromStorage}</strong>
          </Typography>
        </Box>
        
        <Box className="reset-content">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleResetPassword}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="reset-button"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword; 