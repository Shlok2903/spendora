import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.svg';
import './Login.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [error, setError] = useState('');
  
  const { verifyOTP, requestOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  
  // Get email and verification type from location state
  const email = location.state?.email;
  const verificationType = location.state?.verificationType || 'login';
  
  useEffect(() => {
    if (!email) {
      navigate('/login');
      toast.error('Please provide an email address first.');
      return;
    }
    
    // Start countdown timer
    startTimer();
    
    // Focus on first input when component loads
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  const startTimer = () => {
    setTimer(30);
    setResendDisabled(true);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          setResendDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };
  
  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow single digit
    if (value && !/^\d+$/.test(value)) return;
    
    // Update the OTP array
    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = value.slice(0, 1);
      return newOtp;
    });
    
    // Auto-focus to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // Handle backspace - move to previous input if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    if (!/^\d+$/.test(pastedData)) return;
    
    // Fill as many inputs as we have digits (up to 6)
    const digits = pastedData.slice(0, 6).split('');
    
    setOtp(prev => {
      const newOtp = [...prev];
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      return newOtp;
    });
    
    // Focus on the appropriate input
    if (digits.length < 6 && inputRefs.current[digits.length]) {
      inputRefs.current[digits.length].focus();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await verifyOTP({
        email,
        otp: otpValue,
        verification_type: verificationType
      });
      
      if (result.success) {
        toast.success('Verification successful!');
        
        // Navigate based on verification type
        if (verificationType === 'registration') {
          navigate('/app/dashboard');
        } else if (verificationType === 'password_reset') {
          navigate('/reset-password', { 
            state: { 
              email, 
              token: otpValue // Pass the actual OTP code as token
            } 
          });
        } else {
          // Login case
          navigate('/app/dashboard');
        }
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const result = await requestOTP({
        email,
        verification_type: verificationType
      });
      
      if (result.success) {
        toast.success('A new verification code has been sent');
        startTimer();
      } else {
        toast.error(result.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      toast.error('Something went wrong. Please try again.');
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
          <h1 className="login-heading">Verification</h1>
          <p className="login-subheading">
            We've sent a verification code to <strong>{email}</strong>
          </p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  maxLength="1"
                  className="otp-input"
                  required
                  style={{ 
                    border: '1px solid #1E1E1E',
                    backgroundColor: '#fff',
                    borderRadius: '30px',
                    width: '50px',
                    height: '50px'
                  }}
                />
              ))}
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              <span className="login-button-text">
                {loading ? 'Verifying...' : 'Verify'}
              </span>
              <span className="login-arrow">→</span>
            </button>
            
            <div className="resend-code">
              {resendDisabled ? (
                <p>Resend code in {timer} seconds</p>
              ) : (
                <button 
                  type="button"
                  onClick={handleResendOTP}
                  className="resend-button"
                  disabled={loading}
                  style={{ color: '#0FBAE5' }}
                >
                  Resend code
                </button>
              )}
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

export default VerifyOTP; 