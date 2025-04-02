import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Employee.css";

const EmployeeDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="container">
            <div className="dashboard">
                <h1>Employee Dashboard</h1>
                <div className="button-container">
                    <div className="button" onClick={() => navigate("/apply-leave")}>Apply for Leave</div>
                    <div className="button" onClick={() => navigate("/view-leaves")}>View Leave Applications</div>
                    <div className="button" onClick={() => navigate("/manage-account")}>Manage Account</div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
