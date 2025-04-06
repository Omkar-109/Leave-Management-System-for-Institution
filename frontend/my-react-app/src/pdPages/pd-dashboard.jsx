import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import "./styles/PDDashboard.css";

const PDDashboard = ({ user }) => {
    const [leaves, setLeaves] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [error, setError] = useState("");

    const fetchLeaves = async () => {
        try {
            const response = await axios.get("http://localhost:3000/pd/leave-applications");
            setLeaves(response.data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to fetch leave applications.");
        }
    };

    const handleDecision = async (leaveId, decision) => {
        let rejectionReason = "";

        if (decision === "rejected") {
            rejectionReason = prompt("Enter reason for rejection:");
            if (!rejectionReason) return alert("Rejection reason is required.");
        }

        try {
            const res = await axios.post("http://localhost:3000/pd/leave-decision", {
                leave_id: leaveId,
                decision,
                reason: rejectionReason,
            });

            alert(res.data.message);
            fetchLeaves(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Action failed.");
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
                                    <td>{leave.leave_type}</td>
                                    <td>{leave.start_date}</td>
                                    <td>{leave.end_date}</td>
                                    <td>{leave.reason}</td>
                                    <td>{leave.program_director_status}</td>
                                    <td>
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleDecision(leave.leave_id, "approved")}
                                            disabled={leave.program_director_status !== "pending"}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleDecision(leave.leave_id, "rejected")}
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
            </div>
        </div>
    );
};

export default PDDashboard;
