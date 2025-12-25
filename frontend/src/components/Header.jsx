import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>InterviewBit</h1>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/practice" className="nav-link">Practice</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <Link to="/subscription" className="nav-link">Subscription</Link>
                <span className="nav-link user-name">{user?.name}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

