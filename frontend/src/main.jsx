import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/axiosConfig'; // Import axios config before App
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
