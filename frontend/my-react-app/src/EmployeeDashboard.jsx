import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx"; // Import Navbar
import Card from "./components/card.jsx"; // Import reusable Card component
import "./styles/Employee.css";

const EmployeeDashboard = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="employee-dashboard">
            {/* Navbar with user info */}
            <Navbar user={user} />

            <div className="dashboard-container">
                <div className="card-container">
                    <Card title="Apply for Leave" onClick={() => navigate("/apply-leave")} />
                    <Card title="View Leave Applications" onClick={() => navigate("/view-leaves")} />

                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
