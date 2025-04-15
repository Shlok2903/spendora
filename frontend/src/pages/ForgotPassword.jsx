import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from '../lib/axiosConfig';
import { useToast } from '../context/ToastContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/auth/request-otp/', {
        email,
        verification_type: 'password_reset'
      });
      
      setLoading(false);
      setSuccess(true);
      toast.success('Password reset code sent to your email');
      
      // Navigate to OTP verification page
      navigate('/verify-otp', {
        state: {
          email,
          verificationType: 'password_reset'
        }
      });
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 'Failed to send password reset email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  return (
    <Container maxWidth="sm" className="forgot-container">
      <Paper elevation={3} className="forgot-card">
        <Box className="forgot-header">
          <Typography variant="h4" component="h1">
            Forgot Password
          </Typography>
          <Typography variant="body1" className="forgot-subtitle">
            Enter your email address to receive a verification code
          </Typography>
        </Box>
        
        <Box className="forgot-content">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset code sent to your email
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleForgotPassword}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="forgot-button"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
            </Button>
            
            <Box className="forgot-footer">
              <Link component={RouterLink} to="/login" variant="body2">
                Remember your password? Login
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword; 