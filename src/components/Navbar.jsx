import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleProfileMenuOpen = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleNotificationsOpen = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content container">
        <div className="flex items-center gap-2">
          <button className="btn-icon lg:hidden" onClick={onMenuClick} aria-label="Menu">
            {/* <i className="icon">☰</i> */}
          </button>
          <Link to="/dashboard" className="navbar-brand">
            <img src="/favicon.svg" alt="Finance Portal Logo" />
            <span>Finance AI</span>
          </Link>
        </div>

        {/* <div className="search-bar">
          <i className="icon">🔍</i>
          <input type="text" placeholder="Search documents..." />
        </div> */}

        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="btn-icon" onClick={handleNotificationsOpen} aria-label="Notifications">
              <i className="icon">🔔</i>
              <span className="badge">3</span>
            </button>
            {showNotifications && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="text-bold">Notifications</div>
                </div>
                <div className="dropdown-item">
                  <i className="icon">📄</i>
                  <div>
                    <div className="text-bold">New document uploaded</div>
                    <div className="text-small text-muted">2 minutes ago</div>
                  </div>
                </div>
                <div className="dropdown-item">
                  <i className="icon">✅</i>
                  <div>
                    <div className="text-bold">Processing complete</div>
                    <div className="text-small text-muted">10 minutes ago</div>
                  </div>
                </div>
                <div className="dropdown-item">
                  <i className="icon">🔄</i>
                  <div>
                    <div className="text-bold">System update</div>
                    <div className="text-small text-muted">1 hour ago</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-bold">
                  View all notifications
                </button>
              </div>
            )}
          </div>

          <button className="btn-icon" aria-label="Help">
            <i className="icon">❓</i>
          </button>

          <div className="relative">
            <button className="avatar" onClick={handleProfileMenuOpen}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </button>
            {showProfileMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="text-bold">{user?.email}</div>
                  {/* <div className="text-small text-muted">Administrator</div> */}
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="icon">👤</i> Profile
                </button>
                <button className="dropdown-item">
                  <i className="icon">⚙️</i> Settings
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="icon">🚪</i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 