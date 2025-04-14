import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import logo from '../../assets/logo.svg';

const HomePage = () => {
  return (
    <div className="home-container">
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
            <Link to="/signup" className="sign-up-btn">Sign up</Link>
            <Link to="/login" className="login-btn">Login →</Link>
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