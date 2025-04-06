import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import "../styles/DeanDashboard.css";

const DeanDashboard = ({ user }) => {
    const [leaves, setLeaves] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [error, setError] = useState("");
    const [rejectionModal, setRejectionModal] = useState({ show: false, leaveId: null, reason: "" });

    const fetchLeaves = async () => {
        try {
            const response = await axios.get("http://localhost:3000/leaves");
            const approvedByPD = response.data.leaves.filter(leave => leave.program_director_status === "approved");
            setLeaves(approvedByPD);
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
                role: "dean",
                status: "approved"
            });
            fetchLeaves();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = (leaveId) => {
        setRejectionModal({ show: true, leaveId, reason: "" });
    };

    const confirmReject = async () => {
        const { leaveId, reason } = rejectionModal;
        if (!reason.trim()) return;

        try {
            await axios.put("http://localhost:3000/leave/update-status", {
                leave_id: leaveId,
                role: "dean",
                status: "rejected"
            });
            setRejectionModal({ show: false, leaveId: null, reason: "" });
            fetchLeaves();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (showTable) fetchLeaves();
    }, [showTable]);

    return (
        <div className="dean-dashboard">
            <Navbar user={user} />
            <div className="dean-container">
                <h2>Dean Dashboard</h2>
                <button className="toggle-btn" onClick={() => setShowTable(!showTable)}>
                    {showTable ? "Hide Leave Applications" : "Show Leave Applications"}
                </button>

                {error && <p className="error-msg">{error}</p>}

                {showTable && leaves.length > 0 && (
                    <table className="dean-table">
                        <thead>
                            <tr>
                                <th>Leave ID</th>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Reason</th>
                                <th>PD Status</th>
                                <th>Dean Status</th>
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
                                    <td>{leave.dean_status}</td>
                                    <td>
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleApprove(leave.leave_id)}
                                            disabled={leave.dean_status !== "pending"}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleReject(leave.leave_id)}
                                            disabled={leave.dean_status !== "pending"}
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
            </div>

            {rejectionModal.show && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Reason for Rejection</h3>
                        <textarea
                            rows="4"
                            value={rejectionModal.reason}
                            onChange={(e) =>
                                setRejectionModal({ ...rejectionModal, reason: e.target.value })
                            }
                        />
                        <div className="modal-buttons">
                            <button className="approve-btn" onClick={confirmReject}>Submit</button>
                            <button className="reject-btn" onClick={() => setRejectionModal({ show: false, leaveId: null, reason: "" })}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeanDashboard;
