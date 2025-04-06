import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import "../styles/PDDashboard.css";

const PDDashboard = ({ user }) => {
    const [leaves, setLeaves] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedLeaveId, setSelectedLeaveId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchLeaves = async () => {
        try {
            const response = await axios.get("http://localhost:3000/leaves");
            setLeaves(response.data.leaves);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to fetch leave applications.");
        }
    };

    const handleApprove = async (leaveId) => {
        try {
            await axios.put("http://localhost:3000/leave/update-status", {
                leave_id: leaveId,
                role: "program director",
                status: "approved",
            });
            fetchLeaves(); // Refresh after approval
        } catch (err) {
            console.error("Approval failed:", err.message);
        }
    };

    const openRejectionModal = (leaveId) => {
        setSelectedLeaveId(leaveId);
        setRejectionReason("");
        setShowModal(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) return;

        try {
            await axios.put("http://localhost:3000/leave/update-status", {
                leave_id: selectedLeaveId,
                role: "program director",
                status: "rejected",
                reason: rejectionReason,
            });
            setShowModal(false);
            fetchLeaves(); // Refresh after rejection
        } catch (err) {
            console.error("Rejection failed:", err.message);
        }
    };

    useEffect(() => {
        if (showTable) fetchLeaves();
    }, [showTable]);

    return (
        <div className="pd-dashboard">
            <Navbar user={user} />
            <div className="pd-container">
                <h2>Program Director Dashboard</h2>
                <button className="toggle-btn" onClick={() => setShowTable(!showTable)}>
                    {showTable ? "Hide Leave Applications" : "Show Leave Applications"}
                </button>

                {error && <p className="error-msg">{error}</p>}

                {showTable && leaves.length > 0 && (
                    <table className="pd-table">
                        <thead>
                            <tr>
                                <th>Leave ID</th>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave.leave_id}>
                                    <td>{leave.leave_id}</td>
                                    <td>{leave.employee_id}</td>
                                    <td>{leave.name}</td>
                                    <td>{leave.leave_type}</td>
                                    <td>{leave.start_date}</td>
                                    <td>{leave.end_date}</td>
                                    <td>{leave.reason}</td>
                                    <td>{leave.program_director_status}</td>
                                    <td>
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleApprove(leave.leave_id)}
                                            disabled={leave.program_director_status !== "pending"}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => openRejectionModal(leave.leave_id)}
                                            disabled={leave.program_director_status !== "pending"}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showTable && leaves.length === 0 && <p>No leave applications found.</p>}

                {/* Rejection Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Enter Rejection Reason</h3>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Type your reason here..."
                            ></textarea>
                            <div className="modal-buttons">
                                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="submit-btn" onClick={handleRejectSubmit}>Submit</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDDashboard;
