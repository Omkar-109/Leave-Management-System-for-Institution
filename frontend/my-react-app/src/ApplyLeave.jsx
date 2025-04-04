import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import "./styles/ApplyLeave.css";

const ApplyLeave = () => {
    const [leaveType, setLeaveType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [contact, setContact] = useState("");
    const [reason, setReason] = useState("");
    const [address, setAddress] = useState("");
    const [leaveFile, setLeaveFile] = useState(null);
    const [isHqLeave, setIsHqLeave] = useState(null);
    const [isConfidential, setIsConfidential] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const formData = new FormData();
        formData.append("leaveType", leaveType);
        formData.append("fromDate", fromDate);
        formData.append("toDate", toDate);
        formData.append("contact", contact);
        formData.append("reason", reason);
        formData.append("address", address);
        formData.append("isHqLeave", isHqLeave);
        formData.append("isConfidential", isConfidential);
        if (leaveFile) formData.append("leaveFile", leaveFile);

        try {
            const response = await fetch("http://localhost:3000/apply-leave", {
                method: "POST",
                body: formData,
                credentials: "include",
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
        <>
            <Navbar />
            <h2 className="form-header">Apply for Leave</h2>
            {error && <p className="error-message">{error}</p>}

            <form className="leave-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-grid">
                    <div className="form-group">
                        <label>From Date:</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>To Date:</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Leave Type:</label>
                        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required>
                            <option value="">Select Leave Type</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Annual Leave">Annual Leave</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Contact No. During Leave:</label>
                        <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} required />
                    </div>

                    <div className="form-group full-width">
                        <label>Reason For Leave:</label>
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>Address During Leave:</label>
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} required></textarea>
                    </div>

                    <div className="form-group">
                        <label>Attach Leave Document:</label>
                        <input type="file" onChange={(e) => setLeaveFile(e.target.files[0])} accept=".jpg,.png,.jpeg,.gif,.pdf,.txt,.doc,.docx" />
                    </div>

                    <div className="form-group">
                        <label>Is Leaving Headquarters (H.Q)?</label>
                        <div className="radio-group">
                            <label><input type="radio" name="hqLeave" value="Yes" onChange={() => setIsHqLeave("Yes")} /> Yes</label>
                            <label><input type="radio" name="hqLeave" value="No" onChange={() => setIsHqLeave("No")} /> No</label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Is the Leave Confidential?</label>
                        <div className="radio-group">
                            <label><input type="radio" name="confidential" value="Yes" onChange={() => setIsConfidential("Yes")} /> Yes</label>
                            <label><input type="radio" name="confidential" value="No" onChange={() => setIsConfidential("No")} /> No</label>
                        </div>
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-button">Apply Leave</button>
                    <button type="reset" className="reset-button">Reset</button>
                </div>
            </form>
        </>
    );
};

export default ApplyLeave;
