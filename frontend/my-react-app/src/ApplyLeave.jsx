import React, { useState } from "react";
import "../styles/Employee.css";

const ApplyLeave = () => {
    const [leaveType, setLeaveType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:3000/apply-leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leaveType, fromDate, toDate, reason }),
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to apply for leave");

            alert("Leave applied successfully!");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Apply for Leave</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <label>Leave Type</label>
                    <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required>
                        <option value="">Select Leave Type</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Annual Leave">Annual Leave</option>
                    </select>

                    <label>From Date</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />

                    <label>To Date</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />

                    <label>Reason</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} required></textarea>

                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeave;
