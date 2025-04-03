import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css"; // Navbar styling

const Navbar = ({ user }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("user"); // Clear session
        navigate("/", { replace: true });// Redirect to login
    };

    return (
        <nav className="navbar">
            <div className="navbar-title">University</div>

            <div className="navbar-user">
                <button 
                    className="user-btn" 
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                    {user?.email || "User"} ▼
                </button>

                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={() => navigate("/profile")}>View Profile</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
