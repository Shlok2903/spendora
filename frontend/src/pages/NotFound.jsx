import { Link as RouterLink } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-message">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <RouterLink to="/app/dashboard" className="not-found-button">
        Back to Dashboard
      </RouterLink>
    </div>
  );
};

export default NotFound; 