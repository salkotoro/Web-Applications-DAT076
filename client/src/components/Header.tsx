import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { FaUser, FaSearch, FaSignOutAlt, FaEdit, FaPlus } from "react-icons/fa";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to the homepage with a "search" query parameter
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };
  

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <a className="navbar-brand" href="/">
          Project Manager
        </a>

        {/* Search Form */}
        <form className="d-flex mx-auto" onSubmit={handleSearch}>
          <div className="input-group" style={{ width: "400px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-primary" type="submit">
              <FaSearch />
            </button>
          </div>
        </form>

        {/* User Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-link dropdown-toggle text-decoration-none"
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FaUser className="me-2" />
            {user?.firstName} {user?.lastName}
          </button>
          {showDropdown && (
            <div className="dropdown-menu dropdown-menu-end show">
              <button
                className="dropdown-item"
                onClick={() => {
                  navigate("/profile");
                  setShowDropdown(false);
                }}
              >
                <FaEdit className="me-2" />
                Edit Profile
              </button>
                        <button
                className="dropdown-item"
                onClick={() => {
                  navigate("/create-project");
                  setShowDropdown(false);
                }}
              >
                <FaPlus className="me-2" />
                Create Project
              </button>
              <button
                className="dropdown-item text-danger"
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }}
              >
                <FaSignOutAlt className="me-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};