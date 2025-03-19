import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { 
  FaUser, 
  FaSignOutAlt, 
  FaUserPlus, 
  FaUserEdit, 
  FaHome, 
  FaTasks, 
  FaUsers, 
  FaBell, 
  FaBuilding,
} from "react-icons/fa";
import MiniRegisterModal from "./MiniRegisterModal";
import "./Header.css";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user, logout, isAuthenticated, isEmployer, isEmployee } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refresh header when authentication state changes
  const [_, setAuthState] = useState(isAuthenticated());
  
  // Mock notifications for demo purposes
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New applicant for Web Developer project", read: false },
    { id: 2, message: "Project status updated: UX Design", read: true }
  ]);
  
  useEffect(() => {
    setAuthState(isAuthenticated());
  }, [user, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  const handleRegisterClick = () => {
    setShowDropdown(false);
    setShowRegisterModal(true);
  };
  
  const handleModalClose = () => {
    setShowRegisterModal(false);
    // Ensure header updates after registration
    setAuthState(isAuthenticated());
  };
  
  const handleNotificationClick = (id: number) => {
    // Mark notification as read
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    // Close the dropdown
    setShowNotifications(false);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Check if the current path is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Project Hub
          </Link>

          {/* Navigation Links - Only show when user is authenticated */}
          {isAuthenticated() && (
            <nav className="main-nav">
              <ul className="nav-links">
                <li className={isActive('/') ? 'active' : ''}>
                  <Link to="/">
                    <FaHome className="me-1" /> Home
                  </Link>
                </li>
                
                {/* Employer specific links */}
                {isEmployer() && (
                  <>
                    <li className={isActive('/projects/manage') ? 'active' : ''}>
                      <Link to="/projects/manage">
                        <FaBuilding className="me-1" /> My Projects
                      </Link>
                    </li>
                    <li className={isActive('/applicants') ? 'active' : ''}>
                      <Link to="/applicants">
                        <FaUsers className="me-1" /> Applicants
                      </Link>
                    </li>
                  </>
                )}
                
                {/* Employee specific links */}
                {isEmployee() && (
                  <>
                    <li className={location.pathname.includes('/applications') ? 'active' : ''}>
                      <Link to="/applications">
                        <FaTasks className="me-1" /> My Applications
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          )}

          <div className="header-actions">
            {/* Notifications - Only show when user is authenticated */}
            {isAuthenticated() && (
              <div className="notification-container me-3">
                <button 
                  className="notification-btn" 
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {showNotifications && (
                  <div className="dropdown-menu notification-menu show">
                    <div className="dropdown-header">
                      <span>Notifications</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    {notifications.length === 0 ? (
                      <div className="dropdown-item text-muted">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <button 
                          key={notification.id}
                          className={`dropdown-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          {notification.message}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* User Profile Dropdown */}
            <div className="dropdown-container">
              <button
                className="profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUser />
              </button>
              {showDropdown && (
                <div className="dropdown-menu show">
                  {user ? (
                    <>
                      <div className="dropdown-header">
                        <span>{user.firstName} {user.lastName}</span>
                        <small>{user.email}</small>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate("/profile");
                          setShowDropdown(false);
                        }}
                      >
                        <FaUserEdit className="me-2" />
                        Edit Profile
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="me-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate("/login");
                          setShowDropdown(false);
                        }}
                      >
                        Login
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={handleRegisterClick}
                      >
                        <FaUserPlus className="me-2" />
                        Quick Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <MiniRegisterModal 
        show={showRegisterModal} 
        onHide={handleModalClose} 
      />
    </header>
  );
};

export default Header;
