import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import "../styles/ApplyLeave.css";

const ApplyLeave = () => {
    const [employeeId, setEmployeeId] = useState("");
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [leaveType, setLeaveType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [pdf, setPdf] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const res = await fetch("http://localhost:3000/leave-types");
                const data = await res.json();
                setLeaveTypes(data);
            } catch (err) {
                console.error("Failed to fetch leave types", err);
                setError("Unable to load leave types.");
            }
        };

        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === "employee") {
            setEmployeeId(user.id); // ✅ Fixed: using correct key
        }

        fetchLeaveTypes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const formData = new FormData();
        formData.append("employee_id", employeeId);
        formData.append("start_date", fromDate);
        formData.append("end_date", toDate);
        formData.append("leave_type", leaveType);
        formData.append("reason", reason);
        if (pdf) {
            formData.append("pdf", pdf);
        }

        try {
            const response = await fetch("http://localhost:3000/apply-leave", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to apply for leave");

            alert("Leave applied successfully!");
            navigate("/employee-dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="apply-leave">
            <Navbar />
            <h2 className="form-header">Apply for Leave</h2>
            {error && <p className="error-message">{error}</p>}

            <form className="leave-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Employee ID:</label>
                        <input
                            type="text"
                            value={employeeId}
                            disabled
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>From Date:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>To Date:</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Leave Type:</label>
                        <select
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            required
                        >
                            <option value="">Select Leave Type</option>
                            {leaveTypes.map((type) => (
                                <option key={type.leave_type_id} value={type.leave_type}>
                                    {type.leave_type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Reason For Leave:</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>Supporting Document (Optional PDF):</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setPdf(e.target.files[0])}
                        />
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-button">Apply Leave</button>
                    <button type="reset" className="reset-button">Reset</button>
                </div>
            </form>
        </div>
    );
};

export default ApplyLeave;
