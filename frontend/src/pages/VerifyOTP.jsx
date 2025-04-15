import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button,
  CircularProgress, 
  Alert
} from '@mui/material';
import axios from '../lib/axiosConfig';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import OtpInput from 'react-otp-input';
import './OTPVerification.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { verifyOTP } = useAuth();
  
  // Get email and verification type from location state
  const email = location.state?.email || '';
  const verificationType = location.state?.verificationType || 'registration';
  
  useEffect(() => {
    if (!email) {
      navigate('/login');
      toast.error('Email address is missing. Please try again.');
    }
  }, [email, navigate, toast]);
  
  // Timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time left as minutes:seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Get verification data from location state
    const userData = location.state?.userData; // Get userData for registration
    
    if (!email || !verificationType) {
      setError('Missing verification information. Please try again.');
      setLoading(false);
      return;
    }
    
    try {
      // For registration, pass the full userData for account creation
      const success = await verifyOTP(email, otp, verificationType, 
                                     verificationType === 'registration' ? userData : null);
      
      if (success) {
        toast.success('Verification successful!');
        
        // Redirect based on verification type
        if (verificationType === 'password_reset') {
          // Store verification status for password reset flow
          localStorage.setItem('password_reset_verified', 'true');
          localStorage.setItem('password_reset_email', email);
          localStorage.setItem('password_reset_otp', otp);
          localStorage.setItem('password_reset_timestamp', Date.now().toString());
          
          // For password reset, redirect to reset password page
          navigate('/reset-password', {
            state: {
              email: email,
              otp_code: otp
            }
          });
        } else {
          // For registration or login, redirect to app
          navigate('/app');
        }
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setError('An error occurred during verification. Please try again.');
    }
    
    setLoading(false);
  };
  
  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/auth/request-otp/', {
        email,
        verification_type: verificationType
      });
      
      setTimeLeft(600); // Reset timer to 10 minutes
      setResendLoading(false);
      toast.success('New OTP has been sent to your email');
    } catch (err) {
      setResendLoading(false);
      const errorMessage = err.response?.data?.error || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  const getTitle = () => {
    switch (verificationType) {
      case 'registration':
        return 'Verify Your Email';
      case 'login':
        return 'Login Verification';
      case 'password_reset':
        return 'Reset Password';
      default:
        return 'Verification Required';
    }
  };
  
  return (
    <Container maxWidth="sm" className="otp-container">
      <Paper elevation={3} className="otp-card">
        <Box className="otp-header">
          <Typography variant="h4" component="h1">
            {getTitle()}
          </Typography>
          <Typography variant="body1" className="otp-subtitle">
            We've sent a verification code to <strong>{email}</strong>
          </Typography>
        </Box>
        
        <Box className="otp-content">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body2" className="otp-instruction">
            Enter the 6-digit code sent to your email
          </Typography>
          
          <div className="otp-input-container">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderSeparator={<span className="otp-separator"></span>}
              renderInput={(props) => <input {...props} className="otp-input" />}
              inputStyle="otp-input"
              shouldAutoFocus
            />
          </div>
          
          <Box className="otp-timer">
            <Typography variant="body2">
              {timeLeft > 0 ? `Code expires in ${formatTimeLeft()}` : 'Code has expired!'}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading || otp.length !== 6}
            className="verify-button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
          </Button>
          
          <Box className="otp-footer">
            <Typography variant="body2">
              Didn't receive the code?
            </Typography>
            <Button
              onClick={handleResendOTP}
              disabled={resendLoading || timeLeft > 0}
              color="primary"
              className="resend-button"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
              {timeLeft > 0 && ` (${formatTimeLeft()})`}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyOTP; 