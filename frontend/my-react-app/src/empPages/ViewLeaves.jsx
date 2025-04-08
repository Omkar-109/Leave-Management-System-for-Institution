import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import "../styles/ViewLeaves.css";

const ViewLeaveApplications = () => {
    const [user, setUser] = useState(null);
    const [leaveData, setLeaveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);

        if (!storedUser?.id) {
            setError("Employee ID not found.");
            setLoading(false);
            return;
        }

        const fetchLeaveData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/employee/${storedUser.id}/leave`
                );
                setLeaveData(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch leave applications.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaveData();
    }, []);

    return (
        <div className="view-leaves-page">
            <Navbar />

            <div className="content">
                <h2>Your Leave Applications</h2>

                {loading && <p className="info-text">Loading...</p>}
                {error && <p className="error-text">{error}</p>}

                {!loading && !error && leaveData.length === 0 && (
                    <p className="info-text">No leave applications found.</p>
                )}

                {!loading && !error && leaveData.length > 0 && (
                    <div className="table-wrapper">
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    <th>Leave ID</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Type</th>
                                    <th>Reason</th>
                                    <th>PD Status</th>
                                    <th>Dean Status</th>
                                    <th>Overall Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveData.map((leave) => (
                                    <tr key={leave.leave_id}>
                                        <td>{leave.leave_id}</td>
                                        <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                                        <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                                        <td>{leave.leave_type || "N/A"}</td>
                                        <td>{leave.reason}</td>
                                        <td>{leave.program_director_status}</td>
                                        <td>{leave.dean_status}</td>
                                        <td>{leave.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewLeaveApplications;
