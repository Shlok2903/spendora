import { useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import logo from '../assets/logo.svg';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const credentials = {
      email: email,
      password: password
    };
    
    console.log('Submitting login credentials as object:', { email });
    const success = await login(credentials);
    setLoading(false);
    
    if (success) {
      toast.success('Login successful! Welcome back.');
      navigate('/app');
    } else {
      // Only show toast error if there's no inline error from AuthContext
      if (!error) {
        toast.error('Login failed. Please check your credentials.');
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
          <h1 className="login-heading">Hello Again!</h1>
          <p className="login-subheading">Welcome Back!</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
              Login
              <ArrowForward />
            </button>
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