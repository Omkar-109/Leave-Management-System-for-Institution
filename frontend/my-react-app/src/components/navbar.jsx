import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const [employeeName, setEmployeeName] = useState("User");
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchEmployeeName = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user?.employee_id) {
                    setErrorMsg("Employee ID not found.");
                    return;
                }

                const response = await axios.get(`http://localhost:3000/employee/${user.employee_id}`);
                const emp = response?.data?.employee;

                if (emp?.name) {
                    setEmployeeName(emp.name);
                } else {
                    setErrorMsg("Name not found.");
                }
            } catch (error) {
                console.error("Error fetching employee name:", error);
                setErrorMsg("Failed to fetch employee name.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeName();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/", { replace: true });
    };

    return (
        <nav className="navbar">
            <div className="navbar-title">University</div>

            <div className="navbar-user">
                <button 
                    className="user-btn"
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                    {loading ? "Loading..." : errorMsg ? "User" : employeeName} ▼
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
