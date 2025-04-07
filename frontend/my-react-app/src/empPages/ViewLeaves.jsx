import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar"; // Reuse your existing Navbar
import "../styles/ViewLeaves.css"; // Make sure this file exists

const ViewLeaveApplications = () => {
    const [user, setUser] = useState(null);
    const [leaveData, setLeaveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);

        if (!storedUser?.employee_id) {
            setError("Employee ID not found.");
            setLoading(false);
            return;
        }

        const fetchLeaveData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/employee/${storedUser.employee_id}/leave`
                );
                setLeaveData(response.data);
            } catch (err) {
                setError("Failed to fetch leave applications.");
                console.error(err);
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

                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && leaveData.length === 0 && (
                    <p>No leave applications found.</p>
                )}

                {!loading && !error && leaveData.length > 0 && (
                    <table className="leave-table">
                        <thead>
                            <tr>
                                <th>Leave ID</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Type</th>
                                
                                <th>PD Status</th>
                                <th>Dean Status</th>
                                <th>Reason</th>
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
                                    <td>{leave.program_director_status}</td>
                                    <td>{leave.dean_status}</td>
                                    <td>{leave.reason}</td>
                                    <td>{leave.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ViewLeaveApplications;
