import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import logo from '../../assets/logo.svg';

const HomePage = () => {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 500); // Match the exit animation duration
  };

  return (
    <div className={`home-container ${isExiting ? 'exit' : ''}`}>
      <div className="content-section">
        <div className="logo-container">
          <img src={logo} alt="Spendora Logo" className="logo" />
        </div>
        
        <div className="hero-content">
          <h1 className="main-heading">
            Efficient Money <span className="tracking-text">Tracking</span> <br />
            & Management
          </h1>
          
          <p className="sub-heading">
            Take full control of your money and achieve <br />
            financial stability with Spendora
          </p>
          
          <div className="cta-buttons">
            <button 
              onClick={() => handleNavigation('/register')} 
              className="sign-up-btn"
            >
              Sign up
            </button>
            <button 
              onClick={() => handleNavigation('/login')} 
              className="login-btn"
            >
              Login →
            </button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-preview">
        {/* Abstract background is handled by CSS */}
      </div>
    </div>
  );
};

export default HomePage; 